import { prisma } from "@/lib/prisma";
import { legacyMoneyDTO, type MoneyDTO } from "@/lib/money";

export interface ProviderEventView {
  id: string;
  provider: string;
  eventId: string;
  type: string;
  status: string;
  attempts: number;
  signatureValid: boolean;
  error: string | null;
  lastAttemptAt: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface ReconciliationWithdrawalView {
  id: string;
  userName: string;
  userEmail: string;
  amountMoney: MoneyDTO;
  feeMoney: MoneyDTO;
  status: string;
  network: string;
  providerReference: string | null;
  destinationLabel: string | null;
  requestedAt: string;
  paidAt: string | null;
  notes: string | null;
}

export interface PendingFundingView {
  id: string;
  userName: string;
  userEmail: string;
  amountMoney: MoneyDTO;
  reference: string;
  status: string;
  createdAt: string;
}

export interface ReconciliationWalletView {
  id: string;
  userName: string;
  userEmail: string;
  currency: string;
  network: string;
  status: string;
  balanceMoney: MoneyDTO;
}

export interface ReconciliationData {
  providerEvents: ProviderEventView[];
  withdrawals: ReconciliationWithdrawalView[];
  pendingFunding: PendingFundingView[];
  wallets: ReconciliationWalletView[];
  totals: {
    failedEvents: number;
    pendingEvents: number;
    processingWithdrawals: number;
    pendingFunding: number;
    frozenWallets: number;
  };
}

export async function getReconciliationData(): Promise<ReconciliationData> {
  const [
    providerEvents,
    withdrawals,
    pendingFunding,
    wallets,
    failedEvents,
    pendingEvents,
    processingWithdrawals,
    pendingFundingCount,
    frozenWallets,
  ] = await Promise.all([
    prisma.providerEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.advertiserWithdrawal.findMany({
      include: {
        user: { select: { name: true, email: true } },
        destination: { select: { label: true } },
      },
      orderBy: { requestedAt: "desc" },
      take: 100,
    }),
    prisma.walletTransaction.findMany({
      where: { status: "PENDING" },
      include: { wallet: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.wallet.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 120,
    }),
    prisma.providerEvent.count({ where: { status: "FAILED" } }),
    prisma.providerEvent.count({ where: { status: "RECEIVED" } }),
    prisma.advertiserWithdrawal.count({ where: { status: { in: ["REQUESTED", "PROCESSING"] } } }),
    prisma.walletTransaction.count({
      where: { status: "PENDING", type: "ONRAMP_PENDING" },
    }),
    prisma.wallet.count({ where: { status: { not: "ACTIVE" } } }),
  ]);

  return {
    providerEvents: providerEvents.map((event) => ({
      id: event.id,
      provider: event.provider,
      eventId: event.eventId,
      type: event.type,
      status: event.status,
      attempts: event.attempts,
      signatureValid: event.signatureValid,
      error: event.error,
      lastAttemptAt: event.lastAttemptAt ? event.lastAttemptAt.toISOString() : null,
      processedAt: event.processedAt ? event.processedAt.toISOString() : null,
      createdAt: event.createdAt.toISOString(),
    })),
    withdrawals: withdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      userName: withdrawal.user.name,
      userEmail: withdrawal.user.email,
      amountMoney: {
        amountMinor: withdrawal.amountMinor.toString(),
        currency: "USDC",
        network: withdrawal.network === "POLYGON" ? "POLYGON" : undefined,
      },
      feeMoney: {
        amountMinor: withdrawal.feeMinor.toString(),
        currency: "USDC",
        network: withdrawal.network === "POLYGON" ? "POLYGON" : undefined,
      },
      status: withdrawal.status,
      network: withdrawal.network,
      providerReference: withdrawal.providerReference,
      destinationLabel: withdrawal.destination?.label ?? null,
      requestedAt: withdrawal.requestedAt.toISOString(),
      paidAt: withdrawal.paidAt ? withdrawal.paidAt.toISOString() : null,
      notes: withdrawal.notes,
    })),
    pendingFunding: pendingFunding.map((transaction) => ({
      id: transaction.id,
      userName: transaction.wallet.user.name,
      userEmail: transaction.wallet.user.email,
      amountMoney: legacyMoneyDTO(
        transaction.amount,
        transaction.amountMinor,
        transaction.currency
      ),
      reference: transaction.reference,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    })),
    wallets: wallets.map((wallet) => ({
      id: wallet.id,
      userName: wallet.user.name,
      userEmail: wallet.user.email,
      currency: wallet.currency,
      network: wallet.network,
      status: wallet.status,
      balanceMoney: legacyMoneyDTO(
        wallet.availableBalance,
        wallet.availableBalanceMinor,
        wallet.currency
      ),
    })),
    totals: {
      failedEvents,
      pendingEvents,
      processingWithdrawals,
      pendingFunding: pendingFundingCount,
      frozenWallets,
    },
  };
}
