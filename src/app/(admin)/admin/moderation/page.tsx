import React from "react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { campaignStatusLabel } from "@/lib/campaign-status";
import { CHANNEL_LABELS } from "@/lib/types/campaign";
import ModerationClient, {
  type ModerationCampaign,
} from "./ModerationClient";

export const dynamic = "force-dynamic";

export default async function CampaignModerationPage() {
  await requireStaff();

  const campaigns = await prisma.campaign.findMany({
    include: {
      client: { select: { name: true } },
      businessProfile: { select: { name: true } },
      inventory: { select: { name: true, city: true } },
      quotes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const data: ModerationCampaign[] = campaigns.map((campaign) => ({
    id: campaign.id,
    campaignNumber: campaign.campaignNumber,
    name: campaign.name,
    status: campaign.status,
    statusLabel: campaignStatusLabel(campaign.status),
    channel: CHANNEL_LABELS[campaign.channel] || campaign.channel,
    clientName: campaign.client?.name || campaign.contactName || "Advertiser",
    businessProfileName: campaign.businessProfile?.name || null,
    inventoryName: campaign.inventory?.name || null,
    inventoryCity: campaign.inventory?.city || null,
    location: campaign.targetLocation,
    budget: campaign.budget,
    duration: campaign.duration,
    objective: campaign.objective,
    productService: campaign.productService,
    targetAudience: campaign.targetAudience,
    creativeAssetUrl: campaign.creativeAssetUrl,
    creativeAssetType: campaign.creativeAssetType,
    notes: campaign.notes,
    createdAt: campaign.createdAt.toISOString(),
    startDate: campaign.startDate ? campaign.startDate.toISOString() : null,
    endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
    quote: campaign.quotes[0]
      ? {
          id: campaign.quotes[0].id,
          quoteNumber: campaign.quotes[0].quoteNumber,
          amount: campaign.quotes[0].amount,
          status: campaign.quotes[0].status,
          sentAt: campaign.quotes[0].sentAt.toISOString(),
        }
      : null,
  }));

  return <ModerationClient campaigns={data} />;
}
