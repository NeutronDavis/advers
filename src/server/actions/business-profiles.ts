"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateBusinessProfile } from "@/lib/entitlements";

const BusinessProfileSchema = z.object({
  name: z.string().min(2, "Business or branch name is required."),
  category: z.string().optional(),
  location: z.string().optional(),
  branches: z.string().optional(),
});

export type BusinessProfileResult =
  | { success: true; id: string }
  | { success: false; error: string };

function parseBranches(value?: string): string | null {
  if (!value) return null;
  const branches = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return branches.length > 0 ? JSON.stringify(branches) : null;
}

function canManageProfiles(session: { role: string; orgRole: string }): boolean {
  return session.role === "ADMIN" || session.orgRole === "OWNER";
}

export async function createBusinessProfileAction(input: {
  name: string;
  category?: string;
  location?: string;
  branches?: string;
}): Promise<BusinessProfileResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageProfiles(session)) {
    return {
      success: false,
      error: "Only the account owner can manage business profiles.",
    };
  }

  const parsed = BusinessProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const check = await canCreateBusinessProfile(session.clientId);
  if (!check.allowed) {
    return { success: false, error: check.reason || "Profile limit reached." };
  }

  const existingCount = await prisma.businessProfile.count({
    where: { clientId: session.clientId },
  });

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.businessProfile.create({
      data: {
        clientId: session.clientId!,
        name: parsed.data.name.trim(),
        category: parsed.data.category?.trim() || null,
        location: parsed.data.location?.trim() || null,
        branchesJson: parseBranches(parsed.data.branches),
        isPrimary: existingCount === 0,
        status: "DRAFT",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "BUSINESS_PROFILE_CREATED",
        description: `${session.name} created business profile "${created.name}".`,
        metadata: JSON.stringify({ profileId: created.id }),
      },
    });

    return created;
  });

  revalidatePath("/portal/business-profiles");
  revalidatePath("/portal/dashboard");
  return { success: true, id: profile.id };
}

export async function updateBusinessProfileAction(input: {
  id: string;
  name: string;
  category?: string;
  location?: string;
  branches?: string;
}): Promise<BusinessProfileResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageProfiles(session)) {
    return {
      success: false,
      error: "Only the account owner can manage business profiles.",
    };
  }

  const parsed = BusinessProfileSchema.extend({
    id: z.string().min(1),
  }).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.businessProfile.findFirst({
    where: { id: parsed.data.id, clientId: session.clientId },
  });
  if (!existing) {
    return { success: false, error: "Business profile not found." };
  }

  await prisma.businessProfile.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name.trim(),
      category: parsed.data.category?.trim() || null,
      location: parsed.data.location?.trim() || null,
      branchesJson: parseBranches(parsed.data.branches),
    },
  });

  revalidatePath("/portal/business-profiles");
  return { success: true, id: existing.id };
}

export async function setPrimaryBusinessProfileAction(
  id: string
): Promise<BusinessProfileResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageProfiles(session)) {
    return {
      success: false,
      error: "Only the account owner can manage business profiles.",
    };
  }

  const existing = await prisma.businessProfile.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) {
    return { success: false, error: "Business profile not found." };
  }

  await prisma.$transaction([
    prisma.businessProfile.updateMany({
      where: { clientId: session.clientId },
      data: { isPrimary: false },
    }),
    prisma.businessProfile.update({
      where: { id },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath("/portal/business-profiles");
  return { success: true, id };
}

export async function deleteBusinessProfileAction(
  id: string
): Promise<BusinessProfileResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }
  if (!canManageProfiles(session)) {
    return {
      success: false,
      error: "Only the account owner can manage business profiles.",
    };
  }

  const existing = await prisma.businessProfile.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) {
    return { success: false, error: "Business profile not found." };
  }
  if (existing.isPrimary) {
    return {
      success: false,
      error: "Set another profile as primary before deleting this one.",
    };
  }

  await prisma.businessProfile.delete({ where: { id } });
  revalidatePath("/portal/business-profiles");
  return { success: true, id };
}
