/**
 * Backfills the Phase 1 money columns from legacy whole-Naira integers.
 *
 * Usage:
 *   npm run backfill:money            # dry run, prints counts and totals
 *   npm run backfill:money -- --apply # writes minor units and verifies
 *
 * The migration in prisma/migrations/20261124120000_phase1_foundation must be
 * applied before --apply succeeds. The dry run only reads legacy columns, so it
 * is safe to execute before the migration.
 */
import { prisma } from "../src/lib/prisma";

interface ColumnBackfill {
  table: string;
  legacyColumn: string;
  minorColumn: string;
}

const BACKFILLS: ColumnBackfill[] = [
  { table: "Campaign", legacyColumn: "budget", minorColumn: "budgetMinor" },
  { table: "Wallet", legacyColumn: "availableBalance", minorColumn: "availableBalanceMinor" },
  { table: "Wallet", legacyColumn: "escrowBalance", minorColumn: "escrowBalanceMinor" },
  { table: "Wallet", legacyColumn: "totalSpent", minorColumn: "totalSpentMinor" },
  { table: "WalletTransaction", legacyColumn: "amount", minorColumn: "amountMinor" },
  { table: "LedgerEntry", legacyColumn: "grossAmount", minorColumn: "grossAmountMinor" },
  { table: "LedgerEntry", legacyColumn: "feeAmount", minorColumn: "feeAmountMinor" },
  { table: "LedgerEntry", legacyColumn: "netAmount", minorColumn: "netAmountMinor" },
  { table: "Invoice", legacyColumn: "amount", minorColumn: "amountMinor" },
  { table: "Payment", legacyColumn: "amount", minorColumn: "amountMinor" },
  { table: "Quote", legacyColumn: "amount", minorColumn: "amountMinor" },
  { table: "BoosterJob", legacyColumn: "budget", minorColumn: "budgetMinor" },
  { table: "BoosterEarning", legacyColumn: "amount", minorColumn: "amountMinor" },
  { table: "BoosterEarning", legacyColumn: "paidAmount", minorColumn: "paidAmountMinor" },
  { table: "Withdrawal", legacyColumn: "amount", minorColumn: "amountMinor" },
];

const apply = process.argv.includes("--apply");

function quote(identifier: string): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
}

interface LegacyRow {
  count: bigint | number;
  total: bigint | number | null;
}

function toBigInt(value: bigint | number | null): bigint {
  if (value === null) return BigInt(0);
  return typeof value === "bigint" ? value : BigInt(value);
}

async function main(): Promise<void> {
  console.log(`ADVERS money backfill — ${apply ? "APPLY" : "DRY RUN"}`);
  console.log("Converting legacy whole-Naira integers to NGN kobo (x100).\n");

  let totalRows = BigInt(0);

  for (const item of BACKFILLS) {
    const table = quote(item.table);
    const legacy = quote(item.legacyColumn);
    const minor = quote(item.minorColumn);

    const rows = await prisma.$queryRawUnsafe<LegacyRow[]>(
      `SELECT COUNT(*) AS count, COALESCE(SUM(${legacy}), 0) AS total
       FROM ${table}
       WHERE ${legacy} IS NOT NULL`
    );

    const row = rows[0] ?? { count: BigInt(0), total: BigInt(0) };
    const count = toBigInt(row.count);
    const legacyTotal = toBigInt(row.total);
    totalRows += count;

    console.log(
      `${item.table}.${item.legacyColumn} -> ${item.minorColumn}: ` +
        `${count.toString()} rows, legacy total ${legacyTotal.toString()} NGN`
    );

    if (!apply || count === BigInt(0)) continue;

    await prisma.$executeRawUnsafe(
      `UPDATE ${table}
       SET ${minor} = ${legacy} * 100
       WHERE ${minor} IS NULL AND ${legacy} IS NOT NULL`
    );

    const check = await prisma.$queryRawUnsafe<LegacyRow[]>(
      `SELECT COUNT(*) AS count, COALESCE(SUM(${minor} - (${legacy} * 100)), 0) AS total
       FROM ${table}
       WHERE ${minor} IS NOT NULL AND ${legacy} IS NOT NULL
         AND ${minor} <> ${legacy} * 100`
    );
    const mismatches = toBigInt(check[0]?.count ?? BigInt(0));
    if (mismatches !== BigInt(0)) {
      throw new Error(
        `${item.table}.${item.minorColumn}: ${mismatches.toString()} rows failed verification.`
      );
    }
    console.log(`  verified ${count.toString()} rows`);
  }

  console.log(`\nTotal legacy rows inspected: ${totalRows.toString()}`);
  if (apply) {
    console.log("Backfill applied and verified.");
  } else {
    console.log("Dry run complete. Re-run with --apply after applying the migration.");
  }
}

main()
  .catch((error) => {
    console.error("\nBackfill failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
