import { Prisma } from "@prisma/client";
import type {
  LedgerAccount,
  LedgerAccountType,
  LedgerDirection,
  LedgerEntryType,
  LedgerTransaction,
  LedgerTransactionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertBalanced, type LedgerLineDraft } from "@/lib/ledger";
import { ledgerAccountKey } from "@/lib/ledger-account-key";
import {
  assertSupportedNetwork,
  isCurrencyCode,
  type CurrencyCode,
  type Money,
  type PaymentNetwork,
} from "@/lib/money";

export interface LedgerAccountSpec {
  userId?: string | null;
  type: LedgerAccountType;
  currency: CurrencyCode;
  /** Use "NONE" for fiat / platform-only accounts. */
  network?: PaymentNetwork | "NONE" | null;
}

export interface LedgerPostingLine {
  account: LedgerAccountSpec;
  direction: LedgerDirection;
  money: Money;
}

export interface PostLedgerInput {
  type: LedgerEntryType;
  reference: string;
  idempotencyKey: string;
  lines: LedgerPostingLine[];
  fxQuoteId?: string;
  metadata?: Record<string, unknown>;
  status?: LedgerTransactionStatus;
}

export { ledgerAccountKey };

function validateAccountSpec(spec: LedgerAccountSpec): void {
  if (!isCurrencyCode(spec.currency)) {
    throw new Error(`Unsupported ledger currency: ${String(spec.currency)}`);
  }
  if (spec.network && spec.network !== "NONE") {
    assertSupportedNetwork(spec.network);
  }
}

/**
 * Posts an idempotent, balanced ledger transaction.
 *
 * Account balance projections follow the convention: CREDIT increases,
 * DEBIT decreases. The invariant is enforced before any write.
 */
export async function postLedgerTransaction(
  input: PostLedgerInput
): Promise<LedgerTransaction> {
  if (input.lines.length < 2) {
    throw new Error("A ledger transaction needs at least two lines.");
  }
  if (!input.reference.trim()) {
    throw new Error("A ledger reference is required.");
  }
  if (!input.idempotencyKey.trim()) {
    throw new Error("An idempotency key is required.");
  }

  for (const line of input.lines) {
    validateAccountSpec(line.account);
  }

  const drafts: LedgerLineDraft[] = input.lines.map((line) => ({
    accountKey: ledgerAccountKey(line.account),
    direction: line.direction,
    money: line.money,
  }));
  assertBalanced(drafts);

  const existing = await prisma.ledgerTransaction.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return existing;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const accounts: LedgerAccount[] = [];

      for (const line of input.lines) {
        const key = ledgerAccountKey(line.account);
        let account = await tx.ledgerAccount.findUnique({ where: { key } });
        if (!account) {
          account = await tx.ledgerAccount.create({
            data: {
              key,
              userId: line.account.userId ?? null,
              type: line.account.type,
              currency: line.account.currency,
              network: line.account.network ?? "NONE",
            },
          });
        }
        accounts.push(account);
      }

      const status = input.status ?? "POSTED";
      const transaction = await tx.ledgerTransaction.create({
        data: {
          type: input.type,
          status,
          reference: input.reference,
          idempotencyKey: input.idempotencyKey,
          fxQuoteId: input.fxQuoteId,
          metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
          postedAt: status === "PENDING" ? null : new Date(),
          lines: {
            create: input.lines.map((line, index) => ({
              accountId: accounts[index].id,
              direction: line.direction,
              amountMinor: line.money.amountMinor,
              currency: line.money.currency,
              network:
                line.account.network && line.account.network !== "NONE"
                  ? line.account.network
                  : null,
            })),
          },
        },
        include: { lines: true },
      });

      for (let index = 0; index < input.lines.length; index += 1) {
        const line = input.lines[index];
        const signed =
          line.direction === "CREDIT"
            ? line.money.amountMinor
            : -line.money.amountMinor;
        await tx.ledgerAccount.update({
          where: { id: accounts[index].id },
          data: { balanceMinor: { increment: signed } },
        });
      }

        return transaction;
      },
      // Aiven/remote MySQL round-trips can exceed the 5s interactive default.
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");
      if (target.includes("idempotencyKey")) {
        const raced = await prisma.ledgerTransaction.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
        });
        if (raced) return raced;
      }
    }
    throw error;
  }
}

export async function getLedgerAccountByKey(
  key: string
): Promise<LedgerAccount | null> {
  return prisma.ledgerAccount.findUnique({ where: { key } });
}

export async function getLedgerBalance(
  key: string
): Promise<Money | null> {
  const account = await prisma.ledgerAccount.findUnique({ where: { key } });
  if (!account) return null;
  if (!isCurrencyCode(account.currency)) return null;
  return { amountMinor: account.balanceMinor, currency: account.currency };
}

/**
 * Recomputes every account projection from posted lines. Use after a failed
 * write or during incident recovery; safe to run repeatedly.
 */
export async function rebuildLedgerBalances(): Promise<{
  accounts: number;
  updated: number;
}> {
  const accounts = await prisma.ledgerAccount.findMany({
    select: { id: true, currency: true },
  });
  let updated = 0;

  for (const account of accounts) {
    const lines = await prisma.ledgerLine.findMany({
      where: { accountId: account.id },
      select: { direction: true, amountMinor: true },
    });

    const balance = lines.reduce((total, line) => {
      return line.direction === "CREDIT"
        ? total + line.amountMinor
        : total - line.amountMinor;
    }, BigInt(0));

    await prisma.ledgerAccount.update({
      where: { id: account.id },
      data: { balanceMinor: balance },
    });
    updated += 1;
  }

  return { accounts: accounts.length, updated };
}

export async function listRecentLedgerTransactions(limit = 50) {
  return prisma.ledgerTransaction.findMany({
    include: { lines: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
