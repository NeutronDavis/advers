import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEntitlements, hasFeature } from "@/lib/entitlements";
import { CHANNEL_LABELS } from "@/lib/types/campaign";
import { normalizeCampaignStatus } from "@/lib/campaign-status";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  if (!session.clientId) {
    return (
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-10 text-center text-xs text-[var(--portal-muted)]">
        Complete your account setup and choose a plan to view reports.
      </div>
    );
  }

  const [entitlements, profiles, campaigns, invoices, quotes] = await Promise.all([
    getEntitlements(session.clientId),
    prisma.businessProfile.findMany({
      where: { clientId: session.clientId },
      select: { id: true, name: true, isPrimary: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
    prisma.campaign.findMany({
      where: { clientId: session.clientId },
      select: {
        id: true,
        name: true,
        status: true,
        channel: true,
        budget: true,
        businessProfileId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { clientId: session.clientId, campaignId: { not: null } },
      select: { id: true, amount: true, status: true, campaignId: true },
    }),
    prisma.quote.findMany({
      where: { clientId: session.clientId, campaignId: { not: null } },
      select: { id: true, amount: true, status: true, campaignId: true },
    }),
  ]);

  const consolidated = hasFeature(entitlements, "CONSOLIDATED_REPORTING");
  const requestedProfile = params.profile || "ALL";
  const selectedProfileId = consolidated
    ? requestedProfile
    : profiles.find((profile) => profile.isPrimary)?.id || profiles[0]?.id || "ALL";

  const filteredCampaigns =
    selectedProfileId === "ALL"
      ? campaigns
      : campaigns.filter((campaign) => campaign.businessProfileId === selectedProfileId);

  const campaignIds = new Set(filteredCampaigns.map((campaign) => campaign.id));
  const filteredInvoices = invoices.filter(
    (invoice) => invoice.campaignId && campaignIds.has(invoice.campaignId)
  );
  const filteredQuotes = quotes.filter(
    (quote) => quote.campaignId && campaignIds.has(quote.campaignId)
  );

  const statusCounts: Record<string, number> = {};
  for (const campaign of filteredCampaigns) {
    const status = normalizeCampaignStatus(campaign.status);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  const channelMap = new Map<string, { count: number; budget: number }>();
  for (const campaign of filteredCampaigns) {
    const label = CHANNEL_LABELS[campaign.channel] || campaign.channel;
    const current = channelMap.get(label) || { count: 0, budget: 0 };
    current.count += 1;
    current.budget += campaign.budget;
    channelMap.set(label, current);
  }

  const visibleProfiles = consolidated
    ? profiles
    : profiles.filter((profile) => profile.id === selectedProfileId);

  const profileBreakdown = visibleProfiles.map((profile) => {
    const profileCampaigns = campaigns.filter(
      (campaign) => campaign.businessProfileId === profile.id
    );
    const profileCampaignIds = new Set(profileCampaigns.map((campaign) => campaign.id));
    const paid = invoices
      .filter(
        (invoice) =>
          invoice.campaignId &&
          profileCampaignIds.has(invoice.campaignId) &&
          invoice.status === "PAID"
      )
      .reduce((total, invoice) => total + invoice.amount, 0);
    return {
      id: profile.id,
      name: profile.name,
      isPrimary: profile.isPrimary,
      campaigns: profileCampaigns.length,
      budget: profileCampaigns.reduce((total, campaign) => total + campaign.budget, 0),
      paid,
    };
  });

  const totalBudget = filteredCampaigns.reduce(
    (total, campaign) => total + campaign.budget,
    0
  );
  const totalPaid = filteredInvoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((total, invoice) => total + invoice.amount, 0);
  const totalOutstanding = filteredInvoices
    .filter((invoice) => ["PENDING", "OVERDUE"].includes(invoice.status))
    .reduce((total, invoice) => total + invoice.amount, 0);
  const totalQuoted = filteredQuotes.reduce(
    (total, quote) => total + quote.amount,
    0
  );

  const activeCampaigns = filteredCampaigns.filter((campaign) =>
    !["COMPLETED", "CANCELLED", "REJECTED"].includes(
      normalizeCampaignStatus(campaign.status)
    )
  ).length;
  const completedCampaigns = filteredCampaigns.filter(
    (campaign) => normalizeCampaignStatus(campaign.status) === "COMPLETED"
  ).length;

  return (
    <ReportsClient
      consolidated={consolidated}
      planName={entitlements.planName}
      profiles={profiles}
      selectedProfileId={selectedProfileId}
      totals={{
        campaigns: filteredCampaigns.length,
        activeCampaigns,
        completedCampaigns,
        totalBudget,
        totalPaid,
        totalOutstanding,
        totalQuoted,
      }}
      statusCounts={statusCounts}
      channels={Array.from(channelMap.entries()).map(([label, value]) => ({
        label,
        ...value,
      }))}
      profileBreakdown={profileBreakdown}
    />
  );
}
