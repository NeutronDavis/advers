"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CampaignStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  canTransitionCampaign,
  normalizeCampaignStatus,
} from "@/lib/campaign-status";

export type AdminCampaignResult =
  | { success: true }
  | { success: false; error: string };

async function getStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

async function recordStatusEvent(
  tx: Prisma.TransactionClient,
  input: {
    campaignId: string;
    fromStatus: CampaignStatus;
    toStatus: CampaignStatus;
    actorId: string;
    note?: string | null;
  }
) {
  await tx.campaignStatusEvent.create({
    data: {
      campaignId: input.campaignId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actorId: input.actorId,
      note: input.note || null,
    },
  });
}

export async function startCampaignReviewAction(
  campaignId: string
): Promise<AdminCampaignResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found." };
  if (!canTransitionCampaign(campaign.status, "UNDER_REVIEW")) {
    return { success: false, error: "This campaign cannot enter review from its current status." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.UNDER_REVIEW },
    });
    await recordStatusEvent(tx, {
      campaignId: campaign.id,
      fromStatus: campaign.status,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: session.id,
      note: "Campaign moved into review.",
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "CAMPAIGN_REVIEW_STARTED",
        targetType: "Campaign",
        targetId: campaign.id,
        details: "Campaign moved into review.",
      },
    });
  });

  revalidatePath("/admin/moderation");
  return { success: true };
}

export async function requestCampaignRevisionAction(
  campaignId: string,
  note: string
): Promise<AdminCampaignResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };
  if (!note.trim()) return { success: false, error: "Add a revision note." };

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found." };

  const normalized = normalizeCampaignStatus(campaign.status);
  const canStay = normalized === "UNDER_REVIEW";
  if (!canStay && !canTransitionCampaign(campaign.status, "UNDER_REVIEW")) {
    return { success: false, error: "A revision cannot be requested from this status." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.UNDER_REVIEW },
    });
    await recordStatusEvent(tx, {
      campaignId: campaign.id,
      fromStatus: campaign.status,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: session.id,
      note: `Revision requested: ${note.trim()}`,
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "CAMPAIGN_REVISION_REQUESTED",
        targetType: "Campaign",
        targetId: campaign.id,
        details: note.trim(),
      },
    });
  });

  revalidatePath("/admin/moderation");
  revalidatePath(`/portal/campaigns/${campaign.id}`);
  return { success: true };
}

export async function rejectCampaignAction(
  campaignId: string,
  reason: string
): Promise<AdminCampaignResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };
  if (!reason.trim()) return { success: false, error: "Add a rejection reason." };

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found." };
  if (!canTransitionCampaign(campaign.status, "REJECTED")) {
    return { success: false, error: "This campaign cannot be rejected from its current status." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.REJECTED },
    });
    await recordStatusEvent(tx, {
      campaignId: campaign.id,
      fromStatus: campaign.status,
      toStatus: CampaignStatus.REJECTED,
      actorId: session.id,
      note: reason.trim(),
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "CAMPAIGN_REJECTED",
        targetType: "Campaign",
        targetId: campaign.id,
        details: reason.trim(),
      },
    });
  });

  revalidatePath("/admin/moderation");
  revalidatePath(`/portal/campaigns/${campaign.id}`);
  return { success: true };
}

const QuoteSchema = z.object({
  campaignId: z.string().min(1),
  mediaCost: z.number().int().min(0),
  adversFee: z.number().int().min(0),
  productionCost: z.number().int().min(0),
  logisticsCost: z.number().int().min(0),
  smsCost: z.number().int().min(0),
  taxAmount: z.number().int().min(0),
  notes: z.string().optional(),
  expiresInDays: z.number().int().min(1).max(60).default(7),
});

export type CreateCampaignQuoteInput = z.input<typeof QuoteSchema>;

export async function createCampaignQuoteAction(
  input: CreateCampaignQuoteInput
): Promise<AdminCampaignResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const parsed = QuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const total =
    parsed.data.mediaCost +
    parsed.data.adversFee +
    parsed.data.productionCost +
    parsed.data.logisticsCost +
    parsed.data.smsCost +
    parsed.data.taxAmount;

  if (total <= 0) {
    return { success: false, error: "The quote total must be greater than zero." };
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: parsed.data.campaignId },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };

  if (!canTransitionCampaign(campaign.status, "AWAITING_APPROVAL")) {
    return {
      success: false,
      error: "A quote cannot be issued from this campaign status.",
    };
  }

  const expiresAt = new Date(
    Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000
  );

  await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        quoteNumber: `QTE-${Date.now()}`,
        campaignId: campaign.id,
        clientId: campaign.clientId,
        title: `Campaign quote: ${campaign.name}`,
        amount: total,
        mediaCost: parsed.data.mediaCost,
        adversFee: parsed.data.adversFee,
        productionCost: parsed.data.productionCost,
        logisticsCost: parsed.data.logisticsCost,
        smsCost: parsed.data.smsCost,
        taxAmount: parsed.data.taxAmount,
        notes: parsed.data.notes?.trim() || null,
        status: "SENT",
        expiresAt,
      },
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.AWAITING_APPROVAL },
    });

    await recordStatusEvent(tx, {
      campaignId: campaign.id,
      fromStatus: campaign.status,
      toStatus: CampaignStatus.AWAITING_APPROVAL,
      actorId: session.id,
      note: `Quote ${quote.quoteNumber} issued to the advertiser.`,
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "CAMPAIGN_QUOTE_ISSUED",
        targetType: "Campaign",
        targetId: campaign.id,
        details: `Quote ${quote.quoteNumber} issued for ₦${total.toLocaleString("en-NG")}.`,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "CAMPAIGN_QUOTE_ISSUED",
        description: `Quote ${quote.quoteNumber} issued for "${campaign.name}".`,
        metadata: JSON.stringify({ campaignId: campaign.id, quoteId: quote.id }),
      },
    });
  });

  revalidatePath("/admin/moderation");
  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  return { success: true };
}
