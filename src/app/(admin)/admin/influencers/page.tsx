import React from "react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInfluencersClient from "./AdminInfluencersClient";

export const dynamic = "force-dynamic";

export default async function AdminInfluencersPage() {
  await requireStaff();

  const [profiles, requests] = await Promise.all([
    prisma.influencerProfile.findMany({
      orderBy: [{ verified: "asc" }, { followers: "desc" }],
      take: 100,
    }),
    prisma.influencerRequest.findMany({
      include: {
        influencer: { select: { displayName: true, handle: true } },
        client: { select: { name: true } },
        campaign: { select: { name: true, campaignNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const profileViews = profiles.map((profile) => ({
    id: profile.id,
    displayName: profile.displayName,
    handle: profile.handle,
    niche: profile.niche,
    platform: profile.platform,
    followers: profile.followers,
    rateCard: profile.rateCard,
    verified: profile.verified,
    status: profile.status,
  }));

  const requestViews = requests.map((request) => ({
    id: request.id,
    influencerName: request.influencer.displayName,
    influencerHandle: request.influencer.handle,
    clientName: request.client.name,
    campaignName: request.campaign?.name || null,
    campaignNumber: request.campaign?.campaignNumber || null,
    brief: request.brief,
    budget: request.budget,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  }));

  return (
    <AdminInfluencersClient profiles={profileViews} requests={requestViews} />
  );
}
