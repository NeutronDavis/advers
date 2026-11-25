export const MARKETPLACE_WEIGHTS = {
  verifiedReviews: 35,
  completedWork: 20,
  responsiveness: 15,
  recommendations: 10,
  rating: 10,
  verification: 5,
  recency: 5,
} as const;

export interface MarketplaceRankingInput {
  verifiedReviewCount: number;
  approvedReviewCount: number;
  ratingAvg: number;
  completedJobs: number;
  recommendationCount: number;
  responseTimeHours: number | null;
  verificationStatus: "VERIFIED" | "PENDING" | "UNVERIFIED" | "REJECTED";
  createdAt: Date | string;
  reportCount: number;
  /** Manual admin adjustment, clamped to ±20 points. */
  rankingBoost?: number;
  sponsored?: boolean;
}

export interface MarketplaceRankingResult {
  score: number;
  components: Record<keyof typeof MARKETPLACE_WEIGHTS, number>;
  penalty: number;
  manualBoost: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function responsivenessScore(hours: number | null): number {
  if (hours === null || hours < 0) return 0.5;
  if (hours <= 2) return 1;
  if (hours <= 24) return 0.8;
  if (hours <= 72) return 0.55;
  if (hours <= 168) return 0.3;
  return 0.1;
}

function verificationScore(status: MarketplaceRankingInput["verificationStatus"]): number {
  switch (status) {
    case "VERIFIED":
      return 1;
    case "PENDING":
      return 0.4;
    case "UNVERIFIED":
      return 0.1;
    case "REJECTED":
    default:
      return 0;
  }
}

function recencyScore(createdAt: Date | string, now: number): number {
  const created = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return 0.2;
  const days = Math.max(0, (now - created) / 86_400_000);
  if (days <= 30) return 1;
  if (days <= 90) return 0.7;
  if (days <= 180) return 0.4;
  return 0.15;
}

/**
 * Deterministic v1 marketplace score. Weights are product decisions (D-11) and
 * must not be changed without updating the tests and the decisions log.
 */
export function scoreMarketplaceBooster(
  input: MarketplaceRankingInput,
  now = Date.now()
): MarketplaceRankingResult {
  const components = {
    verifiedReviews: clamp01(
      (Math.max(0, input.verifiedReviewCount) +
        Math.max(0, input.approvedReviewCount) * 0.5) /
        10
    ),
    completedWork: clamp01(Math.max(0, input.completedJobs) / 50),
    responsiveness: responsivenessScore(input.responseTimeHours),
    recommendations: clamp01(Math.max(0, input.recommendationCount) / 20),
    rating: clamp01(Math.max(0, input.ratingAvg) / 5),
    verification: verificationScore(input.verificationStatus),
    recency: recencyScore(input.createdAt, now),
  };

  const penalty = Math.max(0, 1 - Math.min(5, Math.max(0, input.reportCount)) * 0.15);
  const baseScore =
    Object.entries(MARKETPLACE_WEIGHTS).reduce((total, [key, weight]) => {
      return total + weight * components[key as keyof typeof components];
    }, 0) * penalty;
  const manualBoost = Math.max(-20, Math.min(20, input.rankingBoost ?? 0));
  const score = Math.max(0, baseScore + manualBoost);

  return {
    score: Math.round(score * 100) / 100,
    components,
    penalty,
    manualBoost,
  };
}

export function rankMarketplaceBoosters<T extends MarketplaceRankingInput>(
  items: T[],
  now = Date.now()
): Array<T & { ranking: MarketplaceRankingResult }> {
  return items
    .map((item) => ({ ...item, ranking: scoreMarketplaceBooster(item, now) }))
    .sort((a, b) => b.ranking.score - a.ranking.score);
}
