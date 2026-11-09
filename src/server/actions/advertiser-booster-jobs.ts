"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AdvertiserBoosterResult =
  | { success: true; id?: string }
  | { success: false; error: string };

const JOB_CATEGORIES = [
  "CREATIVE",
  "PRODUCTION",
  "LOGISTICS",
  "FIELD_MARKETING",
  "INTELLIGENCE",
  "SALES_REFERRALS",
  "TECHNICAL",
  "CAMPAIGN_MANAGEMENT",
  "TEAM_OPPORTUNITY",
] as const;

const PAYMENT_MODELS = [
  "FIXED",
  "COMMISSION",
  "PER_ORDER",
  "PER_DELIVERY",
  "PER_TASK",
  "PER_VERIFICATION",
  "PER_REPORT",
  "PER_LEAD",
  "PROJECT_FEE",
  "MANAGEMENT_FEE",
] as const;

const RequestSchema = z.object({
  category: z.enum(JOB_CATEGORIES),
  title: z.string().min(3, "Job title is required."),
  description: z.string().min(10, "Describe what you need."),
  scope: z.string().optional(),
  location: z.string().min(2, "Location is required."),
  isRemote: z.boolean().optional(),
  deadline: z.string().optional(),
  budget: z.number().int().positive("Budget must be greater than zero."),
  paymentModel: z.enum(PAYMENT_MODELS),
  proofRequirements: z.string().optional(),
  requiredSkills: z.string().optional(),
  verificationLevel: z.string().optional(),
  campaignId: z.string().optional(),
  businessProfileId: z.string().optional(),
});

export type RequestBoosterJobInput = z.input<typeof RequestSchema>;

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function requestBoosterJobAction(
  input: RequestBoosterJobInput
): Promise<AdvertiserBoosterResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }

  const parsed = RequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  let businessProfileId: string | null = null;
  if (parsed.data.businessProfileId) {
    const profile = await prisma.businessProfile.findFirst({
      where: { id: parsed.data.businessProfileId, clientId: session.clientId },
      select: { id: true },
    });
    if (!profile) {
      return { success: false, error: "That business profile is not available." };
    }
    businessProfileId = profile.id;
  }

  let campaignId: string | null = null;
  if (parsed.data.campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: parsed.data.campaignId,
        OR: [{ userId: session.id }, { clientId: session.clientId }],
      },
      select: { id: true, businessProfileId: true },
    });
    if (!campaign) {
      return { success: false, error: "That campaign is not available." };
    }
    campaignId = campaign.id;
    businessProfileId = businessProfileId || campaign.businessProfileId;
  }

  const deadline = parsed.data.deadline
    ? new Date(parsed.data.deadline)
    : undefined;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return { success: false, error: "Enter a valid deadline." };
  }

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterJob.create({
      data: {
        jobNumber: `BJOB-REQ-${Date.now()}`,
        category: parsed.data.category,
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        scope: parsed.data.scope?.trim() || null,
        location: parsed.data.location.trim(),
        isRemote: parsed.data.isRemote || false,
        deadline,
        budget: parsed.data.budget,
        paymentModel: parsed.data.paymentModel,
        proofRequirementsJson: JSON.stringify(
          splitList(parsed.data.proofRequirements)
        ),
        requiredSkillsJson: JSON.stringify(splitList(parsed.data.requiredSkills)),
        verificationLevel: parsed.data.verificationLevel?.trim() || null,
        status: "DRAFT",
        clientId: session.clientId,
        campaignId,
        businessProfileId,
        createdById: session.id,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "BOOSTER_JOB_REQUESTED",
        description: `${session.name} requested a Booster job "${created.title}".`,
        metadata: JSON.stringify({ jobId: created.id }),
      },
    });

    return created;
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        event: "BOOSTER_JOB_REQUESTED",
        title: "New Booster job request",
        body: `${session.name} requested "${job.title}". Review and publish it.`,
        link: "/admin/boosters/jobs",
        channel: "IN_APP" as const,
      })),
    });
  }

  revalidatePath("/portal/booster-jobs");
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: job.id };
}

export async function cancelAdvertiserBoosterJobAction(
  jobId: string
): Promise<AdvertiserBoosterResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in with a client account." };
  }

  const job = await prisma.boosterJob.findFirst({
    where: { id: jobId, clientId: session.clientId },
  });
  if (!job) return { success: false, error: "Booster job not found." };
  if (!["DRAFT", "PUBLISHED", "APPLICATIONS_OPEN"].includes(job.status)) {
    return { success: false, error: "This job can no longer be cancelled." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "CANCELLED" },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "BOOSTER_JOB_CANCELLED",
        description: `${session.name} cancelled Booster job "${job.title}".`,
        metadata: JSON.stringify({ jobId: job.id }),
      },
    });
  });

  revalidatePath("/portal/booster-jobs");
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: job.id };
}
