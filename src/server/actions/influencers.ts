"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { dispatchNotification } from "@/lib/notifications";

export type InfluencerActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function getStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

export async function verifyInfluencerProfileAction(
  id: string,
  verified: boolean
): Promise<InfluencerActionResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const profile = await prisma.influencerProfile.findUnique({ where: { id } });
  if (!profile) return { success: false, error: "Influencer profile not found." };

  await prisma.$transaction(async (tx) => {
    await tx.influencerProfile.update({
      where: { id: profile.id },
      data: { verified },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: verified ? "INFLUENCER_VERIFIED" : "INFLUENCER_UNVERIFIED",
        targetType: "InfluencerProfile",
        targetId: profile.id,
        details: `${profile.displayName} ${verified ? "verified" : "unverified"}.`,
      },
    });
  });

  revalidatePath("/admin/influencers");
  revalidatePath("/portal/influencers");
  return { success: true, id: profile.id };
}

const RequestSchema = z.object({
  influencerId: z.string().min(1),
  brief: z.string().min(10, "Describe the collaboration brief."),
  budget: z.number().int().positive("Enter a collaboration budget."),
  campaignId: z.string().optional(),
});

export async function requestInfluencerCollaborationAction(
  input: z.input<typeof RequestSchema>
): Promise<InfluencerActionResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }

  const parsed = RequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const influencer = await prisma.influencerProfile.findFirst({
    where: { id: parsed.data.influencerId, status: "ACTIVE" },
  });
  if (!influencer) {
    return { success: false, error: "Influencer profile not found." };
  }

  let campaignId: string | null = null;
  if (parsed.data.campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: parsed.data.campaignId,
        OR: [{ userId: session.id }, { clientId: session.clientId }],
      },
      select: { id: true },
    });
    if (!campaign) {
      return { success: false, error: "That campaign is not available." };
    }
    campaignId = campaign.id;
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.influencerRequest.create({
      data: {
        influencerId: influencer.id,
        clientId: session.clientId!,
        campaignId,
        brief: parsed.data.brief.trim(),
        budget: parsed.data.budget,
        status: "REQUESTED",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "INFLUENCER_COLLABORATION_REQUESTED",
        description: `${session.name} requested a collaboration with ${influencer.displayName}.`,
        metadata: JSON.stringify({ influencerId: influencer.id, requestId: created.id }),
      },
    });

    return created;
  });

  if (influencer.userId) {
    await dispatchNotification({
      userId: influencer.userId,
      event: "INFLUENCER_COLLABORATION_REQUESTED",
      title: "New collaboration request",
      body: `${session.name} sent a collaboration request.`,
      link: "/portal/influencers",
    });
  } else {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        dispatchNotification({
          userId: admin.id,
          event: "INFLUENCER_COLLABORATION_REQUESTED",
          title: "New influencer request",
          body: `${session.name} requested ${influencer.displayName}.`,
          link: "/admin/influencers",
        })
      )
    );
  }

  revalidatePath("/portal/influencers");
  revalidatePath(`/portal/influencers/${influencer.id}`);
  return { success: true, id: request.id };
}
