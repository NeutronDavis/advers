import { prisma } from "@/lib/prisma";
import {
  isPaymentNetwork,
  legacyMoneyDTO,
  parseMoney,
  type MoneyDTO,
  type PaymentNetwork,
} from "@/lib/money";
import { getLedgerBalance } from "@/server/ledger";
import {
  advertiserAccountKey,
  mockNgnPerUsdc,
  paymentProviderName,
  withdrawalFeeUsdc,
} from "@/lib/wallet";
import { getTwoFactorState } from "@/server/security/two-factor";

const USDC = "USDC" as const;
const NETWORK: PaymentNetwork = "POLYGON";

export interface WalletTransactionView {
  id: string;
  type: string;
  status: string;
  description: string;
  amountMoney: MoneyDTO;
  direction: "IN" | "OUT" | "NEUTRAL";
  reference: string;
  provider: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PayoutDestinationView {
  id: string;
  label: string;
  address: string;
  network: string;
  status: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AdvertiserWithdrawalView {
  id: string;
  amountMoney: MoneyDTO;
  feeMoney: MoneyDTO;
  status: string;
  network: string;
  providerReference: string | null;
  destinationLabel: string | null;
  requestedAt: string;
  paidAt: string | null;
}

export interface WalletOverview {
  walletId: string;
  currency: "USDC";
  network: PaymentNetwork;
  status: string;
  available: MoneyDTO;
  escrow: MoneyDTO;
  totalSpent: MoneyDTO;
  transactions: WalletTransactionView[];
  destinations: PayoutDestinationView[];
  withdrawals: AdvertiserWithdrawalView[];
  twoFactorEnabled: boolean;
  recoveryCodesRemaining: number;
  fxRate: number;
  withdrawalFee: MoneyDTO;
  provider: string;
  legacyNgnAvailable: MoneyDTO | null;
  legacyNgnEscrow: MoneyDTO | null;
}

function networkOf(value: string | null | undefined): PaymentNetwork | undefined {
  return value && isPaymentNetwork(value) ? value : undefined;
}

const OUTGOING_TYPES = new Set([
  "WITHDRAWAL",
  "PAYOUT",
  "ESCROW_LOCK",
  "ONRAMP_FAILED",
]);

export async function ensureUsdcWallet(userId: string) {
  return prisma.wallet.upsert({
    where: {
      userId_currency_network: { userId, currency: USDC, network: NETWORK },
    },
    update: {},
    create: {
      userId,
      currency: USDC,
      network: NETWORK,
      availableBalanceMinor: BigInt(0),
      escrowBalanceMinor: BigInt(0),
      totalSpentMinor: BigInt(0),
    },
  });
}

export async function getUsdcAvailableMinor(userId: string): Promise<bigint> {
  const ledger = await getLedgerBalance(
    advertiserAccountKey(userId, "AVAILABLE", USDC, NETWORK)
  );
  if (ledger) return ledger.amountMinor;
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId_currency_network: { userId, currency: USDC, network: NETWORK },
    },
    select: { availableBalanceMinor: true },
  });
  return wallet?.availableBalanceMinor ?? BigInt(0);
}

export async function getWalletOverview(userId: string): Promise<WalletOverview> {
  const wallet = await ensureUsdcWallet(userId);

  const [available, escrow, legacyWallet, transactions, destinations, withdrawals, twoFactor] =
    await Promise.all([
      getLedgerBalance(advertiserAccountKey(userId, "AVAILABLE", USDC, NETWORK)),
      getLedgerBalance(advertiserAccountKey(userId, "ESCROW", USDC, NETWORK)),
      prisma.wallet.findFirst({
        where: { userId, currency: "NGN" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.walletTransaction.findMany({
        where: { wallet: { userId } },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.payoutDestination.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
      prisma.advertiserWithdrawal.findMany({
        where: { userId },
        include: { destination: { select: { label: true } } },
        orderBy: { requestedAt: "desc" },
        take: 40,
      }),
      getTwoFactorState(userId),
    ]);

  const legacyAvailable = legacyWallet
    ? legacyMoneyDTO(
        legacyWallet.availableBalance,
        legacyWallet.availableBalanceMinor,
        legacyWallet.currency
      )
    : null;
  const legacyEscrow = legacyWallet
    ? legacyMoneyDTO(
        legacyWallet.escrowBalance,
        legacyWallet.escrowBalanceMinor,
        legacyWallet.currency
      )
    : null;

  const fee = withdrawalFeeUsdc();
  const feeMinor = (() => {
    try {
      return parseMoney(fee, "USDC").amountMinor.toString();
    } catch {
      return "0";
    }
  })();

  return {
    walletId: wallet.id,
    currency: USDC,
    network: NETWORK,
    status: wallet.status,
    available: {
      amountMinor: (available?.amountMinor ?? wallet.availableBalanceMinor ?? BigInt(0)).toString(),
      currency: USDC,
      network: NETWORK,
    },
    escrow: {
      amountMinor: (escrow?.amountMinor ?? wallet.escrowBalanceMinor ?? BigInt(0)).toString(),
      currency: USDC,
      network: NETWORK,
    },
    totalSpent: {
      amountMinor: (wallet.totalSpentMinor ?? BigInt(0)).toString(),
      currency: USDC,
      network: NETWORK,
    },
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      amountMoney: legacyMoneyDTO(
        transaction.amount,
        transaction.amountMinor,
        transaction.currency,
        networkOf(transaction.network)
      ),
      direction: OUTGOING_TYPES.has(transaction.type) ? "OUT" : "IN",
      reference: transaction.reference,
      provider: transaction.provider,
      createdAt: transaction.createdAt.toISOString(),
      completedAt: transaction.completedAt
        ? transaction.completedAt.toISOString()
        : null,
    })),
    destinations: destinations.map((destination) => ({
      id: destination.id,
      label: destination.label,
      address: destination.address,
      network: destination.network,
      status: destination.status,
      isDefault: destination.isDefault,
      createdAt: destination.createdAt.toISOString(),
    })),
    withdrawals: withdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      amountMoney: {
        amountMinor: withdrawal.amountMinor.toString(),
        currency: "USDC",
        network: networkOf(withdrawal.network) ?? NETWORK,
      },
      feeMoney: {
        amountMinor: withdrawal.feeMinor.toString(),
        currency: "USDC",
        network: networkOf(withdrawal.network) ?? NETWORK,
      },
      status: withdrawal.status,
      network: withdrawal.network,
      providerReference: withdrawal.providerReference,
      destinationLabel: withdrawal.destination?.label ?? null,
      requestedAt: withdrawal.requestedAt.toISOString(),
      paidAt: withdrawal.paidAt ? withdrawal.paidAt.toISOString() : null,
    })),
    twoFactorEnabled: twoFactor.enabled,
    recoveryCodesRemaining: twoFactor.recoveryCodesRemaining,
    fxRate: mockNgnPerUsdc(),
    withdrawalFee: {
      amountMinor: feeMinor,
      currency: "USDC",
      network: NETWORK,
    },
    provider: paymentProviderName(),
    legacyNgnAvailable:
      legacyAvailable && BigInt(legacyAvailable.amountMinor) > BigInt(0)
        ? legacyAvailable
        : null,
    legacyNgnEscrow:
      legacyEscrow && BigInt(legacyEscrow.amountMinor) > BigInt(0)
        ? legacyEscrow
        : null,
  };
}
