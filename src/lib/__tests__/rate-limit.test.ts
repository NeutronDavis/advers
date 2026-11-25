import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  createMemoryRateLimitStore,
} from "../rate-limit";

test("rate limit allows up to the limit then blocks", async () => {
  const store = createMemoryRateLimitStore();
  const now = 1_700_000_000_000;
  for (let index = 0; index < 3; index += 1) {
    const result = await checkRateLimit(store, "user:1", 3, 60_000, now);
    assert.equal(result.allowed, true);
  }
  const blocked = await checkRateLimit(store, "user:1", 3, 60_000, now + 1);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);
});

test("rate limit resets after the window", async () => {
  const store = createMemoryRateLimitStore();
  const now = 1_700_000_000_000;
  await checkRateLimit(store, "user:2", 1, 1_000, now);
  assert.equal(
    (await checkRateLimit(store, "user:2", 1, 1_000, now + 500)).allowed,
    false
  );
  assert.equal(
    (await checkRateLimit(store, "user:2", 1, 1_000, now + 1_001)).allowed,
    true
  );
});

test("rate limit keys are isolated", async () => {
  const store = createMemoryRateLimitStore();
  const now = 1_700_000_000_000;
  await checkRateLimit(store, "a", 1, 60_000, now);
  assert.equal((await checkRateLimit(store, "b", 1, 60_000, now)).allowed, true);
});
