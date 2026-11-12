import React from "react";
import { requireUser } from "@/lib/auth";
import { getCampaignsForUser } from "@/server/data/campaigns";
import { getEntitlements, getUsage } from "@/lib/entitlements";
import { getUnreadNotificationCount } from "@/server/data/booster";
import { prisma } from "@/lib/prisma";
import { CampaignProvider } from "@/context/CampaignContext";
import PlanStatusBanner from "@/components/portal/PlanStatusBanner";
import PortalShell from "./PortalShell";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [campaigns, entitlements, usage, businessProfiles, unreadNotifications] =
    await Promise.all([
      getCampaignsForUser(user),
      getEntitlements(user.clientId),
      user.clientId
        ? getUsage(user.clientId)
        : Promise.resolve({ businessProfiles: 0, activeWorkspaces: 0, teamMembers: 0 }),
      user.clientId
        ? prisma.businessProfile.findMany({
            where: { clientId: user.clientId },
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            select: { id: true, name: true, isPrimary: true },
          })
        : Promise.resolve([]),
      getUnreadNotificationCount(user.id),
    ]);

  return (
    <CampaignProvider
      initialCampaigns={campaigns}
      businessProfiles={businessProfiles}
    >
      <PortalShell user={user} unreadNotifications={unreadNotifications}>
        <PlanStatusBanner
          entitlements={{
            hasPlan: entitlements.hasPlan,
            planName: entitlements.planName,
            profileLimit: entitlements.profileLimit,
            workspaceLimit: entitlements.workspaceLimit,
          }}
          usage={{
            businessProfiles: usage.businessProfiles,
            activeWorkspaces: usage.activeWorkspaces,
          }}
        />
        {children}
      </PortalShell>
    </CampaignProvider>
  );
}
