import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { parseJsonArray, parseStringArray } from "@/server/data/booster";
import {
  scoreMarketplaceBooster,
  type MarketplaceRankingResult,
} from "@/lib/marketplace-ranking";
import { parsePriceToInt } from "@/lib/marketplace-structured";
import { MARKETPLACE_PAGE_SIZE } from "@/lib/marketplace";

export type MarketplaceSort = "recommended" | "rating" | "newest" | "completed";

export interface MarketplaceFilters {
  q?: string;
  category?: string;
  location?: string;
  availability?: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  minPrice?: number;
  maxPrice?: number;
  sort?: MarketplaceSort;
  page?: number;
}

export interface MarketplaceCard {
  id: string;
  handle: string | null;
  displayName: string;
  businessName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  location: string | null;
  availabilityStatus: string;
  responseTimeHours: number | null;
  startingPrice: number | null;
  verificationStatus: string;
  verificationLevel: string | null;
  categories: string[];
  skills: string[];
  coverage: string[];
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  likeCount: number;
  commentCount: number;
  recommendationCount: number;
  approvedReviewCount: number;
  verifiedReviewCount: number;
  ranking: MarketplaceRankingResult;
  isLiked: boolean;
  isRecommended: boolean;
  sponsored: boolean;
  rankingBoost: number;
  createdAt: string;
}

export interface MarketplaceResult {
  items: MarketplaceCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildWhere(filters: MarketplaceFilters): Prisma.BoosterProfileWhereInput {
  const where: Prisma.BoosterProfileWhereInput = {
    status: "ACTIVE",
    verificationStatus: { not: "REJECTED" },
  };
  const andConditions: Prisma.BoosterProfileWhereInput[] = [];

  if (filters.category) {
    andConditions.push({
      OR: [
        { categoriesJson: { contains: `"${filters.category}"` } },
        {
          services: {
            some: { category: filters.category, active: true },
          },
        },
      ],
    });
  }
  if (filters.availability) {
    where.availabilityStatus = filters.availability;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.startingPrice = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.location) {
    where.OR = [
      { location: { contains: filters.location } },
      { coverageJson: { contains: filters.location } },
    ];
  }
  if (filters.q) {
    andConditions.push({
      OR: [
        { displayName: { contains: filters.q } },
        { businessName: { contains: filters.q } },
        { bio: { contains: filters.q } },
        { skillsJson: { contains: filters.q } },
        { coverageJson: { contains: filters.q } },
        {
          services: {
            some: { title: { contains: filters.q }, active: true },
          },
        },
        {
          packages: {
            some: { name: { contains: filters.q }, active: true },
          },
        },
      ],
    });
  }

  if (andConditions.length > 0) where.AND = andConditions;
  return where;
}

export async function getMarketplaceCards(
  filters: MarketplaceFilters,
  viewerId?: string | null
): Promise<MarketplaceResult> {
  const page = Math.max(1, filters.page ?? 1);
  const candidates = await prisma.boosterProfile.findMany({
    where: buildWhere(filters),
    include: {
      reviews: {
        where: { moderationState: "APPROVED" },
        select: { score: true, verified: true },
      },
      _count: {
        select: { likes: true, comments: true, recommendations: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  const ids = candidates.map((profile) => profile.id);
  const [reportGroups, likes, recommendations] = await Promise.all([
    ids.length
      ? prisma.marketplaceReport.groupBy({
          by: ["boosterId"],
          where: {
            boosterId: { in: ids },
            status: { in: ["OPEN", "REVIEWING"] },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    viewerId && ids.length
      ? prisma.boosterLike.findMany({
          where: { userId: viewerId, boosterId: { in: ids } },
          select: { boosterId: true },
        })
      : Promise.resolve([]),
    viewerId && ids.length
      ? prisma.boosterRecommendation.findMany({
          where: { userId: viewerId, boosterId: { in: ids } },
          select: { boosterId: true },
        })
      : Promise.resolve([]),
  ]);

  const reportCounts = new Map(
    reportGroups.map((group) => [group.boosterId, group._count._all])
  );
  const likedIds = new Set(likes.map((like) => like.boosterId));
  const recommendedIds = new Set(
    recommendations.map((recommendation) => recommendation.boosterId)
  );

  const cards: MarketplaceCard[] = candidates.map((profile) => {
    const approvedReviews = profile.reviews;
    const reviewSum = approvedReviews.reduce((total, review) => total + review.score, 0);
    const verifiedReviewCount = approvedReviews.filter((review) => review.verified).length;
    const combinedCount = profile.ratingCount + approvedReviews.length;
    const combinedAverage =
      combinedCount > 0
        ? (profile.ratingAvg * profile.ratingCount + reviewSum) / combinedCount
        : 0;

    const ranking = scoreMarketplaceBooster({
      verifiedReviewCount,
      approvedReviewCount: approvedReviews.length,
      ratingAvg: combinedAverage,
      completedJobs: profile.completedJobs,
      recommendationCount: profile._count.recommendations,
      responseTimeHours: profile.responseTimeHours,
      verificationStatus: profile.verificationStatus,
      createdAt: profile.createdAt,
      reportCount: reportCounts.get(profile.id) ?? 0,
      rankingBoost: profile.rankingBoost,
      sponsored: profile.sponsored,
    });

    return {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.displayName,
      businessName: profile.businessName,
      logoUrl: profile.logoUrl,
      coverUrl: profile.coverUrl,
      bio: profile.bio,
      location: profile.location,
      availabilityStatus: profile.availabilityStatus,
      responseTimeHours: profile.responseTimeHours,
      startingPrice: profile.startingPrice,
      verificationStatus: profile.verificationStatus,
      verificationLevel: profile.verificationLevel,
      categories: parseStringArray(profile.categoriesJson),
      skills: parseStringArray(profile.skillsJson),
      coverage: parseStringArray(profile.coverageJson),
      ratingAvg: Math.round(combinedAverage * 10) / 10,
      ratingCount: combinedCount,
      completedJobs: profile.completedJobs,
      likeCount: profile._count.likes,
      commentCount: profile._count.comments,
      recommendationCount: profile._count.recommendations,
      approvedReviewCount: approvedReviews.length,
      verifiedReviewCount,
      ranking,
      isLiked: likedIds.has(profile.id),
      isRecommended: recommendedIds.has(profile.id),
      sponsored: profile.sponsored,
      rankingBoost: profile.rankingBoost,
      createdAt: profile.createdAt.toISOString(),
    };
  });

  const sorted = [...cards].sort((a, b) => {
    switch (filters.sort) {
      case "rating":
        return b.ratingAvg - a.ratingAvg;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "completed":
        return b.completedJobs - a.completedJobs;
      default:
        return b.ranking.score - a.ranking.score;
    }
  });

  const total = sorted.length;
  const start = (page - 1) * MARKETPLACE_PAGE_SIZE;
  return {
    items: sorted.slice(start, start + MARKETPLACE_PAGE_SIZE),
    total,
    page,
    pageSize: MARKETPLACE_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / MARKETPLACE_PAGE_SIZE)),
  };
}

export interface MarketplaceReviewView {
  id: string;
  score: number;
  body: string | null;
  verified: boolean;
  reviewerName: string;
  createdAt: string;
}

export interface MarketplaceCommentView {
  id: string;
  body: string;
  userName: string;
  createdAt: string;
}

export interface MarketplaceRecommendationView {
  id: string;
  note: string | null;
  userName: string;
  createdAt: string;
}

export interface MarketplaceProfileView {
  id: string;
  userId: string;
  handle: string | null;
  displayName: string;
  businessName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  location: string | null;
  availabilityStatus: string;
  responseTimeHours: number | null;
  startingPrice: number | null;
  verificationStatus: string;
  verificationLevel: string | null;
  verifiedAt: string | null;
  status: string;
  categories: string[];
  skills: string[];
  coverage: string[];
  availableHours: string | null;
  services: Array<{
    id: string;
    title: string;
    description: string | null;
    priceMin: number | null;
    priceMax: number | null;
    currency: string;
    deliveryDays: number | null;
    category: string | null;
    platform: string | null;
  }>;
  packages: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    deliveryDays: number | null;
    revisions: number | null;
    includes: string[];
  }>;
  portfolioItems: Array<{
    id: string;
    title: string;
    description: string | null;
    mediaUrl: string | null;
    externalUrl: string | null;
  }>;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  likeCount: number;
  commentCount: number;
  recommendationCount: number;
  verifiedReviewCount: number;
  approvedReviewCount: number;
  ranking: MarketplaceRankingResult;
  sponsored: boolean;
  rankingBoost: number;
  reviews: MarketplaceReviewView[];
  comments: MarketplaceCommentView[];
  recommendations: MarketplaceRecommendationView[];
  viewer: {
    isOwner: boolean;
    isLiked: boolean;
    isRecommended: boolean;
    myReview: {
      id: string;
      score: number;
      body: string | null;
      moderationState: string;
      verified: boolean;
    } | null;
    canReview: boolean;
    eligibleJobId: string | null;
  };
}

export async function getMarketplaceProfile(
  handleOrId: string,
  viewerId?: string | null,
  viewerClientId?: string | null
): Promise<MarketplaceProfileView | null> {
  const profile = await prisma.boosterProfile.findFirst({
    where: {
      OR: [{ handle: handleOrId }, { id: handleOrId }],
      status: { not: "SUSPENDED" },
    },
    include: {
      reviews: {
        where: { moderationState: "APPROVED" },
        include: { reviewer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        where: { moderationState: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      recommendations: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      services: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      packages: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      portfolioItems: {
        orderBy: { sortOrder: "asc" },
        include: { mediaAsset: { select: { url: true } } },
      },
      _count: {
        select: { likes: true, comments: true, recommendations: true },
      },
    },
  });
  if (!profile) return null;

  const [reports, like, recommendation, review] = await Promise.all([
    prisma.marketplaceReport.count({
      where: {
        boosterId: profile.id,
        status: { in: ["OPEN", "REVIEWING"] },
      },
    }),
    viewerId
      ? prisma.boosterLike.findUnique({
          where: { boosterId_userId: { boosterId: profile.id, userId: viewerId } },
        })
      : null,
    viewerId
      ? prisma.boosterRecommendation.findUnique({
          where: { boosterId_userId: { boosterId: profile.id, userId: viewerId } },
        })
      : null,
    viewerId
      ? prisma.boosterReview.findUnique({
          where: { boosterId_reviewerId: { boosterId: profile.id, reviewerId: viewerId } },
        })
      : null,
  ]);

  const eligibleJob =
    viewerClientId && !review
      ? await prisma.boosterJob.findFirst({
          where: {
            assignedBoosterId: profile.id,
            clientId: viewerClientId,
            status: { in: ["APPROVED", "PAID", "CLOSED"] },
          },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        })
      : null;

  const reviewSum = profile.reviews.reduce((total, item) => total + item.score, 0);
  const verifiedReviewCount = profile.reviews.filter((item) => item.verified).length;
  const combinedCount = profile.ratingCount + profile.reviews.length;
  const combinedAverage =
    combinedCount > 0
      ? (profile.ratingAvg * profile.ratingCount + reviewSum) / combinedCount
      : 0;

  const ranking = scoreMarketplaceBooster({
    verifiedReviewCount,
    approvedReviewCount: profile.reviews.length,
    ratingAvg: combinedAverage,
    completedJobs: profile.completedJobs,
    recommendationCount: profile._count.recommendations,
    responseTimeHours: profile.responseTimeHours,
    verificationStatus: profile.verificationStatus,
    createdAt: profile.createdAt,
    reportCount: reports,
    rankingBoost: profile.rankingBoost,
    sponsored: profile.sponsored,
  });

  return {
    id: profile.id,
    userId: profile.userId,
    handle: profile.handle,
    displayName: profile.displayName,
    businessName: profile.businessName,
    logoUrl: profile.logoUrl,
    coverUrl: profile.coverUrl,
    bio: profile.bio,
    location: profile.location,
    availabilityStatus: profile.availabilityStatus,
    responseTimeHours: profile.responseTimeHours,
    startingPrice: profile.startingPrice,
    verificationStatus: profile.verificationStatus,
    verificationLevel: profile.verificationLevel,
    verifiedAt: profile.verifiedAt ? profile.verifiedAt.toISOString() : null,
    status: profile.status,
    categories: parseStringArray(profile.categoriesJson),
    skills: parseStringArray(profile.skillsJson),
    coverage: parseStringArray(profile.coverageJson),
    availableHours: profile.availableHours,
    services:
      profile.services.length > 0
        ? profile.services.map((service) => ({
            id: service.id,
            title: service.title,
            description: service.description,
            priceMin: service.priceMin,
            priceMax: service.priceMax,
            currency: service.currency,
            deliveryDays: service.deliveryDays,
            category: service.category,
            platform: service.platform,
          }))
        : parseJsonArray<{ label: string; amount: string }>(profile.ratesJson).map(
            (rate, index) => ({
              id: `legacy-service-${index}`,
              title: rate.label,
              description: null,
              priceMin: parsePriceToInt(rate.amount),
              priceMax: parsePriceToInt(rate.amount),
              currency: "NGN",
              deliveryDays: null,
              category: null,
              platform: null,
            })
          ),
    packages: profile.packages.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      deliveryDays: item.deliveryDays,
      revisions: item.revisions,
      includes: parseStringArray(item.includesJson),
    })),
    portfolioItems:
      profile.portfolioItems.length > 0
        ? profile.portfolioItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            mediaUrl: item.mediaAsset?.url ?? null,
            externalUrl: item.externalUrl,
          }))
        : parseJsonArray<{ title: string; url: string; description?: string }>(
            profile.portfolioJson
          ).map((item, index) => ({
            id: `legacy-portfolio-${index}`,
            title: item.title,
            description: item.description ?? null,
            mediaUrl: null,
            externalUrl: item.url,
          })),
    ratingAvg: Math.round(combinedAverage * 10) / 10,
    ratingCount: combinedCount,
    completedJobs: profile.completedJobs,
    likeCount: profile._count.likes,
    commentCount: profile._count.comments,
    recommendationCount: profile._count.recommendations,
    verifiedReviewCount,
    approvedReviewCount: profile.reviews.length,
    ranking,
    sponsored: profile.sponsored,
    rankingBoost: profile.rankingBoost,
    reviews: profile.reviews.map((item) => ({
      id: item.id,
      score: item.score,
      body: item.body,
      verified: item.verified,
      reviewerName: item.reviewer.name,
      createdAt: item.createdAt.toISOString(),
    })),
    comments: profile.comments.map((item) => ({
      id: item.id,
      body: item.body,
      userName: item.user.name,
      createdAt: item.createdAt.toISOString(),
    })),
    recommendations: profile.recommendations.map((item) => ({
      id: item.id,
      note: item.note,
      userName: item.user.name,
      createdAt: item.createdAt.toISOString(),
    })),
    viewer: {
      isOwner: viewerId === profile.userId,
      isLiked: Boolean(like),
      isRecommended: Boolean(recommendation),
      myReview: review
        ? {
            id: review.id,
            score: review.score,
            body: review.body,
            moderationState: review.moderationState,
            verified: review.verified,
          }
        : null,
      canReview: Boolean(eligibleJob),
      eligibleJobId: eligibleJob?.id ?? null,
    },
  };
}
