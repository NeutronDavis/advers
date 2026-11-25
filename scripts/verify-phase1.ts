/**
 * Phase 1 verification: migration, backfill, ledger tables, and cleanup.
 *
 * Usage: npm run verify:phase1
 */
import { prisma } from "../src/lib/prisma";

interface CountRow {
  count: bigint | number;
}

interface MigrationRow {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
}

function toBigInt(value: bigint | number | null | undefined): bigint {
  if (value === null || value === undefined) return BigInt(0);
  return typeof value === "bigint" ? value : BigInt(value);
}

const BACKFILLS: Array<[table: string, legacy: string, minor: string]> = [
  ["Campaign", "budget", "budgetMinor"],
  ["Wallet", "availableBalance", "availableBalanceMinor"],
  ["Wallet", "escrowBalance", "escrowBalanceMinor"],
  ["Wallet", "totalSpent", "totalSpentMinor"],
  ["WalletTransaction", "amount", "amountMinor"],
  ["LedgerEntry", "grossAmount", "grossAmountMinor"],
  ["LedgerEntry", "feeAmount", "feeAmountMinor"],
  ["LedgerEntry", "netAmount", "netAmountMinor"],
  ["Invoice", "amount", "amountMinor"],
  ["Payment", "amount", "amountMinor"],
  ["Quote", "amount", "amountMinor"],
  ["BoosterJob", "budget", "budgetMinor"],
  ["BoosterEarning", "amount", "amountMinor"],
  ["BoosterEarning", "paidAmount", "paidAmountMinor"],
  ["Withdrawal", "amount", "amountMinor"],
];

const REQUIRED_TABLES = [
  "LedgerAccount",
  "LedgerTransaction",
  "LedgerLine",
  "FxQuote",
  "ProviderEvent",
];

function quote(identifier: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
}

async function main(): Promise<void> {
  let failures = 0;
  const fail = (message: string) => {
    failures += 1;
    console.error(`  FAIL ${message}`);
  };
  const pass = (message: string) => console.log(`  ok   ${message}`);

  console.log("1. Migrations");
  const migrations = await prisma.$queryRawUnsafe<MigrationRow[]>(
    `SELECT migration_name, finished_at, rolled_back_at
     FROM _prisma_migrations
     WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
     ORDER BY started_at`
  );
  const appliedMigrations = new Set(migrations.map((migration) => migration.migration_name));
  for (const required of [
    "20261124000000_baseline",
    "20261124120000_phase1_foundation",
  ]) {
    if (appliedMigrations.has(required)) pass(`${required} applied`);
    else fail(`${required} not applied`);
  }

  console.log("2. Ledger tables");
  const tables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = DATABASE()`
  );
  const tableNames = new Set(tables.map((table) => table.name));
  for (const table of REQUIRED_TABLES) {
    if (tableNames.has(table)) pass(`${table} exists`);
    else fail(`${table} missing`);
  }

  console.log("3. Backfill completeness");
  for (const [table, legacy, minor] of BACKFILLS) {
    const rows = await prisma.$queryRawUnsafe<CountRow[]>(
      `SELECT COUNT(*) AS count FROM ${quote(table)}
       WHERE ${quote(legacy)} IS NOT NULL AND ${quote(minor)} IS NULL`
    );
    const missing = toBigInt(rows[0]?.count);
    if (missing === BigInt(0)) pass(`${table}.${minor} complete`);
    else fail(`${table}.${minor}: ${missing.toString()} rows missing`);
  }

  console.log("4. Backfill correctness");
  for (const [table, legacy, minor] of BACKFILLS) {
    const rows = await prisma.$queryRawUnsafe<CountRow[]>(
      `SELECT COUNT(*) AS count FROM ${quote(table)}
       WHERE ${quote(legacy)} IS NOT NULL
         AND ${quote(minor)} IS NOT NULL
         AND ${quote(minor)} <> ${quote(legacy)} * 100`
    );
    const mismatches = toBigInt(rows[0]?.count);
    if (mismatches === BigInt(0)) pass(`${table}.${minor} matches legacy x100`);
    else fail(`${table}.${minor}: ${mismatches.toString()} mismatches`);
  }

  console.log("5. Smoke-test cleanup");
  const smokeTransactions = await prisma.$queryRawUnsafe<CountRow[]>(
    `SELECT COUNT(*) AS count FROM LedgerTransaction
     WHERE idempotencyKey LIKE 'smoke:%'`
  );
  const smokeAccounts = await prisma.$queryRawUnsafe<CountRow[]>(
    `SELECT COUNT(*) AS count FROM LedgerAccount
     WHERE \`key\` LIKE 'SYSTEM:%'
       AND EXISTS (SELECT 1 FROM LedgerLine WHERE LedgerLine.accountId = LedgerAccount.id)`
  );
  if (toBigInt(smokeTransactions[0]?.count) === BigInt(0)) pass("no smoke transactions");
  else fail("smoke transactions remain");
  if (toBigInt(smokeAccounts[0]?.count) === BigInt(0)) pass("no smoke accounts");
  else fail("smoke accounts remain");

  console.log("6. Schema fields");
  const userColumns = await prisma.$queryRawUnsafe<Array<{ COLUMN_NAME: string }>>(
    `SELECT COLUMN_NAME FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'User'`
  );
  const userColumnNames = new Set(userColumns.map((column) => column.COLUMN_NAME));
  for (const column of ["username", "avatarUrl", "coverUrl", "themePreference", "sessionVersion"]) {
    if (userColumnNames.has(column)) pass(`User.${column} exists`);
    else fail(`User.${column} missing`);
  }

  console.log(failures === 0 ? "\nPhase 1 verification passed." : `\nPhase 1 verification failed: ${failures} issue(s).`);
  if (failures > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("Verification failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
