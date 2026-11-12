import React from "react";
import { notFound, redirect } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { getChannelBySlug } from "@/lib/channels";
import { getChannelPartner } from "@/server/data/channels";
import PartnerDetailClient from "./PartnerDetailClient";

export const dynamic = "force-dynamic";

export default async function ChannelPartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string; partnerId: string }>;
}) {
  await requireUser();
  const { slug, partnerId } = await params;
  const channel = getChannelBySlug(slug);

  if (!channel) notFound();
  if (channel.partnerKind === "BOOSTER") redirect("/portal/adboosters");
  if (channel.partnerKind === "INFLUENCER") {
    redirect(`/portal/influencers/${partnerId}`);
  }

  const partner = await getChannelPartner(
    partnerId,
    channel.channelType as ChannelType
  );

  if (!partner) notFound();

  return <PartnerDetailClient channel={channel} partner={partner} />;
}
