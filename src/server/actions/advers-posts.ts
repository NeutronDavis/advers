"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AdversPostResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function getStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

const PostSchema = z.object({
  title: z.string().min(2, "Post title is required."),
  body: z.string().min(10, "Post body is required."),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  sponsorName: z.string().min(2, "Sponsor name is required."),
  sponsorLogoUrl: z.string().optional(),
  category: z.string().optional(),
  placement: z.string().default("DASHBOARD"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  targetAudience: z.string().optional(),
  publish: z.boolean().optional(),
});

export type CreateAdversPostInput = z.input<typeof PostSchema>;

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function createAdversPostAction(
  input: CreateAdversPostInput
): Promise<AdversPostResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const publish = parsed.data.publish || false;
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.adversPost.create({
      data: {
        title: parsed.data.title.trim(),
        body: parsed.data.body.trim(),
        imageUrl: parsed.data.imageUrl?.trim() || null,
        ctaLabel: parsed.data.ctaLabel?.trim() || null,
        ctaUrl: parsed.data.ctaUrl?.trim() || null,
        sponsorName: parsed.data.sponsorName.trim(),
        sponsorLogoUrl: parsed.data.sponsorLogoUrl?.trim() || null,
        category: parsed.data.category?.trim() || null,
        placement: parsed.data.placement || "DASHBOARD",
        status: publish ? "PUBLISHED" : "DRAFT",
        startsAt: publish ? parseDate(parsed.data.startsAt) || new Date() : parseDate(parsed.data.startsAt),
        endsAt: parseDate(parsed.data.endsAt),
        targetAudienceJson: parsed.data.targetAudience
          ? JSON.stringify({ notes: parsed.data.targetAudience.trim() })
          : null,
        createdById: session.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: publish ? "ADVERS_POST_PUBLISHED" : "ADVERS_POST_CREATED",
        targetType: "AdversPost",
        targetId: created.id,
        details: `${created.title} ${publish ? "published" : "created as draft"}.`,
      },
    });

    return created;
  });

  revalidatePath("/admin/posts");
  revalidatePath("/portal/dashboard");
  return { success: true, id: post.id };
}

export async function updateAdversPostAction(
  id: string,
  input: CreateAdversPostInput
): Promise<AdversPostResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.adversPost.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Post not found." };

  await prisma.$transaction(async (tx) => {
    await tx.adversPost.update({
      where: { id },
      data: {
        title: parsed.data.title.trim(),
        body: parsed.data.body.trim(),
        imageUrl: parsed.data.imageUrl?.trim() || null,
        ctaLabel: parsed.data.ctaLabel?.trim() || null,
        ctaUrl: parsed.data.ctaUrl?.trim() || null,
        sponsorName: parsed.data.sponsorName.trim(),
        sponsorLogoUrl: parsed.data.sponsorLogoUrl?.trim() || null,
        category: parsed.data.category?.trim() || null,
        placement: parsed.data.placement || "DASHBOARD",
        startsAt: parseDate(parsed.data.startsAt),
        endsAt: parseDate(parsed.data.endsAt),
        targetAudienceJson: parsed.data.targetAudience
          ? JSON.stringify({ notes: parsed.data.targetAudience.trim() })
          : null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "ADVERS_POST_UPDATED",
        targetType: "AdversPost",
        targetId: id,
        details: `${parsed.data.title} updated.`,
      },
    });
  });

  revalidatePath("/admin/posts");
  revalidatePath("/portal/dashboard");
  return { success: true, id };
}

export async function publishAdversPostAction(
  id: string
): Promise<AdversPostResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const post = await prisma.adversPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  await prisma.$transaction(async (tx) => {
    await tx.adversPost.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        startsAt: post.startsAt || new Date(),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "ADVERS_POST_PUBLISHED",
        targetType: "AdversPost",
        targetId: id,
        details: `${post.title} published.`,
      },
    });
  });

  revalidatePath("/admin/posts");
  revalidatePath("/portal/dashboard");
  return { success: true, id };
}

export async function archiveAdversPostAction(
  id: string
): Promise<AdversPostResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const post = await prisma.adversPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  await prisma.$transaction(async (tx) => {
    await tx.adversPost.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "ADVERS_POST_ARCHIVED",
        targetType: "AdversPost",
        targetId: id,
        details: `${post.title} archived.`,
      },
    });
  });

  revalidatePath("/admin/posts");
  revalidatePath("/portal/dashboard");
  return { success: true, id };
}
