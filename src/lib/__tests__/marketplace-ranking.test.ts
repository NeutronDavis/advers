import test from "node:test";
import assert from "node:assert/strict";
import {
  MARKETPLACE_WEIGHTS,
  rankMarketplaceBoosters,
  scoreMarketplaceBooster,
  type MarketplaceRankingInput,
} from "../marketplace-ranking";

const now = new Date("2026-11-25T12:00:00Z").getTime();

function input(overrides: Partial<MarketplaceRankingInput> = {}): MarketplaceRankingInput {
  return {
    verifiedReviewCount: 0,
    approvedReviewCount: 0,
    ratingAvg: 0,
    completedJobs: 0,
    recommendationCount: 0,
    responseTimeHours: null,
    verificationStatus: "UNVERIFIED",
    createdAt: new Date("2026-11-01T12:00:00Z"),
    reportCount: 0,
    ...overrides,
  };
}

test("weights match the approved D-11 decision and sum to 100", () => {
  const sum = Object.values(MARKETPLACE_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(sum, 100);
});

test("a strong verified profile outranks a weak one", () => {
  const strong = scoreMarketplaceBooster(
    input({
      verifiedReviewCount: 10,
      approvedReviewCount: 10,
      ratingAvg: 4.9,
      completedJobs: 60,
      recommendationCount: 25,
      responseTimeHours: 1,
      verificationStatus: "VERIFIED",
    }),
    now
  );
  const weak = scoreMarketplaceBooster(input(), now);
  assert.ok(strong.score > weak.score);
  assert.ok(strong.score > 70);
  assert.ok(weak.score < 20);
});

test("component caps prevent runaway scores", () => {
  const result = scoreMarketplaceBooster(
    input({
      verifiedReviewCount: 1000,
      approvedReviewCount: 1000,
      ratingAvg: 5,
      completedJobs: 1000,
      recommendationCount: 1000,
      responseTimeHours: 0,
      verificationStatus: "VERIFIED",
    }),
    now
  );
  for (const value of Object.values(result.components)) {
    assert.ok(value <= 1);
  }
  assert.equal(result.score, 100);
});

test("reports apply a multiplicative penalty", () => {
  const clean = scoreMarketplaceBooster(
    input({ verifiedReviewCount: 5, ratingAvg: 4, completedJobs: 10 }),
    now
  );
  const reported = scoreMarketplaceBooster(
    input({
      verifiedReviewCount: 5,
      ratingAvg: 4,
      completedJobs: 10,
      reportCount: 3,
    }),
    now
  );
  assert.equal(reported.penalty, 0.55);
  assert.ok(reported.score < clean.score);
});

test("recency and responsiveness degrade with age and slow replies", () => {
  const recentFast = scoreMarketplaceBooster(
    input({ createdAt: new Date("2026-11-20T12:00:00Z"), responseTimeHours: 1 }),
    now
  );
  const oldSlow = scoreMarketplaceBooster(
    input({ createdAt: new Date("2025-01-01T12:00:00Z"), responseTimeHours: 500 }),
    now
  );
  assert.ok(recentFast.components.recency > oldSlow.components.recency);
  assert.ok(recentFast.components.responsiveness > oldSlow.components.responsiveness);
});

test("manual ranking boost is clamped and applied", () => {
  const base = scoreMarketplaceBooster(input({ ratingAvg: 4 }), now);
  const boosted = scoreMarketplaceBooster(
    input({ ratingAvg: 4, rankingBoost: 10 }),
    now
  );
  const capped = scoreMarketplaceBooster(
    input({ ratingAvg: 4, rankingBoost: 100 }),
    now
  );
  assert.equal(boosted.manualBoost, 10);
  assert.equal(capped.manualBoost, 20);
  assert.ok(boosted.score > base.score);
});

test("ranking is deterministic and sorted descending", () => {
  const items = [
    { id: "weak", ...input() },
    {
      id: "strong",
      ...input({
        verifiedReviewCount: 8,
        ratingAvg: 4.8,
        completedJobs: 30,
        verificationStatus: "VERIFIED",
      }),
    },
    { id: "mid", ...input({ ratingAvg: 4, completedJobs: 10, approvedReviewCount: 2 }) },
  ];
  const ranked = rankMarketplaceBoosters(items, now);
  assert.deepEqual(ranked.map((item) => item.id), ["strong", "mid", "weak"]);
  const again = rankMarketplaceBoosters(items, now);
  assert.deepEqual(again.map((item) => item.ranking.score), ranked.map((item) => item.ranking.score));
});
