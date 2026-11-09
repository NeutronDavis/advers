"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canInviteTeamMember } from "@/lib/entitlements";

const InviteSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z.string().optional(),
});

export type TeamResult =
  | { success: true; inviteUrl?: string; id?: string }
  | { success: false; error: string };

function canManageTeam(session: {
  role: string;
  orgRole: string;
}): boolean {
  return session.role === "ADMIN" || session.orgRole === "OWNER";
}

export async function inviteTeamMemberAction(input: {
  email: string;
  name?: string;
}): Promise<TeamResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageTeam(session)) {
    return { success: false, error: "Only the account owner can invite team members." };
  }

  const parsed = InviteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const check = await canInviteTeamMember(session.clientId);
  if (!check.allowed) {
    return { success: false, error: check.reason || "Team seat limit reached." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.clientId === session.clientId) {
    return { success: false, error: "This person is already on your team." };
  }
  if (existingUser?.clientId) {
    return {
      success: false,
      error: "This email already belongs to another Advers account.",
    };
  }

  const pending = await prisma.invitation.findFirst({
    where: {
      clientId: session.clientId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (pending) {
    return { success: false, error: "An invitation is already pending for this email." };
  }

  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.$transaction(async (tx) => {
    const created = await tx.invitation.create({
      data: {
        email,
        tokenHash,
        clientId: session.clientId!,
        orgRole: "MEMBER",
        invitedById: session.id,
        expiresAt,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "TEAM_INVITATION_SENT",
        description: `${session.name} invited ${email} to the team.`,
        metadata: JSON.stringify({ invitationId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/portal/team");
  return {
    success: true,
    id: invitation.id,
    inviteUrl: `/accept-invite?token=${token}`,
  };
}

export async function revokeInvitationAction(id: string): Promise<TeamResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageTeam(session)) {
    return { success: false, error: "Only the account owner can revoke invitations." };
  }

  const invitation = await prisma.invitation.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!invitation) {
    return { success: false, error: "Invitation not found." };
  }

  await prisma.invitation.delete({ where: { id } });
  revalidatePath("/portal/team");
  return { success: true, id };
}

export async function removeTeamMemberAction(userId: string): Promise<TeamResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageTeam(session)) {
    return { success: false, error: "Only the account owner can remove team members." };
  }
  if (userId === session.id) {
    return { success: false, error: "You cannot remove your own account." };
  }

  const member = await prisma.user.findFirst({
    where: { id: userId, clientId: session.clientId },
  });
  if (!member) {
    return { success: false, error: "Team member not found." };
  }
  if (member.orgRole === "OWNER") {
    return { success: false, error: "The account owner cannot be removed." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: member.id },
      data: { clientId: null, orgRole: "MEMBER" },
    }),
    prisma.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "TEAM_MEMBER_REMOVED",
        description: `${session.name} removed ${member.name} from the team.`,
        metadata: JSON.stringify({ removedUserId: member.id }),
      },
    }),
  ]);

  revalidatePath("/portal/team");
  return { success: true, id: member.id };
}
