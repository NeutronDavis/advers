"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type BoosterTeamResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function getBoosterProfile(userId: string) {
  return prisma.boosterProfile.findUnique({ where: { userId } });
}

const TeamSchema = z.object({
  name: z.string().min(2, "Team name is required."),
  description: z.string().optional(),
});

export async function createBoosterTeamAction(
  input: z.input<typeof TeamSchema>
): Promise<BoosterTeamResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const profile = await getBoosterProfile(session.id);
  if (!profile) {
    return { success: false, error: "Create a Booster profile first." };
  }

  const parsed = TeamSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const team = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterTeam.create({
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        managerId: profile.id,
        status: "ACTIVE",
      },
    });

    await tx.boosterTeamMember.create({
      data: {
        teamId: created.id,
        boosterId: profile.id,
        role: "MANAGER",
        status: "ACTIVE",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_TEAM_CREATED",
        description: `${profile.displayName} created Booster team "${created.name}".`,
        metadata: JSON.stringify({ teamId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/booster/team");
  return { success: true, id: team.id };
}

const MemberSchema = z.object({
  teamId: z.string().min(1),
  email: z.string().email("Enter a valid Booster email."),
});

export async function addBoosterTeamMemberAction(
  input: z.input<typeof MemberSchema>
): Promise<BoosterTeamResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const profile = await getBoosterProfile(session.id);
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  const parsed = MemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const team = await prisma.boosterTeam.findFirst({
    where: { id: parsed.data.teamId, managerId: profile.id },
  });
  if (!team) {
    return { success: false, error: "Only the team manager can add members." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
    include: { boosterProfile: true },
  });
  if (!user?.boosterProfile) {
    return {
      success: false,
      error: "That email does not have a Booster profile yet.",
    };
  }

  const existing = await prisma.boosterTeamMember.findUnique({
    where: {
      teamId_boosterId: {
        teamId: team.id,
        boosterId: user.boosterProfile.id,
      },
    },
  });
  if (existing) {
    return { success: false, error: "This Booster is already on the team." };
  }

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterTeamMember.create({
      data: {
        teamId: team.id,
        boosterId: user.boosterProfile!.id,
        role: "MEMBER",
        status: "ACTIVE",
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        event: "BOOSTER_TEAM_ADDED",
        title: "Added to a Booster team",
        body: `You were added to "${team.name}" by ${profile.displayName}.`,
        link: "/booster/team",
        channel: "IN_APP",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_TEAM_MEMBER_ADDED",
        description: `${profile.displayName} added ${user.name} to "${team.name}".`,
        metadata: JSON.stringify({ teamId: team.id, memberId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/booster/team");
  return { success: true, id: member.id };
}

export async function removeBoosterTeamMemberAction(input: {
  teamId: string;
  memberId: string;
}): Promise<BoosterTeamResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const profile = await getBoosterProfile(session.id);
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  const team = await prisma.boosterTeam.findFirst({
    where: { id: input.teamId, managerId: profile.id },
  });
  if (!team) {
    return { success: false, error: "Only the team manager can remove members." };
  }

  const member = await prisma.boosterTeamMember.findFirst({
    where: { id: input.memberId, teamId: team.id },
    include: { booster: true },
  });
  if (!member) return { success: false, error: "Team member not found." };
  if (member.role === "MANAGER" || member.boosterId === team.managerId) {
    return { success: false, error: "The team manager cannot be removed." };
  }

  await prisma.boosterTeamMember.delete({ where: { id: member.id } });
  revalidatePath("/booster/team");
  return { success: true, id: member.id };
}

export async function archiveBoosterTeamAction(
  teamId: string
): Promise<BoosterTeamResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const profile = await getBoosterProfile(session.id);
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  const team = await prisma.boosterTeam.findFirst({
    where: { id: teamId, managerId: profile.id },
  });
  if (!team) {
    return { success: false, error: "Only the team manager can archive this team." };
  }

  await prisma.boosterTeam.update({
    where: { id: team.id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/booster/team");
  return { success: true, id: team.id };
}
