import test from "node:test";
import assert from "node:assert/strict";
import {
  generateStepUpMaterial,
  hashStepUpToken,
  isStepUpExpired,
  STEP_UP_TTL_MS,
} from "../step-up";

test("step-up material is unique, hashed and time-limited", () => {
  const now = 1_700_000_000_000;
  const first = generateStepUpMaterial(STEP_UP_TTL_MS, now);
  const second = generateStepUpMaterial(STEP_UP_TTL_MS, now);

  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, second.tokenHash);
  assert.equal(first.tokenHash, hashStepUpToken(first.token));
  assert.equal(first.expiresAt.getTime(), now + STEP_UP_TTL_MS);
  assert.equal(isStepUpExpired(first.expiresAt, now), false);
  assert.equal(isStepUpExpired(first.expiresAt, now + STEP_UP_TTL_MS), true);
});
