/**
 * Phase 2 housekeeping.
 *
 * Usage: npm run cleanup:phase2
 *
 * Safe to run repeatedly from a cron/worker. It only removes expired or
 * consumed operational rows, never financial ledger data.
 */
import { prisma } from "../src/lib/prisma";
import { cleanupRateLimits } from "../src/server/security/rate-limit";

async function main(): Promise<void> {
  const now = new Date();
  const rateLimits = await cleanupRateLimits();
  const stepUps = await prisma.stepUpToken.deleteMany({
    where: {
      OR: [{ usedAt: { not: null } }, { expiresAt: { lt: now } }],
    },
  });
  const quotes = await prisma.fxQuote.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  console.log("Phase 2 cleanup complete.");
  console.log(`  rate-limit buckets removed: ${rateLimits}`);
  console.log(`  step-up tokens removed: ${stepUps.count}`);
  console.log(`  FX quotes expired: ${quotes.count}`);
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
