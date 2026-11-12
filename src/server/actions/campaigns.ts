"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CampaignStatus, ChannelType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateCampaignWorkspace } from "@/lib/entitlements";
import { canTransitionCampaign } from "@/lib/campaign-status";
import { mapCampaignRecord } from "@/server/data/campaigns";
import type { Campaign } from "@/lib/types/campaign";

const OptionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined))
  .refine((value) => !value || !Number.isNaN(value.getTime()), {
    message: "Enter a valid date.",
  });

const CreateCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required."),
  channel: z.string().min(1, "Choose an advertising channel."),
  location: z.string().min(1, "Choose a target location."),
  budget: z.number().int().positive("Budget must be greater than zero."),
  duration: z.string().min(1, "Choose a campaign duration."),
  goal: z.string().min(1, "Choose a campaign objective."),
  businessProfileId: z.string().optional(),
  inventoryId: z.string().optional(),
  mediaSlotId: z.string().optional(),
  productService: z.string().optional(),
  targetAudience: z.string().optional(),
  startDate: OptionalDate,
  endDate: OptionalDate,
  contactName: z.string().optional(),
  contactEmail: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid contact email."
    ),
  contactPhone: z.string().optional(),
  creativeAssetUrl: z.string().optional(),
  creativeAssetType: z.string().optional(),
  notes: z.string().optional(),
});

const CHANNEL_MAP: Record<string, ChannelType> = {
  "Digital billboards": ChannelType.DIGITAL_BILLBOARD,
  "Digital billboards (DOOH)": ChannelType.DIGITAL_BILLBOARD,
  "Static billboards": ChannelType.STATIC_BILLBOARD,
  "Static billboards (OOH)": ChannelType.STATIC_BILLBOARD,
  "FM radio": ChannelType.FM_RADIO,
  "FM radio advertising": ChannelType.FM_RADIO,
  Television: ChannelType.TELEVISION,
  "Television advertising": ChannelType.TELEVISION,
  Newspapers: ChannelType.NEWSPAPER,
  "Newspapers & Press": ChannelType.NEWSPAPER,
  "Podcast advertising": ChannelType.PODCAST,
  AdBoosters: ChannelType.ADBOOSTERS,
  "Influencer marketplace": ChannelType.INFLUENCER,
  "Influencer Hub": ChannelType.INFLUENCER,
};

function resolveChannel(value: string): ChannelType {
  if (value.startsWith("Influencer:")) return ChannelType.INFLUENCER;
  return CHANNEL_MAP[value] || ChannelType.DIGITAL_BILLBOARD;
}

export type CreateCampaignInput = z.input<typeof CreateCampaignSchema>;

export type CreateCampaignResult =
  | { success: true; data: Campaign }
  | { success: false; error: string };

export async function createCampaignAction(
  input: CreateCampaignInput
): Promise<CreateCampaignResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to create a campaign." };
  }
  if (!session.clientId) {
    return {
      success: false,
      error: "Complete your account setup and choose a plan before creating a campaign.",
    };
  }

  const parsed = CreateCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const workspaceCheck = await canCreateCampaignWorkspace(session.clientId);
  if (!workspaceCheck.allowed) {
    return {
      success: false,
      error: workspaceCheck.reason || "Campaign workspace limit reached.",
    };
  }

  let businessProfileId: string | null = null;
  if (parsed.data.businessProfileId) {
    const profile = await prisma.businessProfile.findFirst({
      where: { id: parsed.data.businessProfileId, clientId: session.clientId },
      select: { id: true },
    });
    if (!profile) {
      return { success: false, error: "That business profile is not available." };
    }
    businessProfileId = profile.id;
  }

  let inventoryId: string | null = null;
  if (parsed.data.inventoryId) {
    const inventory = await prisma.mediaInventory.findFirst({
      where: { id: parsed.data.inventoryId, status: "OPERATIONAL" },
      select: { id: true },
    });
    if (!inventory) {
      return { success: false, error: "That media inventory is not available." };
    }
    inventoryId = inventory.id;
  }

  let mediaSlotId: string | null = null;
  if (parsed.data.mediaSlotId) {
    const slot = await prisma.mediaSlot.findUnique({
      where: { id: parsed.data.mediaSlotId },
      include: { inventory: { select: { id: true, status: true } } },
    });
    if (
      !slot ||
      slot.inventory.status !== "OPERATIONAL" ||
      !["AVAILABLE", "LIMITED"].includes(slot.status) ||
      slot.booked >= slot.capacity
    ) {
      return {
        success: false,
        error: "That time slot is no longer available. Choose another time.",
      };
    }
    if (inventoryId && slot.inventoryId !== inventoryId) {
      return {
        success: false,
        error: "The selected time slot does not belong to the selected partner.",
      };
    }
    mediaSlotId = slot.id;
    inventoryId = slot.inventoryId;
  }

  const campaign = await prisma.$transaction(async (tx) => {
    const created = await tx.campaign.create({
      data: {
        campaignNumber: `CAMP-${Date.now().toString().slice(-8)}-${Math.floor(
          Math.random() * 90 + 10
        )}`,
        name: parsed.data.name.trim(),
        channel: resolveChannel(parsed.data.channel),
        status: CampaignStatus.SUBMITTED,
        objective: parsed.data.goal,
        targetLocation: parsed.data.location,
        budget: parsed.data.budget,
        duration: parsed.data.duration,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        productService: parsed.data.productService?.trim() || null,
        targetAudience: parsed.data.targetAudience?.trim() || null,
        contactName: parsed.data.contactName?.trim() || null,
        contactEmail: parsed.data.contactEmail?.trim() || null,
        contactPhone: parsed.data.contactPhone?.trim() || null,
        creativeAssetUrl: parsed.data.creativeAssetUrl?.trim() || null,
        creativeAssetType: parsed.data.creativeAssetType?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        businessProfileId,
        inventoryId,
        mediaSlotId,
        userId: session.id,
        clientId: session.clientId,
      },
    });

    await tx.campaignStatusEvent.create({
      data: {
        campaignId: created.id,
        toStatus: CampaignStatus.SUBMITTED,
        actorId: session.id,
        note: "Campaign submitted for review.",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "CAMPAIGN_SUBMITTED",
        description: `${session.name} submitted campaign "${created.name}" for review.`,
        metadata: JSON.stringify({ campaignId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");

  return { success: true, data: mapCampaignRecord(campaign) };
}

const SaveDraftSchema = z.object({
  name: z.string().min(1, "Give the draft a name."),
  channel: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().int().min(0).optional(),
  duration: z.string().optional(),
  goal: z.string().optional(),
  businessProfileId: z.string().optional(),
  inventoryId: z.string().optional(),
  mediaSlotId: z.string().optional(),
  productService: z.string().optional(),
  targetAudience: z.string().optional(),
  startDate: OptionalDate,
  endDate: OptionalDate,
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  creativeAssetUrl: z.string().optional(),
  creativeAssetType: z.string().optional(),
  notes: z.string().optional(),
});

export type SaveCampaignDraftInput = z.input<typeof SaveDraftSchema>;

export async function saveCampaignDraftAction(
  input: SaveCampaignDraftInput
): Promise<CreateCampaignResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to save a draft." };
  }
  if (!session.clientId) {
    return {
      success: false,
      error: "Complete your account setup and choose a plan before saving a draft.",
    };
  }

  const parsed = SaveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const workspaceCheck = await canCreateCampaignWorkspace(session.clientId);
  if (!workspaceCheck.allowed) {
    return {
      success: false,
      error: workspaceCheck.reason || "Campaign workspace limit reached.",
    };
  }

  let businessProfileId: string | null = null;
  if (parsed.data.businessProfileId) {
    const profile = await prisma.businessProfile.findFirst({
      where: { id: parsed.data.businessProfileId, clientId: session.clientId },
      select: { id: true },
    });
    if (profile) businessProfileId = profile.id;
  }

  let inventoryId: string | null = null;
  if (parsed.data.inventoryId) {
    const inventory = await prisma.mediaInventory.findFirst({
      where: { id: parsed.data.inventoryId, status: "OPERATIONAL" },
      select: { id: true },
    });
    if (inventory) inventoryId = inventory.id;
  }

  let mediaSlotId: string | null = null;
  if (parsed.data.mediaSlotId) {
    const slot = await prisma.mediaSlot.findUnique({
      where: { id: parsed.data.mediaSlotId },
      select: { id: true, inventoryId: true },
    });
    if (slot && (!inventoryId || slot.inventoryId === inventoryId)) {
      mediaSlotId = slot.id;
      inventoryId = slot.inventoryId;
    }
  }

  const campaign = await prisma.$transaction(async (tx) => {
    const created = await tx.campaign.create({
      data: {
        campaignNumber: `DRAFT-${Date.now().toString().slice(-8)}-${Math.floor(
          Math.random() * 90 + 10
        )}`,
        name: parsed.data.name.trim(),
        channel: parsed.data.channel
          ? resolveChannel(parsed.data.channel)
          : ChannelType.DIGITAL_BILLBOARD,
        status: CampaignStatus.DRAFT,
        objective: parsed.data.goal || "To be defined",
        targetLocation: parsed.data.location || "To be confirmed",
        budget: parsed.data.budget || 0,
        duration: parsed.data.duration || "To be confirmed",
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        productService: parsed.data.productService?.trim() || null,
        targetAudience: parsed.data.targetAudience?.trim() || null,
        contactName: parsed.data.contactName?.trim() || null,
        contactEmail: parsed.data.contactEmail?.trim() || null,
        contactPhone: parsed.data.contactPhone?.trim() || null,
        creativeAssetUrl: parsed.data.creativeAssetUrl?.trim() || null,
        creativeAssetType: parsed.data.creativeAssetType?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        businessProfileId,
        inventoryId,
        mediaSlotId,
        userId: session.id,
        clientId: session.clientId,
      },
    });

    await tx.campaignStatusEvent.create({
      data: {
        campaignId: created.id,
        toStatus: CampaignStatus.DRAFT,
        actorId: session.id,
        note: "Campaign draft saved.",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "CAMPAIGN_DRAFT_SAVED",
        description: `${session.name} saved campaign draft "${created.name}".`,
        metadata: JSON.stringify({ campaignId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/campaigns");
  return { success: true, data: mapCampaignRecord(campaign) };
}

export type SubmitDraftResult =
  | { success: true }
  | { success: false; error: string };

export async function submitCampaignDraftAction(
  campaignId: string
): Promise<SubmitDraftResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const campaign = await prisma.campaign.findFirst({
    where: session.clientId
      ? {
          id: campaignId,
          OR: [{ userId: session.id }, { clientId: session.clientId }],
        }
      : { id: campaignId, userId: session.id },
  });
  if (!campaign) return { success: false, error: "Campaign draft not found." };
  if (campaign.status !== "DRAFT") {
    return { success: false, error: "Only draft campaigns can be submitted." };
  }
  if (!canTransitionCampaign(campaign.status, "SUBMITTED")) {
    return { success: false, error: "This draft cannot be submitted." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.SUBMITTED },
    });
    await tx.campaignStatusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: CampaignStatus.SUBMITTED,
        actorId: session.id,
        note: "Draft submitted for review.",
      },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "CAMPAIGN_SUBMITTED",
        description: `${session.name} submitted draft "${campaign.name}" for review.`,
        metadata: JSON.stringify({ campaignId: campaign.id }),
      },
    });
  });

  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");
  return { success: true };
}
