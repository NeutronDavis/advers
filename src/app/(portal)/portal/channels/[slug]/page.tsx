import React from "react";
import { notFound, redirect } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { getChannelBySlug } from "@/lib/channels";
import { getChannelPartners } from "@/server/data/channels";
import ChannelPartnersClient from "./ChannelPartnersClient";

export const dynamic = "force-dynamic";

export default async function ChannelCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const channel = getChannelBySlug(slug);

  if (!channel) notFound();
  if (channel.partnerKind === "BOOSTER") redirect("/portal/adboosters");
  if (channel.partnerKind === "INFLUENCER") redirect("/portal/influencers");

  const partners = await getChannelPartners(
    channel.channelType as ChannelType
  );

  return <ChannelPartnersClient channel={channel} partners={partners} />;
}
