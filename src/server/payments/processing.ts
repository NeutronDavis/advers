import type { AdvertiserWithdrawal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  formatMoney,
  isCurrencyCode,
  isPaymentNetwork,
  type CurrencyCode,
  type PaymentNetwork,
} from "@/lib/money";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { postLedgerTransaction } from "@/server/ledger";
import type { NormalizedProviderEvent } from "./types";

function transactionCurrency(currency: string): CurrencyCode {
  return isCurrencyCode(currency) ? currency : "NGN";
}

function transactionNetwork(
  currency: CurrencyCode,
  network: string | null
): PaymentNetwork | "NONE" {
  if (currency === "USDC" && network && isPaymentNetwork(network)) {
    return network;
  }
  return "NONE";
}

function parseMetadata(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function settleOnramp(
  event: NormalizedProviderEvent
): Promise<{ alreadyProcessed: boolean }> {
  const providerReference = String(event.data.providerReference ?? "");
  if (!providerReference) {
    throw new Error("onramp.completed is missing providerReference.");
  }

  const transaction = await prisma.walletTransaction.findFirst({
    where: { providerReference },
    include: { wallet: true },
  });
  if (!transaction) {
    throw new Error(`No wallet transaction for provider reference ${providerReference}.`);
  }
  if (transaction.status === "SUCCESS") {
    return { alreadyProcessed: true };
  }

  const amount = transaction.amountMinor ?? BigInt(0);
  if (amount <= BigInt(0)) {
    throw new Error("Cannot settle an on-ramp without a positive USDC amount.");
  }
  const currency = transactionCurrency(transaction.currency);
  const network = transactionNetwork(currency, transaction.network);
  if (currency !== "USDC") {
    throw new Error("On-ramp settlement requires a USDC wallet transaction.");
  }

  await postLedgerTransaction({
    type: "DEPOSIT",
    reference: `LEDGER-ONRAMP-${transaction.id}`,
    idempotencyKey: `onramp:${transaction.id}`,
    metadata: {
      provider: event.data.provider ?? "mock",
      providerReference,
      eventId: event.eventId,
    },
    lines: [
      {
        account: { userId: transaction.wallet.userId, type: "AVAILABLE", currency, network },
        direction: "CREDIT",
        money: { amountMinor: amount, currency },
      },
      {
        account: { userId: null, type: "PROVIDER_SETTLEMENT", currency, network },
        direction: "DEBIT",
        money: { amountMinor: amount, currency },
      },
    ],
  });

  await prisma.$transaction([
    prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", completedAt: new Date() },
    }),
    prisma.wallet.update({
      where: { id: transaction.walletId },
      data: {
        currency,
        network,
        status: "ACTIVE",
        availableBalanceMinor: { increment: amount },
      },
    }),
  ]);

  const metadata = parseMetadata(transaction.metadataJson);
  const fxQuoteId = typeof metadata.fxQuoteId === "string" ? metadata.fxQuoteId : null;
  if (fxQuoteId) {
    await prisma.fxQuote.updateMany({
      where: { id: fxQuoteId, status: "ACTIVE" },
      data: { status: "CONSUMED", consumedAt: new Date() },
    });
  }

  await dispatchNotificationSafe({
    userId: transaction.wallet.userId,
    event: "WALLET_FUNDED",
    title: "Wallet funded",
    body: `${formatMoney({ amountMinor: amount, currency })} is now available in your wallet.`,
    link: "/portal/wallet",
  });

  return { alreadyProcessed: false };
}

export async function failOnramp(
  event: NormalizedProviderEvent
): Promise<{ alreadyProcessed: boolean }> {
  const providerReference = String(event.data.providerReference ?? "");
  if (!providerReference) {
    throw new Error("onramp.failed is missing providerReference.");
  }
  const transaction = await prisma.walletTransaction.findFirst({
    where: { providerReference },
  });
  if (!transaction) return { alreadyProcessed: true };
  if (transaction.status !== "PENDING") return { alreadyProcessed: true };

  await prisma.walletTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "FAILED",
      completedAt: new Date(),
      metadataJson: JSON.stringify({
        ...parseMetadata(transaction.metadataJson),
        failure: event.data.reason ?? "Provider reported failure.",
      }),
    },
  });
  const wallet = await prisma.wallet.findUnique({
    where: { id: transaction.walletId },
    select: { userId: true },
  });
  if (wallet) {
    await dispatchNotificationSafe({
      userId: wallet.userId,
      event: "WALLET_FUNDING_FAILED",
      title: "Wallet funding failed",
      body: "The funding attempt did not complete. No funds were added.",
      link: "/portal/wallet",
    });
  }
  return { alreadyProcessed: false };
}

export async function settlePayout(
  event: NormalizedProviderEvent
): Promise<{ alreadyProcessed: boolean }> {
  const providerReference = String(event.data.providerReference ?? "");
  if (!providerReference) {
    throw new Error("payout.paid is missing providerReference.");
  }
  const withdrawal = await prisma.advertiserWithdrawal.findFirst({
    where: { providerReference },
  });
  if (!withdrawal) {
    throw new Error(`No advertiser withdrawal for provider reference ${providerReference}.`);
  }
  if (withdrawal.status === "PAID") return { alreadyProcessed: true };

  const currency = transactionCurrency(withdrawal.currency);
  const network = transactionNetwork(currency, withdrawal.network);
  const total = withdrawal.amountMinor + withdrawal.feeMinor;

  await postLedgerTransaction({
    type: "PAYOUT",
    reference: `LEDGER-PAYOUT-${withdrawal.id}`,
    idempotencyKey: `payout:${withdrawal.id}`,
    metadata: {
      providerReference,
      eventId: event.eventId,
    },
    lines: [
      {
        account: { userId: withdrawal.userId, type: "PAYOUT_CLEARING", currency, network },
        direction: "DEBIT",
        money: { amountMinor: total, currency },
      },
      {
        account: { userId: null, type: "PROVIDER_SETTLEMENT", currency, network },
        direction: "CREDIT",
        money: { amountMinor: total, currency },
      },
    ],
  });

  await prisma.advertiserWithdrawal.update({
    where: { id: withdrawal.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      processedAt: withdrawal.processedAt ?? new Date(),
    },
  });

  await dispatchNotificationSafe({
    userId: withdrawal.userId,
    event: "WITHDRAWAL_PAID",
    title: "Withdrawal paid",
    body: `${formatMoney({ amountMinor: withdrawal.amountMinor, currency })} was sent to your wallet.`,
    link: "/portal/wallet",
  });

  return { alreadyProcessed: false };
}

async function reverseWithdrawalHold(
  withdrawal: AdvertiserWithdrawal,
  reason: string,
  eventId: string
): Promise<void> {
  const currency = transactionCurrency(withdrawal.currency);
  const network = transactionNetwork(currency, withdrawal.network);
  const total = withdrawal.amountMinor + withdrawal.feeMinor;

  await postLedgerTransaction({
    type: "REFUND",
    reference: `LEDGER-PAYOUT-REVERSE-${withdrawal.id}`,
    idempotencyKey: `payout-reverse:${withdrawal.id}`,
    metadata: { providerReference: withdrawal.providerReference, eventId },
    lines: [
      {
        account: { userId: withdrawal.userId, type: "PAYOUT_CLEARING", currency, network },
        direction: "DEBIT",
        money: { amountMinor: total, currency },
      },
      {
        account: { userId: withdrawal.userId, type: "AVAILABLE", currency, network },
        direction: "CREDIT",
        money: { amountMinor: total, currency },
      },
    ],
  });

  await prisma.$transaction([
    prisma.advertiserWithdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "FAILED",
        processedAt: new Date(),
        notes: reason || withdrawal.notes,
      },
    }),
    prisma.wallet.updateMany({
      where: {
        userId: withdrawal.userId,
        currency,
        network,
      },
      data: { availableBalanceMinor: { increment: total } },
    }),
  ]);

  await dispatchNotificationSafe({
    userId: withdrawal.userId,
    event: "WITHDRAWAL_FAILED",
    title: "Withdrawal failed",
    body: `${formatMoney({ amountMinor: total, currency })} was returned to your wallet.`,
    link: "/portal/wallet",
  });
}

/**
 * Finance recovery path for a stuck withdrawal. Reverses the clearing hold and
 * marks the withdrawal FAILED. Safe to call repeatedly.
 */
export async function reverseWithdrawalById(
  withdrawalId: string,
  reason: string
): Promise<boolean> {
  const withdrawal = await prisma.advertiserWithdrawal.findUnique({
    where: { id: withdrawalId },
  });
  if (!withdrawal) return false;
  if (withdrawal.status === "PAID" || withdrawal.status === "FAILED") return false;
  await reverseWithdrawalHold(withdrawal, reason, `admin-reverse:${withdrawal.id}`);
  return true;
}

export async function failPayout(
  event: NormalizedProviderEvent
): Promise<{ alreadyProcessed: boolean }> {
  const providerReference = String(event.data.providerReference ?? "");
  if (!providerReference) {
    throw new Error("payout.failed is missing providerReference.");
  }
  const withdrawal = await prisma.advertiserWithdrawal.findFirst({
    where: { providerReference },
  });
  if (!withdrawal) return { alreadyProcessed: true };
  if (withdrawal.status === "FAILED" || withdrawal.status === "PAID") {
    return { alreadyProcessed: true };
  }

  await reverseWithdrawalHold(
    withdrawal,
    event.data.reason ? String(event.data.reason) : withdrawal.notes ?? "Provider failed the payout.",
    event.eventId
  );

  return { alreadyProcessed: false };
}

export async function processProviderEvent(
  event: NormalizedProviderEvent
): Promise<{ processed: boolean; ignored: boolean }> {
  switch (event.type) {
    case "onramp.completed":
      await settleOnramp(event);
      return { processed: true, ignored: false };
    case "onramp.failed":
      await failOnramp(event);
      return { processed: true, ignored: false };
    case "payout.paid":
      await settlePayout(event);
      return { processed: true, ignored: false };
    case "payout.failed":
      await failPayout(event);
      return { processed: true, ignored: false };
    default:
      return { processed: false, ignored: true };
  }
}
