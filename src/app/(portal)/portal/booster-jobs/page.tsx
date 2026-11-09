import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdvertiserBoosterJobs } from "@/server/data/booster";
import AdvertiserBoosterJobsClient from "./AdvertiserBoosterJobsClient";

export const dynamic = "force-dynamic";

export default async function AdvertiserBoosterJobsPage() {
  const user = await requireUser();

  if (!user.clientId) {
    return (
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-10 text-center text-xs text-[var(--portal-muted)]">
        Complete your account setup and choose a plan before requesting Booster
        services.
      </div>
    );
  }

  const [jobs, campaigns, businessProfiles] = await Promise.all([
    getAdvertiserBoosterJobs(user.clientId),
    prisma.campaign.findMany({
      where: { clientId: user.clientId },
      select: { id: true, name: true, campaignNumber: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.businessProfile.findMany({
      where: { clientId: user.clientId },
      select: { id: true, name: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <AdvertiserBoosterJobsClient
      jobs={jobs}
      campaigns={campaigns}
      businessProfiles={businessProfiles}
    />
  );
}
