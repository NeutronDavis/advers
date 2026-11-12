"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { dispatchNotification } from "@/lib/notifications";
import { allocateWithdrawal } from "@/lib/finance";
import { getBoosterFinanceData } from "@/server/data/finance";

export type FinanceActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function getStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

async function notifyUser(input: {
  userId: string;
  event: string;
  title: string;
  body: string;
  link?: string;
}) {
  await dispatchNotification(input);
}

async function notifyAdmins(input: {
  event: string;
  title: string;
  body: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      dispatchNotification({
        userId: admin.id,
        event: input.event,
        title: input.title,
        body: input.body,
        link: input.link,
      })
    )
  );
}

const WithdrawalSchema = z.object({
  amount: z.number().int().positive("Enter a withdrawal amount."),
  method: z.string().optional(),
  accountDetails: z.string().optional(),
});

export async function requestWithdrawalAction(
  input: z.input<typeof WithdrawalSchema>
): Promise<FinanceActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const finance = await getBoosterFinanceData(session.id);
  if (!finance) {
    return { success: false, error: "Create a Booster profile first." };
  }

  const parsed = WithdrawalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  if (parsed.data.amount > finance.totals.withdrawable) {
    return {
      success: false,
      error: `You can withdraw up to ₦${finance.totals.withdrawable.toLocaleString(
        "en-NG"
      )}.`,
    };
  }

  const withdrawal = await prisma.$transaction(async (tx) => {
    const created = await tx.withdrawal.create({
      data: {
        boosterId: finance.boosterId,
        amount: parsed.data.amount,
        status: "REQUESTED",
        method: parsed.data.method || "BANK_TRANSFER",
        accountDetailsJson: parsed.data.accountDetails
          ? JSON.stringify({ details: parsed.data.accountDetails.trim() })
          : null,
        reference: `WDR-${Date.now()}`,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_WITHDRAWAL_REQUESTED",
        description: `${finance.displayName} requested a withdrawal of ₦${parsed.data.amount.toLocaleString("en-NG")}.`,
        metadata: JSON.stringify({ withdrawalId: created.id }),
      },
    });

    return created;
  });

  await notifyAdmins({
    event: "BOOSTER_WITHDRAWAL_REQUESTED",
    title: "New withdrawal request",
    body: `${finance.displayName} requested ₦${parsed.data.amount.toLocaleString("en-NG")}.`,
    link: "/admin/finance",
  });

  revalidatePath("/booster/earnings");
  revalidatePath("/admin/finance");
  return { success: true, id: withdrawal.id };
}

export async function reviewWithdrawalAction(input: {
  withdrawalId: string;
  decision: "APPROVED" | "REJECTED" | "PAID";
  notes?: string;
}): Promise<FinanceActionResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: input.withdrawalId },
    include: { booster: true },
  });
  if (!withdrawal) return { success: false, error: "Withdrawal not found." };

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (input.decision === "PAID") {
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "PAID",
          paidAt: now,
          reviewedById: session.id,
          reviewedAt: now,
          notes: input.notes?.trim() || withdrawal.notes,
        },
      });

      const approvedEarnings = await tx.boosterEarning.findMany({
        where: { boosterId: withdrawal.boosterId, status: "APPROVED" },
        orderBy: { createdAt: "asc" },
      });

      const allocations = allocateWithdrawal(withdrawal.amount, approvedEarnings);
      for (const allocation of allocations) {
        await tx.boosterEarning.update({
          where: { id: allocation.earningId },
          data: {
            paidAmount: allocation.paidAmount,
            status: allocation.fullyPaid ? "PAID" : "APPROVED",
            paidAt: allocation.fullyPaid ? now : undefined,
            withdrawalId: withdrawal.id,
          },
        });
      }

      await tx.ledgerEntry.create({
        data: {
          type: "WITHDRAWAL",
          status: "PAID",
          payeeId: withdrawal.booster.userId,
          grossAmount: withdrawal.amount,
          feeAmount: 0,
          netAmount: withdrawal.amount,
          reference: `LEDGER-WDR-${withdrawal.id}`,
          boosterId: withdrawal.boosterId,
          metadataJson: JSON.stringify({ withdrawalId: withdrawal.id }),
        },
      });
    } else {
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: input.decision,
          reviewedById: session.id,
          reviewedAt: now,
          notes: input.notes?.trim() || withdrawal.notes,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: `BOOSTER_WITHDRAWAL_${input.decision}`,
        targetType: "Withdrawal",
        targetId: withdrawal.id,
        details: input.notes?.trim() || `Withdrawal ${input.decision.toLowerCase()}.`,
      },
    });
  });

  await notifyUser({
    userId: withdrawal.booster.userId,
    event: `BOOSTER_WITHDRAWAL_${input.decision}`,
    title:
      input.decision === "PAID"
        ? "Withdrawal paid"
        : input.decision === "APPROVED"
          ? "Withdrawal approved"
          : "Withdrawal rejected",
    body:
      input.decision === "PAID"
        ? `₦${withdrawal.amount.toLocaleString("en-NG")} has been marked as paid.`
        : input.notes?.trim() ||
          `Your withdrawal request was ${input.decision.toLowerCase()}.`,
    link: "/booster/earnings",
  });

  revalidatePath("/admin/finance");
  revalidatePath("/booster/earnings");
  return { success: true, id: withdrawal.id };
}

export async function reviewBoosterVerificationAction(input: {
  boosterId: string;
  decision: "VERIFIED" | "REJECTED";
  level?: string;
  notes?: string;
}): Promise<FinanceActionResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const profile = await prisma.boosterProfile.findUnique({
    where: { id: input.boosterId },
  });
  if (!profile) return { success: false, error: "Booster profile not found." };

  await prisma.$transaction(async (tx) => {
    await tx.boosterProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: input.decision,
        verificationLevel: input.level?.trim() || profile.verificationLevel,
        verificationNotes: input.notes?.trim() || null,
        verificationReviewedAt: new Date(),
        verifiedAt: input.decision === "VERIFIED" ? new Date() : null,
        verifiedById: input.decision === "VERIFIED" ? session.id : null,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: `BOOSTER_VERIFICATION_${input.decision}`,
        targetType: "BoosterProfile",
        targetId: profile.id,
        details: input.notes?.trim() || `Booster verification ${input.decision.toLowerCase()}.`,
      },
    });
  });

  await notifyUser({
    userId: profile.userId,
    event: `BOOSTER_VERIFICATION_${input.decision}`,
    title:
      input.decision === "VERIFIED"
        ? "Booster profile verified"
        : "Booster verification rejected",
    body:
      input.notes?.trim() ||
      (input.decision === "VERIFIED"
        ? "Your Booster profile is now verified."
        : "Please update your verification documents and try again."),
    link: "/booster/verification",
  });

  revalidatePath("/admin/trust");
  revalidatePath("/booster/profile");
  revalidatePath("/booster/verification");
  revalidatePath("/booster/dashboard");
  return { success: true, id: profile.id };
}

export async function moderateRatingAction(input: {
  ratingId: string;
  decision: "APPROVED" | "REJECTED";
}): Promise<FinanceActionResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const rating = await prisma.rating.findUnique({
    where: { id: input.ratingId },
    include: { ratedBooster: true },
  });
  if (!rating) return { success: false, error: "Rating not found." };

  await prisma.$transaction(async (tx) => {
    await tx.rating.update({
      where: { id: rating.id },
      data: { moderationState: input.decision },
    });

    if (input.decision === "APPROVED") {
      const approved = await tx.rating.findMany({
        where: {
          ratedBoosterId: rating.ratedBoosterId,
          moderationState: "APPROVED",
        },
        select: { score: true },
      });
      const average =
        approved.length > 0
          ? approved.reduce((total, item) => total + item.score, 0) / approved.length
          : 0;
      await tx.boosterProfile.update({
        where: { id: rating.ratedBoosterId },
        data: {
          ratingAvg: Math.round(average * 10) / 10,
          ratingCount: approved.length,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: `BOOSTER_RATING_${input.decision}`,
        targetType: "Rating",
        targetId: rating.id,
        details: `Rating ${input.decision.toLowerCase()}.`,
      },
    });
  });

  revalidatePath("/admin/trust");
  revalidatePath("/booster/dashboard");
  return { success: true, id: rating.id };
}

export async function resolveDisputeAction(input: {
  disputeId: string;
  status: "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  resolution?: string;
}): Promise<FinanceActionResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    include: { againstBooster: true, openedBy: true },
  });
  if (!dispute) return { success: false, error: "Dispute not found." };

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: input.status,
        resolution: input.resolution?.trim() || dispute.resolution,
        reviewedById: session.id,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: `DISPUTE_${input.status}`,
        targetType: "Dispute",
        targetId: dispute.id,
        details: input.resolution?.trim() || `Dispute ${input.status.toLowerCase()}.`,
      },
    });
  });

  await notifyUser({
    userId: dispute.openedById,
    event: `DISPUTE_${input.status}`,
    title: "Dispute update",
    body: input.resolution?.trim() || `Your dispute is now ${input.status.toLowerCase().replace(/_/g, " ")}.`,
    link: "/portal/booster-jobs",
  });

  if (dispute.againstBooster) {
    await notifyUser({
      userId: dispute.againstBooster.userId,
      event: `DISPUTE_${input.status}`,
      title: "Dispute update",
      body: input.resolution?.trim() || `A dispute involving you is now ${input.status.toLowerCase().replace(/_/g, " ")}.`,
      link: "/booster/applications",
    });
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/trust");
  return { success: true, id: dispute.id };
}

export async function openBoosterDisputeAction(input: {
  jobId: string;
  reason: string;
  evidence?: string;
}): Promise<FinanceActionResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!input.reason.trim()) {
    return { success: false, error: "Describe the dispute." };
  }

  const job = await prisma.boosterJob.findFirst({
    where: { id: input.jobId, clientId: session.clientId },
    include: { assignedBooster: true },
  });
  if (!job) return { success: false, error: "Booster job not found." };
  if (!job.assignedBoosterId) {
    return { success: false, error: "This job has no assigned Booster." };
  }

  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        jobId: job.id,
        campaignId: job.campaignId,
        openedById: session.id,
        againstBoosterId: job.assignedBoosterId,
        reason: input.reason.trim(),
        evidenceJson: input.evidence
          ? JSON.stringify(
              input.evidence
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
            )
          : null,
        status: "OPEN",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "BOOSTER_DISPUTE_OPENED",
        description: `${session.name} opened a dispute for "${job.title}".`,
        metadata: JSON.stringify({ disputeId: created.id, jobId: job.id }),
      },
    });

    return created;
  });

  await notifyAdmins({
    event: "BOOSTER_DISPUTE_OPENED",
    title: "New Booster dispute",
    body: `${session.name} opened a dispute for "${job.title}".`,
    link: "/admin/trust",
  });

  revalidatePath("/portal/booster-jobs");
  revalidatePath("/admin/trust");
  return { success: true, id: dispute.id };
}

export async function rateBoosterAction(input: {
  jobId: string;
  score: number;
  comment?: string;
}): Promise<FinanceActionResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (input.score < 1 || input.score > 5) {
    return { success: false, error: "Choose a rating between 1 and 5." };
  }

  const job = await prisma.boosterJob.findFirst({
    where: { id: input.jobId, clientId: session.clientId },
    include: { assignedBooster: true },
  });
  if (!job) return { success: false, error: "Booster job not found." };
  if (!["APPROVED", "PAID", "CLOSED"].includes(job.status)) {
    return { success: false, error: "You can rate a Booster after work is approved." };
  }
  if (!job.assignedBoosterId) {
    return { success: false, error: "This job has no assigned Booster." };
  }

  const existing = await prisma.rating.findUnique({
    where: {
      jobId_reviewerId: { jobId: job.id, reviewerId: session.id },
    },
  });
  if (existing) {
    return { success: false, error: "You have already rated this Booster for this job." };
  }

  const rating = await prisma.$transaction(async (tx) => {
    const created = await tx.rating.create({
      data: {
        jobId: job.id,
        reviewerId: session.id,
        ratedBoosterId: job.assignedBoosterId!,
        score: input.score,
        comment: input.comment?.trim() || null,
        moderationState: "PENDING",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "BOOSTER_RATED",
        description: `${session.name} rated the Booster for "${job.title}".`,
        metadata: JSON.stringify({ ratingId: created.id, jobId: job.id }),
      },
    });

    return created;
  });

  await notifyAdmins({
    event: "BOOSTER_RATING_SUBMITTED",
    title: "New Booster rating",
    body: `${session.name} submitted a ${input.score}-star rating for "${job.title}".`,
    link: "/admin/trust",
  });

  revalidatePath("/portal/booster-jobs");
  revalidatePath("/admin/trust");
  return { success: true, id: rating.id };
}
