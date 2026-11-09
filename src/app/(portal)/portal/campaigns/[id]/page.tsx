import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCampaignDetail } from "@/server/data/campaign-detail";
import CampaignDetailClient from "./CampaignDetailClient";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const campaign = await getCampaignDetail(id, session);

  if (!campaign) notFound();

  return <CampaignDetailClient campaign={campaign} />;
}
