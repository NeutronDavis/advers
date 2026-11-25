"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BOOSTER_CATEGORY_LABELS } from "@/lib/booster-status";
import { slugifyHandle } from "@/lib/marketplace";
import {
  parsePackageLines,
  parsePortfolioLines,
  parseServiceLines,
} from "@/lib/marketplace-structured";
import { dispatchNotification } from "@/lib/notifications";
import { parseStringArray } from "@/server/data/booster";

export type BoosterActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLines(value?: string): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const ProfileSchema = z.object({
  displayName: z.string().min(2, "Display name is required."),
  handle: z.string().max(40).optional(),
  businessName: z.string().optional(),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  location: z.string().max(120).optional(),
  availabilityStatus: z
    .enum(["AVAILABLE", "BUSY", "UNAVAILABLE"])
    .optional(),
  responseTimeHours: z.number().int().min(1).max(720).optional(),
  startingPrice: z.number().int().min(0).max(100_000_000).optional(),
  bio: z.string().max(2000).optional(),
  isBusiness: z.boolean().optional(),
  categories: z.array(z.string()).min(1, "Select at least one Booster category."),
  skills: z.string().optional(),
  coverage: z.string().optional(),
  portfolio: z.string().optional(),
  rates: z.string().optional(),
  packages: z.string().optional(),
  availableHours: z.string().optional(),
  paymentInfo: z.string().optional(),
});

async function uniqueHandle(raw: string, userId: string): Promise<string> {
  const base = slugifyHandle(raw);
  const existing = await prisma.boosterProfile.findFirst({
    where: { handle: base, NOT: { userId } },
    select: { id: true },
  });
  if (!existing) return base;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    const taken = await prisma.boosterProfile.findFirst({
      where: { handle: candidate, NOT: { userId } },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

const VerificationSchema = z.object({
  documents: z.string().min(1, "Add at least one verification document."),
  level: z.string().optional(),
  note: z.string().optional(),
});

export type SubmitBoosterVerificationInput = z.input<typeof VerificationSchema>;

export type UpsertBoosterProfileInput = z.input<typeof ProfileSchema>;

export async function upsertBoosterProfileAction(
  input: UpsertBoosterProfileInput
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const validCategories = parsed.data.categories.filter(
    (category) => category in BOOSTER_CATEGORY_LABELS
  );
  if (validCategories.length === 0) {
    return { success: false, error: "Select at least one valid Booster category." };
  }

  const portfolio = parsePortfolioLines(parsed.data.portfolio ?? "");
  const services = parseServiceLines(parsed.data.rates ?? "");
  const packages = parsePackageLines(parsed.data.packages ?? "");

  // Keep the legacy JSON fields in sync for older screens and fallbacks.
  const legacyPortfolio = portfolio.map((item) => ({
    title: item.title,
    url: item.externalUrl,
    description: item.description ?? "",
  }));
  const legacyRates = services.map((service) => ({
    label: service.title,
    amount: service.priceMin ? `₦${service.priceMin.toLocaleString("en-NG")}` : "",
  }));

  const handle = await uniqueHandle(
    parsed.data.handle?.trim() || parsed.data.displayName,
    session.id
  );

  const profile = await prisma.$transaction(async (tx) => {
    const saved = await tx.boosterProfile.upsert({
      where: { userId: session.id },
    update: {
      displayName: parsed.data.displayName.trim(),
      handle,
      businessName: parsed.data.businessName?.trim() || null,
      logoUrl: parsed.data.logoUrl?.trim() || null,
      coverUrl: parsed.data.coverUrl?.trim() || null,
      location: parsed.data.location?.trim() || null,
      availabilityStatus: parsed.data.availabilityStatus || "AVAILABLE",
      responseTimeHours: parsed.data.responseTimeHours ?? null,
      startingPrice: parsed.data.startingPrice ?? null,
      bio: parsed.data.bio?.trim() || null,
      isBusiness: parsed.data.isBusiness || false,
      categoriesJson: JSON.stringify(validCategories),
      skillsJson: JSON.stringify(splitList(parsed.data.skills)),
      coverageJson: JSON.stringify(splitList(parsed.data.coverage)),
      portfolioJson: JSON.stringify(legacyPortfolio),
      ratesJson: JSON.stringify(legacyRates),
      availableHours: parsed.data.availableHours?.trim() || null,
      paymentInfoJson: parsed.data.paymentInfo
        ? JSON.stringify({ details: parsed.data.paymentInfo.trim() })
        : undefined,
    },
    create: {
      userId: session.id,
      displayName: parsed.data.displayName.trim(),
      handle,
      businessName: parsed.data.businessName?.trim() || null,
      logoUrl: parsed.data.logoUrl?.trim() || null,
      coverUrl: parsed.data.coverUrl?.trim() || null,
      location: parsed.data.location?.trim() || null,
      availabilityStatus: parsed.data.availabilityStatus || "AVAILABLE",
      responseTimeHours: parsed.data.responseTimeHours ?? null,
      startingPrice: parsed.data.startingPrice ?? null,
      bio: parsed.data.bio?.trim() || null,
      isBusiness: parsed.data.isBusiness || false,
      categoriesJson: JSON.stringify(validCategories),
      skillsJson: JSON.stringify(splitList(parsed.data.skills)),
      coverageJson: JSON.stringify(splitList(parsed.data.coverage)),
      portfolioJson: JSON.stringify(legacyPortfolio),
      ratesJson: JSON.stringify(legacyRates),
      availableHours: parsed.data.availableHours?.trim() || null,
      paymentInfoJson: parsed.data.paymentInfo
        ? JSON.stringify({ details: parsed.data.paymentInfo.trim() })
        : null,
      status: "ACTIVE",
      },
    });

    await tx.boosterService.deleteMany({ where: { boosterId: saved.id } });
    if (services.length > 0) {
      await tx.boosterService.createMany({
        data: services.map((service, index) => ({
          boosterId: saved.id,
          title: service.title,
          description: service.description ?? null,
          priceMin: service.priceMin,
          priceMax: service.priceMax,
          currency: "NGN",
          deliveryDays: service.deliveryDays ?? null,
          sortOrder: index,
        })),
      });
    }

    await tx.boosterPackage.deleteMany({ where: { boosterId: saved.id } });
    if (packages.length > 0) {
      await tx.boosterPackage.createMany({
        data: packages.map((item, index) => ({
          boosterId: saved.id,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: "NGN",
          deliveryDays: item.deliveryDays,
          includesJson: item.includes.length ? JSON.stringify(item.includes) : null,
          sortOrder: index,
        })),
      });
    }

    await tx.portfolioItem.deleteMany({
      where: { boosterId: saved.id, mediaAssetId: null },
    });
    if (portfolio.length > 0) {
      await tx.portfolioItem.createMany({
        data: portfolio.map((item, index) => ({
          boosterId: saved.id,
          title: item.title,
          description: item.description,
          externalUrl: item.externalUrl,
          sortOrder: index,
        })),
      });
    }

    return saved;
  });

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "BOOSTER_PROFILE_UPDATED",
      description: `${session.name} updated the Booster profile "${profile.displayName}".`,
      metadata: JSON.stringify({ boosterId: profile.id }),
    },
  });

  revalidatePath("/booster/profile");
  revalidatePath("/booster/profile/edit");
  revalidatePath("/booster/dashboard");
  revalidatePath("/portal/dashboard");
  return { success: true, id: profile.id };
}

export async function submitBoosterVerificationAction(
  input: SubmitBoosterVerificationInput
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const parsed = VerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: session.id },
  });
  if (!profile) {
    return {
      success: false,
      error: "Create your Booster profile before submitting verification.",
    };
  }
  if (profile.verificationStatus === "VERIFIED") {
    return { success: false, error: "Your Booster profile is already verified." };
  }
  if (profile.verificationStatus === "PENDING") {
    return {
      success: false,
      error: "Your verification is already under review. Please wait for a decision.",
    };
  }

  const documents = parseLines(parsed.data.documents);
  if (documents.length === 0) {
    return { success: false, error: "Add at least one verification document." };
  }
  const invalidDocument = documents.find(
    (document) => !/^https?:\/\//i.test(document)
  );
  if (invalidDocument) {
    return {
      success: false,
      error: "Verification document links must start with http:// or https://.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.boosterProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: "PENDING",
        verificationDocumentsJson: JSON.stringify(documents),
        verificationLevel:
          parsed.data.level?.trim() || profile.verificationLevel || "Standard",
        verificationSubmittedNote: parsed.data.note?.trim() || null,
        verificationSubmittedAt: new Date(),
        verificationReviewedAt: null,
        verificationNotes: null,
        verifiedAt: null,
        verifiedById: null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_VERIFICATION_SUBMITTED",
        description: `${session.name} submitted Booster verification documents.`,
        metadata: JSON.stringify({
          boosterId: profile.id,
          documents: documents.length,
        }),
      },
    });
  });

  await notifyAdmins({
    event: "BOOSTER_VERIFICATION_SUBMITTED",
    title: "Booster verification submitted",
    body: `${profile.displayName} submitted ${documents.length} verification document${
      documents.length === 1 ? "" : "s"
    }.`,
    link: "/admin/trust",
  });

  revalidatePath("/booster/profile");
  revalidatePath("/booster/verification");
  revalidatePath("/booster/dashboard");
  revalidatePath("/admin/trust");
  return { success: true, id: profile.id };
}

async function getBoosterProfileOrError(userId: string) {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) {
    return {
      profile: null,
      error: "Create your Booster profile before applying for jobs.",
    } as const;
  }
  return { profile, error: null } as const;
}

async function notifyUser(input: {
  userId: string;
  event: string;
  title: string;
  body: string;
  link?: string;
}) {
  await dispatchNotification(input);
}

async function notifyAdmins(input: {
  event: string;
  title: string;
  body: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      dispatchNotification({
        userId: admin.id,
        event: input.event,
        title: input.title,
        body: input.body,
        link: input.link,
      })
    )
  );
}

export async function applyToBoosterJobAction(input: {
  jobId: string;
  coverNote?: string;
  proposedFee?: number;
}): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const { profile, error } = await getBoosterProfileOrError(session.id);
  if (!profile) return { success: false, error: error! };

  const job = await prisma.boosterJob.findUnique({ where: { id: input.jobId } });
  if (!job) return { success: false, error: "Job not found." };
  if (!["PUBLISHED", "APPLICATIONS_OPEN"].includes(job.status)) {
    return { success: false, error: "This job is not accepting applications." };
  }
  if (job.assignedBoosterId) {
    return { success: false, error: "This job has already been assigned." };
  }

  const existing = await prisma.boosterApplication.findUnique({
    where: { jobId_boosterId: { jobId: job.id, boosterId: profile.id } },
  });
  if (existing) {
    return { success: false, error: "You have already applied for this job." };
  }

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterApplication.create({
      data: {
        jobId: job.id,
        boosterId: profile.id,
        status: "APPLIED",
        coverNote: input.coverNote?.trim() || null,
        proposedFee:
          input.proposedFee && input.proposedFee > 0 ? input.proposedFee : null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_JOB_APPLIED",
        description: `${profile.displayName} applied for "${job.title}".`,
        metadata: JSON.stringify({ jobId: job.id, applicationId: created.id }),
      },
    });

    return created;
  });

  await notifyAdmins({
    event: "BOOSTER_APPLICATION_RECEIVED",
    title: "New Booster application",
    body: `${profile.displayName} applied for "${job.title}".`,
    link: "/admin/boosters/jobs",
  });

  revalidatePath("/booster/jobs");
  revalidatePath(`/booster/jobs/${job.id}`);
  revalidatePath("/booster/applications");
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: application.id };
}

export async function withdrawBoosterApplicationAction(
  applicationId: string
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const { profile, error } = await getBoosterProfileOrError(session.id);
  if (!profile) return { success: false, error: error! };

  const application = await prisma.boosterApplication.findFirst({
    where: { id: applicationId, boosterId: profile.id },
    include: { job: true },
  });
  if (!application) return { success: false, error: "Application not found." };
  if (!["APPLIED", "SHORTLISTED"].includes(application.status)) {
    return { success: false, error: "This application cannot be withdrawn." };
  }

  await prisma.boosterApplication.update({
    where: { id: application.id },
    data: { status: "WITHDRAWN" },
  });

  revalidatePath("/booster/applications");
  revalidatePath(`/booster/jobs/${application.jobId}`);
  return { success: true, id: application.id };
}

export async function acceptBoosterAssignmentAction(
  jobId: string
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const { profile, error } = await getBoosterProfileOrError(session.id);
  if (!profile) return { success: false, error: error! };

  const job = await prisma.boosterJob.findFirst({
    where: { id: jobId, assignedBoosterId: profile.id, status: "ASSIGNED" },
  });
  if (!job) return { success: false, error: "Assignment not found." };

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "ACCEPTED" },
    });
    await tx.boosterApplication.updateMany({
      where: { jobId: job.id, boosterId: profile.id },
      data: { status: "ASSIGNED", assignedAt: new Date() },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_ASSIGNMENT_ACCEPTED",
        description: `${profile.displayName} accepted "${job.title}".`,
        metadata: JSON.stringify({ jobId: job.id }),
      },
    });
  });

  await notifyAdmins({
    event: "BOOSTER_ASSIGNMENT_ACCEPTED",
    title: "Booster accepted assignment",
    body: `${profile.displayName} accepted "${job.title}".`,
    link: "/admin/boosters/jobs",
  });

  revalidatePath("/booster/applications");
  revalidatePath("/booster/dashboard");
  revalidatePath(`/booster/jobs/${job.id}`);
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: job.id };
}

export async function startBoosterJobAction(
  jobId: string
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const { profile, error } = await getBoosterProfileOrError(session.id);
  if (!profile) return { success: false, error: error! };

  const job = await prisma.boosterJob.findFirst({
    where: { id: jobId, assignedBoosterId: profile.id, status: "ACCEPTED" },
  });
  if (!job) return { success: false, error: "Accepted assignment not found." };

  await prisma.$transaction(async (tx) => {
    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "IN_PROGRESS" },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_JOB_STARTED",
        description: `${profile.displayName} started "${job.title}".`,
        metadata: JSON.stringify({ jobId: job.id }),
      },
    });
  });

  revalidatePath("/booster/applications");
  revalidatePath("/booster/dashboard");
  revalidatePath(`/booster/jobs/${job.id}`);
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: job.id };
}

export async function submitBoosterDeliverableAction(input: {
  jobId: string;
  files: string[];
  notes?: string;
  locationEvidence?: string;
}): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };
  const { profile, error } = await getBoosterProfileOrError(session.id);
  if (!profile) return { success: false, error: error! };

  const files = input.files.map((file) => file.trim()).filter(Boolean);
  if (files.length === 0) {
    return { success: false, error: "Add at least one proof or deliverable link." };
  }

  const job = await prisma.boosterJob.findFirst({
    where: {
      id: input.jobId,
      assignedBoosterId: profile.id,
      status: { in: ["IN_PROGRESS", "REWORK_REQUESTED"] },
    },
  });
  if (!job) return { success: false, error: "Active assignment not found." };

  const previousDeliverables = await prisma.boosterDeliverable.findMany({
    where: { boosterId: profile.id },
    select: { filesJson: true },
  });
  const previousFiles = new Set(
    previousDeliverables.flatMap((deliverable) =>
      parseStringArray(deliverable.filesJson)
    )
  );
  const duplicateFiles = files.filter((file) => previousFiles.has(file));
  const fraudRisk = duplicateFiles.length > 0 ? "MEDIUM" : "LOW";

  const deliverable = await prisma.$transaction(async (tx) => {
    const created = await tx.boosterDeliverable.create({
      data: {
        jobId: job.id,
        boosterId: profile.id,
        filesJson: JSON.stringify(files),
        notes: input.notes?.trim() || null,
        locationEvidence: input.locationEvidence?.trim() || null,
        decision: "PENDING",
        fraudRisk,
      },
    });

    await tx.boosterJob.update({
      where: { id: job.id },
      data: { status: "SUBMITTED_FOR_REVIEW" },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        action: "BOOSTER_DELIVERABLE_SUBMITTED",
        description: `${profile.displayName} submitted proof for "${job.title}".`,
        metadata: JSON.stringify({ jobId: job.id, deliverableId: created.id }),
      },
    });

    return created;
  });

  if (fraudRisk !== "LOW") {
    await notifyAdmins({
      event: "BOOSTER_FRAUD_FLAG",
      title: "Possible duplicate evidence",
      body: `${profile.displayName} submitted evidence already used on another deliverable for "${job.title}".`,
      link: "/admin/trust",
    });
  }

  await notifyAdmins({
    event: "BOOSTER_DELIVERABLE_SUBMITTED",
    title: "Booster proof submitted",
    body: `${profile.displayName} submitted proof for "${job.title}".`,
    link: "/admin/boosters/jobs",
  });

  revalidatePath("/booster/applications");
  revalidatePath("/booster/dashboard");
  revalidatePath(`/booster/jobs/${job.id}`);
  revalidatePath("/admin/boosters/jobs");
  return { success: true, id: deliverable.id };
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/booster/dashboard");
  revalidatePath("/booster/notifications");
  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/notifications");
  return { success: true, id: notificationId };
}

export async function markAllNotificationsReadAction(): Promise<BoosterActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  await prisma.notification.updateMany({
    where: { userId: session.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/booster/dashboard");
  revalidatePath("/booster/notifications");
  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/notifications");
  return { success: true };
}
