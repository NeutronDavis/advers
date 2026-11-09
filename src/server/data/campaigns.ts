import type { Campaign as CampaignRecord } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthSessionUser } from "@/lib/types/dto";
import { campaignStatusLabel } from "@/lib/campaign-status";
import {
  CHANNEL_LABELS,
  channelIcon,
  type Campaign,
  type CampaignViewStatus,
} from "@/lib/types/campaign";

function mapStatus(status: CampaignRecord["status"]): CampaignViewStatus {
  switch (status) {
    case "DRAFT":
      return "DRAFT";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "QUOTE_REQUIRED":
    case "AWAITING_APPROVAL":
    case "PENDING_REVIEW":
    case "REVISION_REQUESTED":
      return "IN_REVIEW";
    case "AWAITING_PAYMENT":
    case "CONFIRMED":
    case "IN_PROGRESS":
    case "ON_HOLD":
    case "PARTIALLY_COMPLETED":
    case "DISPUTED":
    case "APPROVED":
    case "SCHEDULED":
    case "ACTIVE":
      return "ACTIVE";
    case "COMPLETED":
      return "COMPLETED";
    case "REJECTED":
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "DRAFT";
  }
}

export function mapCampaignRecord(record: CampaignRecord): Campaign {
  const channel = CHANNEL_LABELS[record.channel] || record.channel;
  return {
    id: record.id,
    name: record.name,
    channel,
    location: record.targetLocation,
    budget: record.budget,
    duration: record.duration,
    goal: record.objective,
    status: mapStatus(record.status),
    rawStatus: record.status,
    statusLabel: campaignStatusLabel(record.status),
    createdAt: record.createdAt.toISOString().split("T")[0],
    icon: channelIcon(channel),
  };
}

export async function getCampaignsForUser(
  user: AuthSessionUser
): Promise<Campaign[]> {
  const campaigns = await prisma.campaign.findMany({
    where: user.clientId
      ? { OR: [{ userId: user.id }, { clientId: user.clientId }] }
      : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return campaigns.map(mapCampaignRecord);
}

export async function getCampaignByIdForUser(
  id: string,
  user: AuthSessionUser
): Promise<Campaign | null> {
  const campaign = await prisma.campaign.findFirst({
    where: user.clientId
      ? {
          id,
          OR: [{ userId: user.id }, { clientId: user.clientId }],
        }
      : { id, userId: user.id },
  });

  return campaign ? mapCampaignRecord(campaign) : null;
}
