import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canInviteTeamMember,
  getEntitlements,
  getUsage,
} from "@/lib/entitlements";
import TeamClient, {
  type TeamInvitationView,
  type TeamMemberView,
} from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await requireUser();

  const [members, invitations, entitlements, usage, inviteCheck] =
    await Promise.all([
      session.clientId
        ? prisma.user.findMany({
            where: { clientId: session.clientId },
            orderBy: [{ orgRole: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              orgRole: true,
              status: true,
              lastLoginAt: true,
            },
          })
        : Promise.resolve([]),
      session.clientId
        ? prisma.invitation.findMany({
            where: {
              clientId: session.clientId,
              acceptedAt: null,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      getEntitlements(session.clientId),
      session.clientId
        ? getUsage(session.clientId)
        : Promise.resolve({ businessProfiles: 0, activeWorkspaces: 0, teamMembers: 0 }),
      canInviteTeamMember(session.clientId),
    ]);

  const memberViews: TeamMemberView[] = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    orgRole: member.orgRole,
    status: member.status,
    lastLoginAt: member.lastLoginAt ? member.lastLoginAt.toISOString() : null,
  }));

  const invitationViews: TeamInvitationView[] = invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  }));

  return (
    <TeamClient
      members={memberViews}
      invitations={invitationViews}
      planName={entitlements.planName}
      hasPlan={entitlements.hasPlan}
      used={usage.teamMembers}
      limit={entitlements.teamSeatLimit}
      canInvite={inviteCheck.allowed}
      inviteBlockedReason={inviteCheck.reason || null}
      isOwner={session.orgRole === "OWNER" || session.role === "ADMIN"}
      currentUserId={session.id}
    />
  );
}
