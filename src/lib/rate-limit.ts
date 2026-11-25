/**
 * Rate-limit policy with a pluggable store.
 *
 * Production uses a MySQL-backed store (src/server/security/rate-limit.ts) so
 * limits are shared across processes. Tests use the in-memory store below.
 */

export interface RateLimitState {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  hit(key: string, windowMs: number, now: number): Promise<RateLimitState>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, RateLimitState>();

  return {
    async hit(key, windowMs, now) {
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= now) {
        const next = { count: 1, resetAt: now + windowMs };
        buckets.set(key, next);
        return next;
      }
      existing.count += 1;
      return { ...existing };
    },
  };
}

export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): Promise<RateLimitResult> {
  const bucket = await store.hit(key, windowMs, now);

  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterMs: 0,
  };
}
