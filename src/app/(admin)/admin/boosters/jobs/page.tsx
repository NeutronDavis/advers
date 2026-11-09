import React from "react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminBoosterJobs } from "@/server/data/booster";
import AdminBoosterJobsClient from "./AdminBoosterJobsClient";

export const dynamic = "force-dynamic";

export default async function AdminBoosterJobsPage() {
  await requireStaff();

  const [jobs, clients, campaigns, businessProfiles, teams] = await Promise.all([
    getAdminBoosterJobs(),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        campaignNumber: true,
        clientId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.businessProfile.findMany({
      select: { id: true, name: true, clientId: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.boosterTeam.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        manager: { select: { displayName: true } },
      },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <AdminBoosterJobsClient
      jobs={jobs}
      clients={clients}
      campaigns={campaigns}
      businessProfiles={businessProfiles}
      teams={teams}
    />
  );
}
