import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canCreateBusinessProfile,
  getEntitlements,
  getUsage,
} from "@/lib/entitlements";
import BusinessProfilesClient, {
  type BusinessProfileView,
} from "./BusinessProfilesClient";

export const dynamic = "force-dynamic";

function parseBranches(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default async function BusinessProfilesPage() {
  const session = await requireUser();

  const [profiles, entitlements, usage, createCheck] = await Promise.all([
    session.clientId
      ? prisma.businessProfile.findMany({
          where: { clientId: session.clientId },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
    getEntitlements(session.clientId),
    session.clientId
      ? getUsage(session.clientId)
      : Promise.resolve({ businessProfiles: 0, activeWorkspaces: 0, teamMembers: 0 }),
    canCreateBusinessProfile(session.clientId),
  ]);

  const profileViews: BusinessProfileView[] = profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    category: profile.category,
    location: profile.location,
    branches: parseBranches(profile.branchesJson),
    isPrimary: profile.isPrimary,
    status: profile.status,
  }));

  return (
    <BusinessProfilesClient
      profiles={profileViews}
      planName={entitlements.planName}
      hasPlan={entitlements.hasPlan}
      used={usage.businessProfiles}
      limit={entitlements.profileLimit}
      canCreate={createCheck.allowed}
      createBlockedReason={createCheck.reason || null}
      isOwner={session.orgRole === "OWNER" || session.role === "ADMIN"}
    />
  );
}
