"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AdminBoosterResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function getStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

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

const JobSchema = z.object({
  category: z.enum(JOB_CATEGORIES),
  title: z.string().min(3, "Job title is required."),
  description: z.string().min(10, "Describe the job."),
  scope: z.string().optional(),
  location: z.string().min(2, "Location is required."),
  isRemote: z.boolean().optional(),
  deadline: z.string().optional(),
  budget: z.number().int().positive("Budget must be greater than zero."),
  paymentModel: z.enum(PAYMENT_MODELS),
  proofRequirements: z.string().optional(),
  requiredSkills: z.string().optional(),
  verificationLevel: z.string().optional(),
  clientId: z.string().optional(),
  campaignId: z.string().optional(),
  businessProfileId: z.string().optional(),
  teamId: z.string().optional(),
  publish: z.boolean().optional(),
});

export type CreateBoosterJobInput = z.input<typeof JobSchema>;

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createBoosterJobAction(
  input: CreateBoosterJobInput
): Promise<AdminBoosterResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const parsed = JobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  let clientId = parsed.data.clientId || null;
  let businessProfileId = parsed.data.businessProfileId || null;

  if (parsed.data.campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parsed.data.campaignId },
      select: { clientId: true, businessProfileId: true },
    });
    if (!campaign) {
      return { success: false, error: "Campaign not found." };
    }
    clientId = clientId || campaign.clientId;
    businessProfileId = businessProfileId || campaign.businessProfileId;
  }

  if (clientId) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client account not found." };
  }

  let teamId: string | null = parsed.data.teamId || null;
  let teamManagerId: string | null = null;
  let teamManagerUserId: string | null = null;
  let teamName: string | null = null;
  if (teamId) {
    const team = await prisma.boosterTeam.findUnique({
      where: { id: teamId },
      include: { manager: { select: { id: true, userId: true, displayName: true } } },
    });
    if (!team) return { success: false, error: "Booster team not found." };
    teamManagerId = team.manager.id;
    teamManagerUserId = team.manager.userId;
    teamName = team.name;
  }

  const deadline = parsed.data.deadline
    ? new Date(parsed.data.deadline)
    : undefined;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return { success: false, error: "Enter a valid deadline." };
  }

  const publish = parsed.data.publish || false;

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterJob.create({
      data: {
        jobNumber: `BJOB-${Date.now()}`,
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
        status: teamId
          ? "ASSIGNED"
          : publish
            ? "APPLICATIONS_OPEN"
            : "DRAFT",
        publishedAt: publish || teamId ? new Date() : null,
        clientId,
        campaignId: parsed.data.campaignId || null,
        businessProfileId,
        teamId,
        assignedBoosterId: teamManagerId,
        createdById: session.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: publish ? "BOOSTER_JOB_PUBLISHED" : "BOOSTER_JOB_CREATED",
        targetType: "BoosterJob",
        targetId: created.id,
        details: `${created.title} ${publish ? "published" : "created as draft"}.`,
      },
    });

    return created;
  });

  if (teamManagerUserId) {
    await prisma.notification.create({
      data: {
        userId: teamManagerUserId,
        event: "BOOSTER_TEAM_JOB_ASSIGNED",
        title: "New team job",
        body: `Your team "${teamName}" has been assigned "${job.title}".`,
        link: "/booster/team",
        channel: "IN_APP",
      },
    });
  }

  revalidatePath("/admin/boosters/jobs");
  revalidatePath("/booster/jobs");
  revalidatePath("/booster/team");
  return { success: true, id: job.id };
}

export async function publishBoosterJobAction(
  jobId: string
): Promise<AdminBoosterResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const job = await prisma.boosterJob.findUnique({ where: { id: jobId } });
  if (!job) return { success: false, error: "Job not found." };
  if (!["DRAFT", "PUBLISHED"].includes(job.status)) {
    return { success: false, error: "This job cannot be published." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "APPLICATIONS_OPEN", publishedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "BOOSTER_JOB_PUBLISHED",
        targetType: "BoosterJob",
        targetId: job.id,
        details: `${job.title} published to the marketplace.`,
      },
    });
  });

  revalidatePath("/admin/boosters/jobs");
  revalidatePath("/booster/jobs");
  revalidatePath(`/booster/jobs/${job.id}`);
  return { success: true, id: job.id };
}

export async function closeBoosterJobAction(
  jobId: string
): Promise<AdminBoosterResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const job = await prisma.boosterJob.findUnique({
    where: { id: jobId },
    include: { assignedBooster: true },
  });
  if (!job) return { success: false, error: "Job not found." };
  if (job.status === "CLOSED") return { success: true, id: job.id };

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "CLOSED" },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "BOOSTER_JOB_CLOSED",
        targetType: "BoosterJob",
        targetId: job.id,
        details: `${job.title} closed.`,
      },
    });
    if (job.assignedBooster) {
      await tx.notification.create({
        data: {
          userId: job.assignedBooster.userId,
          event: "BOOSTER_JOB_CLOSED",
          title: "Job closed",
          body: `"${job.title}" has been closed by Advers.`,
          link: "/booster/applications",
          channel: "IN_APP",
        },
      });
    }
  });

  revalidatePath("/admin/boosters/jobs");
  revalidatePath("/booster/jobs");
  revalidatePath(`/booster/jobs/${job.id}`);
  return { success: true, id: job.id };
}

export async function assignBoosterToJobAction(
  jobId: string,
  applicationId: string
): Promise<AdminBoosterResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const application = await prisma.boosterApplication.findFirst({
    where: { id: applicationId, jobId },
    include: { job: true, booster: true },
  });
  if (!application) return { success: false, error: "Application not found." };
  if (!["PUBLISHED", "APPLICATIONS_OPEN", "ASSIGNED"].includes(application.job.status)) {
    return { success: false, error: "This job cannot be assigned in its current status." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: jobId },
      data: {
        assignedBoosterId: application.boosterId,
        status: "ASSIGNED",
      },
    });

    await tx.boosterApplication.update({
      where: { id: application.id },
      data: { status: "ASSIGNED", assignedAt: new Date() },
    });

    await tx.boosterApplication.updateMany({
      where: { jobId, id: { not: application.id } },
      data: { status: "REJECTED" },
    });

    await tx.notification.create({
      data: {
        userId: application.booster.userId,
        event: "BOOSTER_JOB_ASSIGNED",
        title: "You have a new assignment",
        body: `You have been assigned "${application.job.title}". Accept it in your applications page.`,
        link: "/booster/applications",
        channel: "IN_APP",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "BOOSTER_JOB_ASSIGNED",
        targetType: "BoosterJob",
        targetId: jobId,
        details: `${application.booster.displayName} assigned to ${application.job.title}.`,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_JOB_ASSIGNED",
        description: `${application.booster.displayName} assigned to "${application.job.title}".`,
        metadata: JSON.stringify({ jobId, applicationId }),
      },
    });
  });

  revalidatePath("/admin/boosters/jobs");
  revalidatePath("/booster/applications");
  revalidatePath("/booster/dashboard");
  revalidatePath(`/booster/jobs/${jobId}`);
  return { success: true, id: applicationId };
}

export async function reviewBoosterDeliverableAction(input: {
  deliverableId: string;
  decision: "APPROVED" | "REJECTED" | "REWORK_REQUESTED";
  reason?: string;
}): Promise<AdminBoosterResult> {
  const session = await getStaffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const deliverable = await prisma.boosterDeliverable.findUnique({
    where: { id: input.deliverableId },
    include: { job: true, booster: true },
  });
  if (!deliverable) {
    return { success: false, error: "Deliverable not found." };
  }
  if (deliverable.decision !== "PENDING") {
    return { success: false, error: "This deliverable has already been reviewed." };
  }

  const jobStatus =
    input.decision === "APPROVED"
      ? "APPROVED"
      : input.decision === "REJECTED"
        ? "REJECTED"
        : "REWORK_REQUESTED";

  await prisma.$transaction(async (tx) => {
    await tx.boosterDeliverable.update({
      where: { id: deliverable.id },
      data: {
        decision: input.decision,
        decisionReason: input.reason?.trim() || null,
        reviewerId: session.id,
        reviewedAt: new Date(),
      },
    });

    await tx.boosterJob.update({
      where: { id: deliverable.jobId },
      data: { status: jobStatus },
    });

    if (input.decision === "APPROVED") {
      await tx.boosterProfile.update({
        where: { id: deliverable.boosterId },
        data: { completedJobs: { increment: 1 } },
      });

      await tx.boosterEarning.upsert({
        where: { jobId: deliverable.jobId },
        update: { status: "APPROVED", approvedAt: new Date() },
        create: {
          jobId: deliverable.jobId,
          boosterId: deliverable.boosterId,
          amount: deliverable.job.budget,
          paymentModel: deliverable.job.paymentModel,
          status: "APPROVED",
          reference: `EARN-${deliverable.jobId}`,
          approvedAt: new Date(),
        },
      });

      await tx.ledgerEntry.upsert({
        where: { reference: `LEDGER-BOOSTER-${deliverable.jobId}` },
        update: { status: "HELD" },
        create: {
          type: "BOOSTER_PAYMENT",
          status: "HELD",
          payeeId: deliverable.booster.userId,
          grossAmount: deliverable.job.budget,
          feeAmount: 0,
          netAmount: deliverable.job.budget,
          reference: `LEDGER-BOOSTER-${deliverable.jobId}`,
          jobId: deliverable.jobId,
          boosterId: deliverable.boosterId,
          metadataJson: JSON.stringify({ deliverableId: deliverable.id }),
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: deliverable.booster.userId,
        event:
          input.decision === "APPROVED"
            ? "BOOSTER_DELIVERABLE_APPROVED"
            : input.decision === "REJECTED"
              ? "BOOSTER_DELIVERABLE_REJECTED"
              : "BOOSTER_DELIVERABLE_REWORK",
        title:
          input.decision === "APPROVED"
            ? "Proof approved"
            : input.decision === "REJECTED"
              ? "Proof rejected"
              : "Rework requested",
        body: `"${deliverable.job.title}": ${
          input.reason?.trim() || input.decision.toLowerCase().replace(/_/g, " ")
        }`,
        link: "/booster/applications",
        channel: "IN_APP",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.id,
        action: "BOOSTER_DELIVERABLE_REVIEWED",
        targetType: "BoosterDeliverable",
        targetId: deliverable.id,
        details: `${input.decision} for ${deliverable.job.title}. ${
          input.reason?.trim() || ""
        }`,
      },
    });
  });

  revalidatePath("/admin/boosters/jobs");
  revalidatePath("/booster/applications");
  revalidatePath("/booster/dashboard");
  revalidatePath(`/booster/jobs/${deliverable.jobId}`);
  return { success: true, id: deliverable.id };
}
