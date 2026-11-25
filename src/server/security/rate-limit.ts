import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  type RateLimitResult,
  type RateLimitStore,
} from "@/lib/rate-limit";

/**
 * MySQL-backed rate-limit store. The INSERT ... ON DUPLICATE KEY UPDATE is
 * atomic, so concurrent requests share the same counter across processes.
 */
export const prismaRateLimitStore: RateLimitStore = {
  async hit(key, windowMs, now) {
    const nowDate = new Date(now);
    const nextReset = new Date(now + windowMs);

    await prisma.$executeRaw`
      INSERT INTO \`RateLimitBucket\` (\`key\`, \`count\`, \`resetAt\`, \`updatedAt\`)
      VALUES (${key}, 1, ${nextReset}, ${nowDate})
      ON DUPLICATE KEY UPDATE
        \`count\` = IF(\`resetAt\` <= ${nowDate}, 1, \`count\` + 1),
        \`resetAt\` = IF(\`resetAt\` <= ${nowDate}, ${nextReset}, \`resetAt\`),
        \`updatedAt\` = ${nowDate}
    `;

    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
    return {
      count: bucket?.count ?? 1,
      resetAt: bucket?.resetAt.getTime() ?? nextReset.getTime(),
    };
  },
};

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  return checkRateLimit(prismaRateLimitStore, key, limit, windowMs);
}

export async function cleanupRateLimits(
  olderThanMs = 24 * 60 * 60 * 1000
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const result = await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lt: cutoff } },
  });
  return result.count;
}
