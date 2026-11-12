import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInfluencerProfile } from "@/server/data/influencers";
import InfluencerDetailClient from "./InfluencerDetailClient";

export const dynamic = "force-dynamic";

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [profile, campaigns] = await Promise.all([
    getInfluencerProfile(id),
    user.clientId
      ? prisma.campaign.findMany({
          where: { clientId: user.clientId },
          select: { id: true, name: true, campaignNumber: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
  ]);

  if (!profile) notFound();

  return <InfluencerDetailClient profile={profile} campaigns={campaigns} />;
}
