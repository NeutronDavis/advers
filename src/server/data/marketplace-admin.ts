import { prisma } from "@/lib/prisma";

export interface AdminMarketplaceComment {
  id: string;
  body: string;
  userName: string;
  userEmail: string;
  boosterId: string;
  boosterName: string;
  createdAt: string;
}

export interface AdminMarketplaceReview {
  id: string;
  score: number;
  body: string | null;
  verified: boolean;
  reviewerName: string;
  reviewerEmail: string;
  boosterId: string;
  boosterName: string;
  jobTitle: string | null;
  createdAt: string;
}

export interface AdminMarketplaceReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  reporterName: string;
  boosterId: string | null;
  boosterName: string | null;
  createdAt: string;
}

export interface AdminMarketplaceBooster {
  id: string;
  displayName: string;
  handle: string | null;
  status: string;
  verificationStatus: string;
  rankingBoost: number;
  sponsored: boolean;
  rankingNote: string | null;
}

export interface AdminMarketplaceData {
  pendingComments: AdminMarketplaceComment[];
  pendingReviews: AdminMarketplaceReview[];
  reports: AdminMarketplaceReport[];
  boosters: AdminMarketplaceBooster[];
  totals: {
    pendingComments: number;
    pendingReviews: number;
    openReports: number;
    verifiedBoosters: number;
    sponsoredBoosters: number;
  };
}

export async function getAdminMarketplaceData(): Promise<AdminMarketplaceData> {
  const [pendingComments, pendingReviews, reports, pendingCommentCount, pendingReviewCount, boosters, openReportCount, verifiedBoosters, sponsoredBoosters] =
    await Promise.all([
      prisma.boosterComment.findMany({
        where: { moderationState: "PENDING" },
        include: {
          user: { select: { name: true, email: true } },
          booster: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      prisma.boosterReview.findMany({
        where: { moderationState: "PENDING" },
        include: {
          reviewer: { select: { name: true, email: true } },
          booster: { select: { id: true, displayName: true } },
          job: { select: { title: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      prisma.marketplaceReport.findMany({
        where: { status: { in: ["OPEN", "REVIEWING"] } },
        include: {
          reporter: { select: { name: true } },
          booster: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      prisma.boosterComment.count({ where: { moderationState: "PENDING" } }),
      prisma.boosterReview.count({ where: { moderationState: "PENDING" } }),
      prisma.boosterProfile.findMany({
        orderBy: [{ sponsored: "desc" }, { rankingBoost: "desc" }, { ratingAvg: "desc" }],
        select: {
          id: true,
          displayName: true,
          handle: true,
          status: true,
          verificationStatus: true,
          rankingBoost: true,
          sponsored: true,
          rankingNote: true,
        },
        take: 120,
      }),
      prisma.marketplaceReport.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }),
      prisma.boosterProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.boosterProfile.count({ where: { sponsored: true } }),
    ]);

  return {
    pendingComments: pendingComments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      userName: comment.user.name,
      userEmail: comment.user.email,
      boosterId: comment.booster.id,
      boosterName: comment.booster.displayName,
      createdAt: comment.createdAt.toISOString(),
    })),
    pendingReviews: pendingReviews.map((review) => ({
      id: review.id,
      score: review.score,
      body: review.body,
      verified: review.verified,
      reviewerName: review.reviewer.name,
      reviewerEmail: review.reviewer.email,
      boosterId: review.booster.id,
      boosterName: review.booster.displayName,
      jobTitle: review.job?.title ?? null,
      createdAt: review.createdAt.toISOString(),
    })),
    reports: reports.map((report) => ({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      details: report.details,
      status: report.status,
      reporterName: report.reporter.name,
      boosterId: report.booster?.id ?? null,
      boosterName: report.booster?.displayName ?? null,
      createdAt: report.createdAt.toISOString(),
    })),
    boosters: boosters.map((booster) => ({
      id: booster.id,
      displayName: booster.displayName,
      handle: booster.handle,
      status: booster.status,
      verificationStatus: booster.verificationStatus,
      rankingBoost: booster.rankingBoost,
      sponsored: booster.sponsored,
      rankingNote: booster.rankingNote,
    })),
    totals: {
      pendingComments: pendingCommentCount,
      pendingReviews: pendingReviewCount,
      openReports: openReportCount,
      verifiedBoosters,
      sponsoredBoosters,
    },
  };
}
