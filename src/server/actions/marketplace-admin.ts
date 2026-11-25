"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { getSession } from "@/lib/session";

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

async function staffSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN" && session.role !== "STAFF") return null;
  return session;
}

export async function recalculateBoosterRating(boosterId: string): Promise<void> {
  const [profileReviews, jobRatings] = await Promise.all([
    prisma.boosterReview.findMany({
      where: { boosterId, moderationState: "APPROVED" },
      select: { score: true },
    }),
    prisma.rating.findMany({
      where: { ratedBoosterId: boosterId, moderationState: "APPROVED" },
      select: { score: true },
    }),
  ]);

  const scores = [
    ...profileReviews.map((review) => review.score),
    ...jobRatings.map((rating) => rating.score),
  ];
  const average =
    scores.length > 0 ? scores.reduce((total, score) => total + score, 0) / scores.length : 0;

  await prisma.boosterProfile.update({
    where: { id: boosterId },
    data: {
      ratingAvg: Math.round(average * 10) / 10,
      ratingCount: scores.length,
    },
  });
}

function revalidateMarketplace(boosterHandle: string | null, boosterId: string) {
  revalidatePath("/admin/marketplace");
  revalidatePath("/portal/adboosters");
  revalidatePath(`/portal/adboosters/${boosterHandle ?? boosterId}`);
  revalidatePath("/booster/profile");
}

export async function moderateBoosterCommentAction(input: {
  commentId: string;
  decision: "APPROVED" | "REJECTED";
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const comment = await prisma.boosterComment.findUnique({
    where: { id: input.commentId },
    include: {
      booster: { select: { id: true, handle: true, displayName: true, userId: true } },
      user: { select: { id: true } },
    },
  });
  if (!comment) return { success: false, error: "Comment not found." };

  await prisma.boosterComment.update({
    where: { id: comment.id },
    data: { moderationState: input.decision },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `MARKETPLACE_COMMENT_${input.decision}`,
      description: `${session.name} ${input.decision.toLowerCase()} a comment on ${comment.booster.displayName}.`,
      metadata: JSON.stringify({ commentId: comment.id }),
    },
  });
  await dispatchNotificationSafe({
    userId: comment.user.id,
    event: `MARKETPLACE_COMMENT_${input.decision}`,
    title:
      input.decision === "APPROVED" ? "Comment published" : "Comment rejected",
    body:
      input.decision === "APPROVED"
        ? "Your marketplace comment is now visible."
        : "Your marketplace comment did not meet the community guidelines.",
    link: `/portal/adboosters/${comment.booster.handle ?? comment.booster.id}`,
  });

  revalidateMarketplace(comment.booster.handle, comment.booster.id);
  return { success: true };
}

export async function moderateBoosterReviewAction(input: {
  reviewId: string;
  decision: "APPROVED" | "REJECTED";
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const review = await prisma.boosterReview.findUnique({
    where: { id: input.reviewId },
    include: {
      booster: { select: { id: true, handle: true, displayName: true, userId: true } },
      reviewer: { select: { id: true } },
    },
  });
  if (!review) return { success: false, error: "Review not found." };

  await prisma.boosterReview.update({
    where: { id: review.id },
    data: { moderationState: input.decision },
  });
  await recalculateBoosterRating(review.booster.id);

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `MARKETPLACE_REVIEW_${input.decision}`,
      description: `${session.name} ${input.decision.toLowerCase()} a review for ${review.booster.displayName}.`,
      metadata: JSON.stringify({ reviewId: review.id }),
    },
  });
  await dispatchNotificationSafe({
    userId: review.reviewer.id,
    event: `MARKETPLACE_REVIEW_${input.decision}`,
    title:
      input.decision === "APPROVED" ? "Review published" : "Review rejected",
    body:
      input.decision === "APPROVED"
        ? "Your verified review is now visible."
        : "Your review did not meet the marketplace guidelines.",
    link: `/portal/adboosters/${review.booster.handle ?? review.booster.id}`,
  });
  if (input.decision === "APPROVED") {
    await dispatchNotificationSafe({
      userId: review.booster.userId,
      event: "BOOSTER_REVIEW_APPROVED",
      title: "New verified review",
      body: `A ${review.score}-star review is now visible on your profile.`,
      link: "/booster/profile",
    });
  }

  revalidateMarketplace(review.booster.handle, review.booster.id);
  return { success: true };
}

export async function bulkModerateBoosterCommentsAction(input: {
  commentIds: string[];
  decision: "APPROVED" | "REJECTED";
}): Promise<ActionResult<{ count: number }>> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };
  if (input.commentIds.length === 0) {
    return { success: false, error: "Select at least one comment." };
  }

  const result = await prisma.boosterComment.updateMany({
    where: { id: { in: input.commentIds }, moderationState: "PENDING" },
    data: { moderationState: input.decision },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `MARKETPLACE_COMMENTS_BULK_${input.decision}`,
      description: `${session.name} bulk ${input.decision.toLowerCase()} ${result.count} comments.`,
      metadata: JSON.stringify({ commentIds: input.commentIds }),
    },
  });
  revalidatePath("/admin/marketplace");
  revalidatePath("/portal/adboosters");
  return { success: true, count: result.count };
}

export async function bulkModerateBoosterReviewsAction(input: {
  reviewIds: string[];
  decision: "APPROVED" | "REJECTED";
}): Promise<ActionResult<{ count: number }>> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };
  if (input.reviewIds.length === 0) {
    return { success: false, error: "Select at least one review." };
  }

  const reviews = await prisma.boosterReview.findMany({
    where: { id: { in: input.reviewIds }, moderationState: "PENDING" },
    select: { id: true, boosterId: true },
  });
  const result = await prisma.boosterReview.updateMany({
    where: { id: { in: reviews.map((review) => review.id) } },
    data: { moderationState: input.decision },
  });
  const boosterIds = Array.from(new Set(reviews.map((review) => review.boosterId)));
  await Promise.all(boosterIds.map((boosterId) => recalculateBoosterRating(boosterId)));

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `MARKETPLACE_REVIEWS_BULK_${input.decision}`,
      description: `${session.name} bulk ${input.decision.toLowerCase()} ${result.count} reviews.`,
      metadata: JSON.stringify({ reviewIds: input.reviewIds }),
    },
  });
  revalidatePath("/admin/marketplace");
  revalidatePath("/portal/adboosters");
  return { success: true, count: result.count };
}

export async function updateBoosterRankingAction(input: {
  boosterId: string;
  rankingBoost: number;
  sponsored: boolean;
  rankingNote?: string;
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const booster = await prisma.boosterProfile.findUnique({
    where: { id: input.boosterId },
    select: { id: true, handle: true },
  });
  if (!booster) return { success: false, error: "Booster not found." };

  const boost = Math.max(-20, Math.min(20, Math.round(input.rankingBoost)));
  await prisma.boosterProfile.update({
    where: { id: booster.id },
    data: {
      rankingBoost: boost,
      sponsored: input.sponsored,
      rankingNote: input.rankingNote?.trim() || null,
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "BOOSTER_RANKING_UPDATED",
      description: `${session.name} updated marketplace ranking for ${booster.id}.`,
      metadata: JSON.stringify({
        boosterId: booster.id,
        rankingBoost: boost,
        sponsored: input.sponsored,
      }),
    },
  });

  revalidateMarketplace(booster.handle, booster.id);
  return { success: true };
}

export async function resolveMarketplaceReportAction(input: {
  reportId: string;
  decision: "RESOLVED" | "DISMISSED";
  removeContent?: boolean;
  notes?: string;
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const report = await prisma.marketplaceReport.findUnique({
    where: { id: input.reportId },
    include: { booster: { select: { id: true, handle: true } } },
  });
  if (!report) return { success: false, error: "Report not found." };

  if (input.removeContent) {
    if (report.targetType === "COMMENT") {
      await prisma.boosterComment.updateMany({
        where: { id: report.targetId },
        data: { moderationState: "REJECTED" },
      });
    } else if (report.targetType === "REVIEW") {
      await prisma.boosterReview.updateMany({
        where: { id: report.targetId },
        data: { moderationState: "REJECTED" },
      });
      if (report.boosterId) await recalculateBoosterRating(report.boosterId);
    } else if (report.targetType === "RECOMMENDATION") {
      await prisma.boosterRecommendation.deleteMany({
        where: { id: report.targetId },
      });
    }
  }

  await prisma.marketplaceReport.update({
    where: { id: report.id },
    data: {
      status: input.decision,
      reviewedById: session.id,
      reviewedAt: new Date(),
      resolution: input.notes?.trim() || (input.removeContent ? "Content removed." : "No action required."),
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `MARKETPLACE_REPORT_${input.decision}`,
      description: `${session.name} ${input.decision.toLowerCase()} a marketplace report.`,
      metadata: JSON.stringify({
        reportId: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        removeContent: Boolean(input.removeContent),
      }),
    },
  });

  if (report.booster) {
    revalidateMarketplace(report.booster.handle, report.booster.id);
  } else {
    revalidatePath("/admin/marketplace");
  }
  return { success: true };
}
