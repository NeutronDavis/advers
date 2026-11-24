/**
 * Logical JSON backup of every table in the current database.
 *
 * Usage: npm run db:backup
 * Output: backups/advers-<timestamp>.json
 *
 * Reads with raw SQL so it works before a pending migration has been applied.
 * BigInt and Decimal values are tagged so they can be identified during a
 * manual restore. This is a pre-migration safety net, not a replacement for the
 * database provider's point-in-time backups.
 */
import fs from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

interface TableRow {
  name: string;
}

function encode(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return { __type: "bigint", value: value.toString() };
  }
  if (value instanceof Prisma.Decimal) {
    return { __type: "decimal", value: value.toString() };
  }
  if (Buffer.isBuffer(value)) {
    return { __type: "buffer", value: value.toString("base64") };
  }
  return value;
}

function quote(identifier: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
}

async function main(): Promise<void> {
  const tables = await prisma.$queryRawUnsafe<TableRow[]>(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );

  const snapshot: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};

  for (const table of tables) {
    if (table.name === "_prisma_migrations") continue;
    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      `SELECT * FROM ${quote(table.name)}`
    );
    snapshot[table.name] = rows;
    counts[table.name] = rows.length;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `advers-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, encode, 2), "utf8");

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  console.log(`Backup written: ${path.relative(process.cwd(), file)}`);
  console.log(`Tables: ${Object.keys(counts).length}, rows: ${total}`);
  for (const [name, count] of Object.entries(counts)) {
    if (count > 0) console.log(`  ${name}: ${count}`);
  }
  console.log("Sensitive data: this file contains customer data. Keep it out of git.");
}

main()
  .catch((error) => {
    console.error("Backup failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
