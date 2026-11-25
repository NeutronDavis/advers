"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { getSession } from "@/lib/session";
import {
  compareMoney,
  formatMoney,
  parseMoney,
  toDecimalString,
  type Money,
} from "@/lib/money";
import {
  convertNgnToUsdc,
  isValidPolygonAddress,
  mockNgnPerUsdc,
  normalizePolygonAddress,
  paymentProviderName,
  withdrawalFeeUsdc,
  WALLET_NETWORK,
} from "@/lib/wallet";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { postLedgerTransaction } from "@/server/ledger";
import { ensureUsdcWallet, getUsdcAvailableMinor } from "@/server/data/wallet";
import { getPaymentProvider } from "@/server/payments";
import { settlePayout } from "@/server/payments/processing";
import { issueStepUpToken, consumeStepUpToken } from "@/server/security/step-up";
import { getTwoFactorState, verifyUserTotp } from "@/server/security/two-factor";

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

async function advertiserSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.context !== "USER") return null;
  if (!session.clientId) return null;
  return session;
}

function minimumFundingNgn(): number {
  const value = Number(process.env.MIN_FUNDING_NGN ?? "1000");
  return Number.isFinite(value) && value > 0 ? value : 1000;
}

function maximumFundingNgn(): number {
  const value = Number(process.env.MAX_FUNDING_NGN ?? "10000000");
  return Number.isFinite(value) && value > 0 ? value : 10_000_000;
}

async function rateLimitMessage(
  key: string,
  limit: number,
  windowMs: number,
  message: string
): Promise<string | null> {
  const result = await enforceRateLimit(key, limit, windowMs);
  if (result.allowed) return null;
  return `${message} Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`;
}

export interface FundWalletResult {
  success: true;
  reference: string;
  checkoutUrl: string;
}

export async function fundWalletAction(input: {
  amountNgn: string;
}): Promise<FundWalletResult | { success: false; error: string }> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const limited = await rateLimitMessage(
    `fund:${session.id}`,
    10,
    60_000,
    "Too many funding attempts."
  );
  if (limited) return { success: false, error: limited };

  let ngn: Money;
  try {
    ngn = parseMoney(input.amountNgn, "NGN");
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Enter a valid amount.",
    };
  }

  const minimum = parseMoney(minimumFundingNgn(), "NGN");
  if (compareMoney(ngn, minimum) < 0) {
    return {
      success: false,
      error: `Minimum funding amount is ${formatMoney(minimum)}.`,
    };
  }
  const maximum = parseMoney(maximumFundingNgn(), "NGN");
  if (compareMoney(ngn, maximum) > 0) {
    return {
      success: false,
      error: `Maximum funding amount is ${formatMoney(maximum)} per transaction.`,
    };
  }

  const rate = mockNgnPerUsdc();
  const usdc = convertNgnToUsdc(ngn, rate);
  if (usdc.amountMinor <= BigInt(0)) {
    return { success: false, error: "Amount is too small to convert to USDC." };
  }

  const quote = await prisma.fxQuote.create({
    data: {
      baseCurrency: "NGN",
      quoteCurrency: "USDC",
      rate: new Prisma.Decimal(rate.toFixed(12)),
      provider: paymentProviderName(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const wallet = await ensureUsdcWallet(session.id);
  if (wallet.status !== "ACTIVE") {
    return {
      success: false,
      error: "Your wallet is not active. Contact support before funding.",
    };
  }
  const reference = `FUND-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const provider = getPaymentProvider();

  const sessionResult = await provider.createOnrampSession({
    userId: session.id,
    reference,
    amountNgn: toDecimalString(ngn),
    amountUsdc: toDecimalString(usdc),
    network: WALLET_NETWORK,
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "ONRAMP_PENDING",
      amount: 0,
      currency: "USDC",
      network: WALLET_NETWORK,
      amountMinor: usdc.amountMinor,
      reference,
      idempotencyKey: `fund:${reference}`,
      provider: provider.name,
      providerReference: sessionResult.providerReference,
      description: `Wallet funding: ${formatMoney(ngn)} at ₦${rate.toLocaleString("en-NG")}/USDC`,
      status: "PENDING",
      metadataJson: JSON.stringify({
        fxQuoteId: quote.id,
        rate,
        ngnMinor: ngn.amountMinor.toString(),
        usdcMinor: usdc.amountMinor.toString(),
        checkoutUrl: sessionResult.checkoutUrl,
      }),
    },
  });

  revalidatePath("/portal/wallet");
  return {
    success: true,
    reference,
    checkoutUrl: sessionResult.checkoutUrl,
  };
}

export async function completeMockOnrampAction(
  reference: string
): Promise<ActionResult> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };
  if (paymentProviderName() !== "mock") {
    return { success: false, error: "Mock checkout is disabled." };
  }

  const transaction = await prisma.walletTransaction.findUnique({
    where: { reference },
    include: { wallet: true },
  });
  if (!transaction || transaction.wallet.userId !== session.id) {
    return { success: false, error: "Funding request not found." };
  }
  if (!transaction.providerReference) {
    return { success: false, error: "Funding request has no provider reference." };
  }
  if (transaction.status === "SUCCESS") {
    return { success: true };
  }
  if (transaction.status !== "PENDING") {
    return { success: false, error: "This funding request is no longer pending." };
  }

  const { settleOnramp } = await import("@/server/payments/processing");
  await settleOnramp({
    eventId: `mock-${reference}`,
    type: "onramp.completed",
    data: {
      provider: "mock",
      providerReference: transaction.providerReference,
    },
  });

  revalidatePath("/portal/wallet");
  return { success: true };
}

export async function addPayoutDestinationAction(input: {
  label: string;
  address: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const limited = await rateLimitMessage(
    `address:${session.id}`,
    10,
    60_000,
    "Too many address changes."
  );
  if (limited) return { success: false, error: limited };

  const label = input.label.trim();
  const address = normalizePolygonAddress(input.address);
  if (label.length < 2 || label.length > 60) {
    return { success: false, error: "Give the address a name between 2 and 60 characters." };
  }
  if (!isValidPolygonAddress(address)) {
    return { success: false, error: "Enter a valid Polygon USDC wallet address." };
  }

  const existing = await prisma.payoutDestination.count({
    where: { userId: session.id },
  });

  try {
    const destination = await prisma.payoutDestination.create({
      data: {
        userId: session.id,
        label,
        address,
        network: WALLET_NETWORK,
        isDefault: existing === 0,
      },
    });
    revalidatePath("/portal/wallet");
    return { success: true, id: destination.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "That address is already saved." };
    }
    throw error;
  }
}

export async function disablePayoutDestinationAction(
  destinationId: string
): Promise<ActionResult> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const destination = await prisma.payoutDestination.findFirst({
    where: { id: destinationId, userId: session.id },
  });
  if (!destination) return { success: false, error: "Address not found." };

  await prisma.$transaction(async (tx) => {
    await tx.payoutDestination.update({
      where: { id: destination.id },
      data: { status: "DISABLED", isDefault: false },
    });
    if (destination.isDefault) {
      const next = await tx.payoutDestination.findFirst({
        where: { userId: session.id, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await tx.payoutDestination.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  revalidatePath("/portal/wallet");
  return { success: true };
}

export async function setDefaultPayoutDestinationAction(
  destinationId: string
): Promise<ActionResult> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const destination = await prisma.payoutDestination.findFirst({
    where: { id: destinationId, userId: session.id, status: "ACTIVE" },
  });
  if (!destination) return { success: false, error: "Address not found." };

  await prisma.$transaction([
    prisma.payoutDestination.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    }),
    prisma.payoutDestination.update({
      where: { id: destination.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/portal/wallet");
  return { success: true };
}

export async function verifyWithdrawalStepUpAction(input: {
  code: string;
}): Promise<ActionResult<{ token: string; expiresAt: string }>> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const limited = await rateLimitMessage(
    `totp:${session.id}`,
    5,
    60_000,
    "Too many authenticator attempts."
  );
  if (limited) return { success: false, error: limited };

  const state = await getTwoFactorState(session.id);
  if (!state.enabled) {
    return { success: false, error: "Enable two-factor authentication before withdrawing." };
  }
  const valid = await verifyUserTotp(session.id, input.code);
  if (!valid) {
    return { success: false, error: "That authenticator code is not valid." };
  }

  const issued = await issueStepUpToken(session.id, "WITHDRAWAL");
  return {
    success: true,
    token: issued.token,
    expiresAt: issued.expiresAt.toISOString(),
  };
}

export async function requestAdvertiserWithdrawalAction(input: {
  destinationId: string;
  amountUsdc: string;
  stepUpToken: string;
  idempotencyKey: string;
}): Promise<ActionResult<{ id: string; status: string }>> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };

  const limited = await rateLimitMessage(
    `withdraw:${session.id}`,
    5,
    60_000,
    "Too many withdrawal attempts."
  );
  if (limited) return { success: false, error: limited };

  const consumed = await consumeStepUpToken({
    userId: session.id,
    token: input.stepUpToken,
    action: "WITHDRAWAL",
  });
  if (!consumed) {
    return {
      success: false,
      error: "Your verification expired. Enter a new authenticator code.",
    };
  }

  const existing = await prisma.advertiserWithdrawal.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) {
    if (existing.userId !== session.id) {
      return { success: false, error: "Duplicate withdrawal key." };
    }
    return { success: true, id: existing.id, status: existing.status };
  }

  let amount: Money;
  let fee: Money;
  try {
    amount = parseMoney(input.amountUsdc, "USDC");
    fee = parseMoney(withdrawalFeeUsdc(), "USDC");
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Enter a valid amount.",
    };
  }
  if (amount.amountMinor <= BigInt(0)) {
    return { success: false, error: "Enter a withdrawal amount." };
  }

  const total: Money = {
    amountMinor: amount.amountMinor + fee.amountMinor,
    currency: "USDC",
  };
  const availableMinor = await getUsdcAvailableMinor(session.id);
  const available: Money = { amountMinor: availableMinor, currency: "USDC" };
  if (compareMoney(total, available) > 0) {
    return {
      success: false,
      error: `You can withdraw up to ${formatMoney(available)} including fees.`,
    };
  }

  const destination = await prisma.payoutDestination.findFirst({
    where: { id: input.destinationId, userId: session.id, status: "ACTIVE" },
  });
  if (!destination) {
    return { success: false, error: "Choose an active payout address." };
  }
  if (destination.network !== WALLET_NETWORK || !isValidPolygonAddress(destination.address)) {
    return { success: false, error: "The payout address is not a valid Polygon USDC address." };
  }

  const wallet = await ensureUsdcWallet(session.id);
  if (wallet.status !== "ACTIVE") {
    return { success: false, error: "Your wallet is not active. Contact support." };
  }
  const reference = `WDR-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const provider = getPaymentProvider();

  const withdrawal = await prisma.advertiserWithdrawal.create({
    data: {
      userId: session.id,
      destinationId: destination.id,
      amountMinor: amount.amountMinor,
      feeMinor: fee.amountMinor,
      currency: "USDC",
      network: WALLET_NETWORK,
      status: "REQUESTED",
      idempotencyKey: input.idempotencyKey,
      requestedAt: new Date(),
    },
  });

  await postLedgerTransaction({
    type: "WITHDRAWAL",
    reference: `LEDGER-WDR-${withdrawal.id}`,
    idempotencyKey: `withdrawal:${withdrawal.id}`,
    metadata: { destinationId: destination.id, providerReference: null },
    lines: [
      {
        account: { userId: session.id, type: "AVAILABLE", currency: "USDC", network: WALLET_NETWORK },
        direction: "DEBIT",
        money: total,
      },
      {
        account: { userId: session.id, type: "PAYOUT_CLEARING", currency: "USDC", network: WALLET_NETWORK },
        direction: "CREDIT",
        money: total,
      },
    ],
  });

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { availableBalanceMinor: { decrement: total.amountMinor } },
  });

  const releaseHold = async (reason: string) => {
    await postLedgerTransaction({
      type: "REFUND",
      reference: `LEDGER-WDR-REVERSE-${withdrawal.id}`,
      idempotencyKey: `withdrawal-reverse:${withdrawal.id}`,
      metadata: { withdrawalId: withdrawal.id },
      lines: [
        {
          account: { userId: session.id, type: "PAYOUT_CLEARING", currency: "USDC", network: WALLET_NETWORK },
          direction: "DEBIT",
          money: total,
        },
        {
          account: { userId: session.id, type: "AVAILABLE", currency: "USDC", network: WALLET_NETWORK },
          direction: "CREDIT",
          money: total,
        },
      ],
    });
    await prisma.$transaction([
      prisma.advertiserWithdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "FAILED", processedAt: new Date(), notes: reason },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { availableBalanceMinor: { increment: total.amountMinor } },
      }),
    ]);
    await dispatchNotificationSafe({
      userId: session.id,
      event: "WITHDRAWAL_FAILED",
      title: "Withdrawal failed",
      body: `${formatMoney(total)} was returned to your wallet.`,
      link: "/portal/wallet",
    });
    revalidatePath("/portal/wallet");
  };

  let payout;
  try {
    payout = await provider.createPayout({
      userId: session.id,
      reference: withdrawal.id,
      amountUsdc: toDecimalString(amount),
      address: destination.address,
      network: WALLET_NETWORK,
    });
  } catch (error) {
    await releaseHold(error instanceof Error ? error.message : "Provider call failed.");
    return {
      success: false,
      error: "The payout provider could not start the withdrawal. Funds were released.",
    };
  }

  await prisma.advertiserWithdrawal.update({
    where: { id: withdrawal.id },
    data: {
      provider: payout.provider,
      providerReference: payout.providerReference,
      status: payout.status === "FAILED" ? "FAILED" : "PROCESSING",
      processedAt: new Date(),
    },
  });

  if (payout.status === "FAILED") {
    await releaseHold("Provider rejected the payout.");
    return {
      success: false,
      error: "The payout provider rejected the withdrawal. Funds were released.",
    };
  }

  if (payout.status === "PAID") {
    try {
      await settlePayout({
        eventId: `payout-${withdrawal.id}`,
        type: "payout.paid",
        data: { providerReference: payout.providerReference },
      });
    } catch {
      // The provider has paid; leave the withdrawal in PROCESSING for the
      // reconciliation queue rather than reversing a real payout.
    }
  }

  if (payout.status !== "PAID") {
    await dispatchNotificationSafe({
      userId: session.id,
      event: "WITHDRAWAL_SUBMITTED",
      title: "Withdrawal submitted",
      body: `${formatMoney(amount)} USDC is being sent to ${destination.label}.`,
      link: "/portal/wallet",
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "ADVERTISER_WITHDRAWAL_REQUESTED",
      description: `Requested a ${formatMoney(amount)} USDC withdrawal to ${destination.label}.`,
      metadata: JSON.stringify({
        withdrawalId: withdrawal.id,
        destinationId: destination.id,
        feeMinor: fee.amountMinor.toString(),
      }),
    },
  });

  revalidatePath("/portal/wallet");
  return {
    success: true,
    id: withdrawal.id,
    status: payout.status === "PAID" ? "PAID" : "PROCESSING",
  };
}

export async function getAvailableUsdcAction(): Promise<
  ActionResult<{ availableMinor: string; feeMinor: string; fxRate: number }>
> {
  const session = await advertiserSession();
  if (!session) return { success: false, error: "Sign in with an advertiser account." };
  const availableMinor = await getUsdcAvailableMinor(session.id);
  const fee = parseMoney(withdrawalFeeUsdc(), "USDC");
  return {
    success: true,
    availableMinor: availableMinor.toString(),
    feeMinor: fee.amountMinor.toString(),
    fxRate: mockNgnPerUsdc(),
  };
}
