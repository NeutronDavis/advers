"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { getSession } from "@/lib/session";
import { enforceRateLimit } from "@/server/security/rate-limit";
import type { MarketplaceReportTarget } from "@prisma/client";

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

async function viewer() {
  return getSession();
}

async function limit(key: string, count: number, windowMs: number, message: string) {
  const result = await enforceRateLimit(key, count, windowMs);
  if (result.allowed) return null;
  return `${message} Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`;
}

function profilePath(handle: string | null, id: string): string {
  return `/portal/adboosters/${handle ?? id}`;
}

function revalidateProfile(handle: string | null, id: string) {
  revalidatePath("/portal/adboosters");
  revalidatePath(profilePath(handle, id));
  revalidatePath("/booster/profile");
  revalidatePath("/admin/marketplace");
}

async function loadBooster(boosterId: string) {
  return prisma.boosterProfile.findFirst({
    where: { id: boosterId, status: "ACTIVE" },
    select: {
      id: true,
      userId: true,
      handle: true,
      displayName: true,
      status: true,
    },
  });
}

export async function toggleBoosterLikeAction(
  boosterId: string
): Promise<ActionResult<{ liked: boolean; count: number }>> {
  const session = await viewer();
  if (!session) return { success: false, error: "Sign in to like a profile." };

  const limited = await limit(`market-like:${session.id}`, 30, 60_000, "Too many likes.");
  if (limited) return { success: false, error: limited };

  const booster = await loadBooster(boosterId);
  if (!booster) return { success: false, error: "Booster not found." };
  if (booster.userId === session.id) {
    return { success: false, error: "You cannot like your own profile." };
  }

  const existing = await prisma.boosterLike.findUnique({
    where: { boosterId_userId: { boosterId, userId: session.id } },
  });

  if (existing) {
    await prisma.boosterLike.delete({ where: { id: existing.id } });
    revalidateProfile(booster.handle, booster.id);
    const count = await prisma.boosterLike.count({ where: { boosterId } });
    return { success: true, liked: false, count };
  }

  await prisma.boosterLike.create({
    data: { boosterId, userId: session.id },
  });
  await dispatchNotificationSafe({
    userId: booster.userId,
    event: "BOOSTER_LIKED",
    title: "New profile like",
    body: `${session.name} liked your AdBooster profile.`,
    link: profilePath(booster.handle, booster.id),
  });
  revalidateProfile(booster.handle, booster.id);
  const count = await prisma.boosterLike.count({ where: { boosterId } });
  return { success: true, liked: true, count };
}

const CommentSchema = z.object({
  boosterId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(2, "Write at least 2 characters.")
    .max(1000, "Keep comments under 1,000 characters."),
});

export async function addBoosterCommentAction(
  input: z.input<typeof CommentSchema>
): Promise<ActionResult> {
  const session = await viewer();
  if (!session) return { success: false, error: "Sign in to comment." };

  const parsed = CommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const limited = await limit(
    `market-comment:${session.id}`,
    10,
    60 * 60_000,
    "Too many comments."
  );
  if (limited) return { success: false, error: limited };

  const booster = await loadBooster(parsed.data.boosterId);
  if (!booster) return { success: false, error: "Booster not found." };

  await prisma.boosterComment.create({
    data: {
      boosterId: booster.id,
      userId: session.id,
      body: parsed.data.body,
      moderationState: "PENDING",
    },
  });
  await dispatchNotificationSafe({
    userId: booster.userId,
    event: "BOOSTER_COMMENT_PENDING",
    title: "New profile comment",
    body: `${session.name} commented on your profile. It will appear after review.`,
    link: profilePath(booster.handle, booster.id),
  });
  await dispatchNotificationToAdmins(
    "BOOSTER_COMMENT_PENDING",
    "Marketplace comment awaiting review",
    `${session.name} commented on ${booster.displayName}.`,
    "/admin/marketplace"
  );
  revalidateProfile(booster.handle, booster.id);
  return { success: true };
}

export async function toggleBoosterRecommendationAction(
  boosterId: string,
  note?: string
): Promise<ActionResult<{ recommended: boolean }>> {
  const session = await viewer();
  if (!session) return { success: false, error: "Sign in to recommend a Booster." };

  const limited = await limit(
    `market-recommend:${session.id}`,
    10,
    60 * 60_000,
    "Too many recommendations."
  );
  if (limited) return { success: false, error: limited };

  const booster = await loadBooster(boosterId);
  if (!booster) return { success: false, error: "Booster not found." };
  if (booster.userId === session.id) {
    return { success: false, error: "You cannot recommend your own profile." };
  }

  // Anti-abuse: a brand-new account needs a completed job before recommending.
  const account = await prisma.user.findUnique({
    where: { id: session.id },
    select: { createdAt: true },
  });
  const accountAgeMs = account ? Date.now() - account.createdAt.getTime() : 0;
  if (accountAgeMs < 24 * 60 * 60 * 1000) {
    const completedJob = session.clientId
      ? await prisma.boosterJob.findFirst({
          where: {
            assignedBoosterId: booster.id,
            clientId: session.clientId,
            status: { in: ["APPROVED", "PAID", "CLOSED"] },
          },
          select: { id: true },
        })
      : null;
    if (!completedJob) {
      return {
        success: false,
        error:
          "Recommendations require a completed job or an account older than 24 hours.",
      };
    }
  }

  const existing = await prisma.boosterRecommendation.findUnique({
    where: { boosterId_userId: { boosterId, userId: session.id } },
  });

  if (existing) {
    await prisma.boosterRecommendation.delete({ where: { id: existing.id } });
    revalidateProfile(booster.handle, booster.id);
    return { success: true, recommended: false };
  }

  await prisma.boosterRecommendation.create({
    data: {
      boosterId,
      userId: session.id,
      note: note?.trim().slice(0, 500) || null,
    },
  });
  await dispatchNotificationSafe({
    userId: booster.userId,
    event: "BOOSTER_RECOMMENDED",
    title: "New recommendation",
    body: `${session.name} recommended your AdBooster profile.`,
    link: profilePath(booster.handle, booster.id),
  });
  revalidateProfile(booster.handle, booster.id);
  return { success: true, recommended: true };
}

const ReviewSchema = z.object({
  boosterId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  body: z.string().trim().max(2000).optional(),
});

export async function submitBoosterReviewAction(
  input: z.input<typeof ReviewSchema>
): Promise<ActionResult> {
  const session = await viewer();
  if (!session) return { success: false, error: "Sign in to review a Booster." };
  if (!session.clientId) {
    return { success: false, error: "Only advertiser accounts can leave a verified review." };
  }

  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const limited = await limit(
    `market-review:${session.id}`,
    5,
    24 * 60 * 60_000,
    "Too many review attempts."
  );
  if (limited) return { success: false, error: limited };

  const booster = await loadBooster(parsed.data.boosterId);
  if (!booster) return { success: false, error: "Booster not found." };

  const existing = await prisma.boosterReview.findUnique({
    where: {
      boosterId_reviewerId: { boosterId: booster.id, reviewerId: session.id },
    },
  });
  if (existing) {
    return { success: false, error: "You have already reviewed this Booster." };
  }

  const job = await prisma.boosterJob.findFirst({
    where: {
      assignedBoosterId: booster.id,
      clientId: session.clientId,
      status: { in: ["APPROVED", "PAID", "CLOSED"] },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  if (!job) {
    return {
      success: false,
      error: "A verified review requires a completed Booster job with this provider.",
    };
  }

  await prisma.boosterReview.create({
    data: {
      boosterId: booster.id,
      reviewerId: session.id,
      jobId: job.id,
      score: parsed.data.score,
      body: parsed.data.body || null,
      verified: true,
      moderationState: "PENDING",
    },
  });
  await dispatchNotificationSafe({
    userId: booster.userId,
    event: "BOOSTER_REVIEW_PENDING",
    title: "New verified review",
    body: `${session.name} left a ${parsed.data.score}-star review. It will appear after review.`,
    link: profilePath(booster.handle, booster.id),
  });
  await dispatchNotificationToAdmins(
    "BOOSTER_REVIEW_PENDING",
    "Marketplace review awaiting moderation",
    `${session.name} reviewed ${booster.displayName}.`,
    "/admin/marketplace"
  );
  revalidateProfile(booster.handle, booster.id);
  return { success: true };
}

const ReportSchema = z.object({
  targetType: z.enum(["PROFILE", "COMMENT", "REVIEW", "RECOMMENDATION"]),
  targetId: z.string().min(1),
  boosterId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "Describe the issue in at least 5 characters.")
    .max(1000, "Keep the report under 1,000 characters."),
  details: z.string().trim().max(2000).optional(),
});

export async function reportMarketplaceContentAction(
  input: z.input<typeof ReportSchema>
): Promise<ActionResult> {
  const session = await viewer();
  if (!session) return { success: false, error: "Sign in to report content." };

  const parsed = ReportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const limited = await limit(
    `market-report:${session.id}`,
    5,
    60 * 60_000,
    "Too many reports."
  );
  if (limited) return { success: false, error: limited };

  const booster = await loadBooster(parsed.data.boosterId);
  if (!booster) return { success: false, error: "Booster not found." };

  await prisma.marketplaceReport.create({
    data: {
      reporterId: session.id,
      targetType: parsed.data.targetType as MarketplaceReportTarget,
      targetId: parsed.data.targetId,
      boosterId: booster.id,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      status: "OPEN",
    },
  });
  await dispatchNotificationToAdmins(
    "MARKETPLACE_REPORT",
    "New marketplace report",
    `${session.name} reported ${parsed.data.targetType.toLowerCase()} content.`,
    "/admin/marketplace"
  );
  revalidatePath("/admin/marketplace");
  return { success: true };
}

async function dispatchNotificationToAdmins(
  event: string,
  title: string,
  body: string,
  link: string
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      dispatchNotificationSafe({ userId: admin.id, event, title, body, link })
    )
  );
}
