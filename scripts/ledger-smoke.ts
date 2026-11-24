/**
 * Integration smoke test for the Phase 1 ledger.
 *
 * Usage: npm run ledger:smoke
 *
 * Creates a balanced USDC transfer between two system accounts, verifies the
 * idempotent replay and balance projection, then removes the test rows so the
 * development ledger stays clean.
 */
import { prisma } from "../src/lib/prisma";
import { parseMoney } from "../src/lib/money";
import {
  getLedgerBalance,
  ledgerAccountKey,
  postLedgerTransaction,
  rebuildLedgerBalances,
} from "../src/server/ledger";

const suffix = `smoke-${Date.now()}`;

async function main(): Promise<void> {
  const from = {
    type: "AVAILABLE" as const,
    currency: "USDC" as const,
    network: "POLYGON" as const,
  };
  const to = {
    type: "ESCROW" as const,
    currency: "USDC" as const,
    network: "POLYGON" as const,
  };

  const fromKey = ledgerAccountKey({ ...from, userId: null });
  const toKey = ledgerAccountKey({ ...to, userId: null });
  const amount = parseMoney("1.25", "USDC");

  try {
    const first = await postLedgerTransaction({
      type: "ADJUSTMENT",
      reference: `SMOKE-${suffix}`,
      idempotencyKey: `smoke:${suffix}`,
      metadata: { smoke: true },
      lines: [
        { account: { ...from, userId: null }, direction: "DEBIT", money: amount },
        { account: { ...to, userId: null }, direction: "CREDIT", money: amount },
      ],
    });

    const replay = await postLedgerTransaction({
      type: "ADJUSTMENT",
      reference: `SMOKE-${suffix}`,
      idempotencyKey: `smoke:${suffix}`,
      lines: [
        { account: { ...from, userId: null }, direction: "DEBIT", money: amount },
        { account: { ...to, userId: null }, direction: "CREDIT", money: amount },
      ],
    });
    if (first.id !== replay.id) {
      throw new Error("Idempotent replay created a second transaction.");
    }

    const fromBalance = await getLedgerBalance(fromKey);
    const toBalance = await getLedgerBalance(toKey);
    if (fromBalance?.amountMinor !== BigInt(-1_250_000)) {
      throw new Error(`Unexpected source balance: ${fromBalance?.amountMinor}`);
    }
    if (toBalance?.amountMinor !== BigInt(1_250_000)) {
      throw new Error(`Unexpected destination balance: ${toBalance?.amountMinor}`);
    }

    const rebuilt = await rebuildLedgerBalances();
    const fromAfterRebuild = await getLedgerBalance(fromKey);
    if (fromAfterRebuild?.amountMinor !== fromBalance?.amountMinor) {
      throw new Error("Rebuild changed the source balance.");
    }

    console.log("Ledger smoke test passed.");
    console.log(`  transaction: ${first.id}`);
    console.log(`  idempotent replay: ${replay.id}`);
    console.log(`  accounts rebuilt: ${rebuilt.updated}`);
  } finally {
    const transactions = await prisma.ledgerTransaction.findMany({
      where: { idempotencyKey: `smoke:${suffix}` },
      select: { id: true },
    });
    const ids = transactions.map((transaction) => transaction.id);
    if (ids.length > 0) {
      await prisma.ledgerLine.deleteMany({
        where: { transactionId: { in: ids } },
      });
      await prisma.ledgerTransaction.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.ledgerAccount.deleteMany({
      where: { key: { in: [fromKey, toKey] } },
    });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Ledger smoke test failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
