"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { getSession } from "@/lib/session";
import { enforceRateLimit } from "@/server/security/rate-limit";

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

const CreateRequestSchema = z.object({
  boosterId: z.string().min(1),
  serviceId: z.string().optional(),
  packageId: z.string().optional(),
  title: z.string().trim().min(3, "Add a short request title.").max(160),
  brief: z
    .string()
    .trim()
    .min(20, "Describe the work in at least 20 characters.")
    .max(5000),
  budget: z.number().int().min(0).max(1_000_000_000).optional(),
  timeline: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email().optional(),
  contactPhone: z.string().trim().max(40).optional(),
});

export async function createBoosterEngagementRequestAction(
  input: z.input<typeof CreateRequestSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sign in to contact a Booster." };
  if (!session.clientId) {
    return { success: false, error: "Use an advertiser account to send a request." };
  }

  const parsed = CreateRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const limited = await enforceRateLimit(
    `booster-request:${session.id}`,
    5,
    60 * 60_000
  );
  if (!limited.allowed) {
    return {
      success: false,
      error: `Too many requests. Try again in ${Math.ceil(limited.retryAfterMs / 1000)}s.`,
    };
  }

  const booster = await prisma.boosterProfile.findFirst({
    where: { id: parsed.data.boosterId, status: "ACTIVE" },
    select: { id: true, userId: true, displayName: true, handle: true },
  });
  if (!booster) return { success: false, error: "Booster not found." };
  if (booster.userId === session.id) {
    return { success: false, error: "You cannot send a request to your own profile." };
  }

  let serviceId: string | null = null;
  if (parsed.data.serviceId) {
    const service = await prisma.boosterService.findFirst({
      where: { id: parsed.data.serviceId, boosterId: booster.id, active: true },
      select: { id: true },
    });
    if (!service) return { success: false, error: "That service is no longer available." };
    serviceId = service.id;
  }

  let packageId: string | null = null;
  if (parsed.data.packageId) {
    const item = await prisma.boosterPackage.findFirst({
      where: { id: parsed.data.packageId, boosterId: booster.id, active: true },
      select: { id: true },
    });
    if (!item) return { success: false, error: "That package is no longer available." };
    packageId = item.id;
  }

  const request = await prisma.boosterEngagementRequest.create({
    data: {
      boosterId: booster.id,
      userId: session.id,
      clientId: session.clientId,
      serviceId,
      packageId,
      title: parsed.data.title,
      brief: parsed.data.brief,
      budget: parsed.data.budget ?? null,
      timeline: parsed.data.timeline || null,
      contactEmail: parsed.data.contactEmail || session.email,
      contactPhone: parsed.data.contactPhone || null,
      status: "REQUESTED",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "BOOSTER_ENGAGEMENT_REQUESTED",
      description: `${session.name} contacted ${booster.displayName} directly.`,
      metadata: JSON.stringify({ requestId: request.id, boosterId: booster.id }),
    },
  });

  await dispatchNotificationSafe({
    userId: booster.userId,
    event: "BOOSTER_ENGAGEMENT_REQUESTED",
    title: "New direct engagement request",
    body: `${session.name} sent a request: ${parsed.data.title}.`,
    link: "/booster/requests",
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      dispatchNotificationSafe({
        userId: admin.id,
        event: "BOOSTER_ENGAGEMENT_REQUESTED",
        title: "New marketplace engagement request",
        body: `${session.name} contacted ${booster.displayName}.`,
        link: "/admin/marketplace",
      })
    )
  );

  revalidatePath(`/portal/adboosters/${booster.handle ?? booster.id}`);
  revalidatePath("/portal/booster-requests");
  revalidatePath("/booster/requests");
  return { success: true, id: request.id };
}

const RespondSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "DECLINED"]),
  note: z.string().trim().max(2000).optional(),
});

export async function respondBoosterEngagementRequestAction(
  input: z.input<typeof RespondSchema>
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const parsed = RespondSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  const request = await prisma.boosterEngagementRequest.findFirst({
    where: { id: parsed.data.requestId, boosterId: profile.id },
  });
  if (!request) return { success: false, error: "Request not found." };
  if (["ACCEPTED", "DECLINED", "CONVERTED", "CANCELLED"].includes(request.status)) {
    return { success: false, error: "This request has already been answered." };
  }

  await prisma.boosterEngagementRequest.update({
    where: { id: request.id },
    data: {
      status: parsed.data.decision,
      responseNote: parsed.data.note || null,
      respondedAt: new Date(),
    },
  });

  await dispatchNotificationSafe({
    userId: request.userId,
    event: `BOOSTER_ENGAGEMENT_${parsed.data.decision}`,
    title:
      parsed.data.decision === "ACCEPTED"
        ? "Booster accepted your request"
        : "Booster declined your request",
    body: parsed.data.note || `Your request "${request.title}" was ${parsed.data.decision.toLowerCase()}.`,
    link: "/portal/booster-requests",
  });

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `BOOSTER_ENGAGEMENT_${parsed.data.decision}`,
      description: `${session.name} ${parsed.data.decision.toLowerCase()} an engagement request.`,
      metadata: JSON.stringify({ requestId: request.id }),
    },
  });

  revalidatePath("/booster/requests");
  revalidatePath("/portal/booster-requests");
  return { success: true };
}

export async function markBoosterEngagementRequestsViewedAction(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  await prisma.boosterEngagementRequest.updateMany({
    where: { boosterId: profile.id, status: "REQUESTED" },
    data: { status: "VIEWED", viewedAt: new Date() },
  });
  revalidatePath("/booster/requests");
  revalidatePath("/booster");
  return { success: true };
}

export async function convertEngagementRequestToJobAction(
  requestId: string
): Promise<ActionResult<{ jobId: string }>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: session.id },
    select: { id: true, handle: true, location: true, userId: true },
  });
  if (!profile) return { success: false, error: "Create a Booster profile first." };

  const request = await prisma.boosterEngagementRequest.findFirst({
    where: { id: requestId, boosterId: profile.id },
  });
  if (!request) return { success: false, error: "Request not found." };
  if (request.status !== "ACCEPTED") {
    return {
      success: false,
      error: "Accept the request before converting it to a Booster job.",
    };
  }

  const job = await prisma.boosterJob.create({
    data: {
      jobNumber: `BJ-${Date.now().toString().slice(-8)}-${Math.floor(
        Math.random() * 90 + 10
      )}`,
      clientId: request.clientId,
      category: "CAMPAIGN_MANAGEMENT",
      title: request.title,
      description: request.brief,
      location: profile.location || "Remote",
      isRemote: true,
      budget: request.budget ?? 0,
      paymentModel: "FIXED",
      status: "DRAFT",
      createdById: session.id,
      assignedBoosterId: profile.id,
    },
  });

  await prisma.boosterEngagementRequest.update({
    where: { id: request.id },
    data: { status: "CONVERTED" },
  });

  await dispatchNotificationSafe({
    userId: request.userId,
    event: "BOOSTER_JOB_CREATED_FROM_REQUEST",
    title: "Booster job draft created",
    body: `${profile.handle ?? "Your Booster"} converted your request into a draft job.`,
    link: "/portal/booster-jobs",
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "BOOSTER_ENGAGEMENT_CONVERTED",
      description: `${session.name} converted an engagement request into a Booster job.`,
      metadata: JSON.stringify({ requestId: request.id, jobId: job.id }),
    },
  });

  revalidatePath("/booster/requests");
  revalidatePath("/booster/jobs");
  revalidatePath("/portal/booster-requests");
  revalidatePath("/portal/booster-jobs");
  return { success: true, jobId: job.id };
}
