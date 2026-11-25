import { prisma } from "@/lib/prisma";

export interface EngagementRequestView {
  id: string;
  title: string;
  brief: string;
  budget: number | null;
  currency: string;
  timeline: string | null;
  status: string;
  boosterName: string;
  boosterHandle: string | null;
  serviceTitle: string | null;
  packageName: string | null;
  responseNote: string | null;
  createdAt: string;
  respondedAt: string | null;
  requesterName?: string;
  requesterEmail?: string;
}

export async function getAdvertiserEngagementRequests(
  userId: string
): Promise<EngagementRequestView[]> {
  const requests = await prisma.boosterEngagementRequest.findMany({
    where: { userId },
    include: {
      booster: { select: { displayName: true, handle: true } },
      service: { select: { title: true } },
      package: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.title,
    brief: request.brief,
    budget: request.budget,
    currency: request.currency,
    timeline: request.timeline,
    status: request.status,
    boosterName: request.booster.displayName,
    boosterHandle: request.booster.handle,
    serviceTitle: request.service?.title ?? null,
    packageName: request.package?.name ?? null,
    responseNote: request.responseNote,
    createdAt: request.createdAt.toISOString(),
    respondedAt: request.respondedAt ? request.respondedAt.toISOString() : null,
  }));
}

export async function getBoosterEngagementRequestCount(
  userId: string
): Promise<number> {
  const profile = await prisma.boosterProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return 0;
  return prisma.boosterEngagementRequest.count({
    where: { boosterId: profile.id, status: "REQUESTED" },
  });
}

export async function getBoosterEngagementRequests(
  userId: string
): Promise<EngagementRequestView[]> {
  const profile = await prisma.boosterProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  const requests = await prisma.boosterEngagementRequest.findMany({
    where: { boosterId: profile.id },
    include: {
      booster: { select: { displayName: true, handle: true } },
      service: { select: { title: true } },
      package: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.title,
    brief: request.brief,
    budget: request.budget,
    currency: request.currency,
    timeline: request.timeline,
    status: request.status,
    boosterName: request.booster.displayName,
    boosterHandle: request.booster.handle,
    serviceTitle: request.service?.title ?? null,
    packageName: request.package?.name ?? null,
    responseNote: request.responseNote,
    createdAt: request.createdAt.toISOString(),
    respondedAt: request.respondedAt ? request.respondedAt.toISOString() : null,
    requesterName: request.user.name,
    requesterEmail: request.user.email,
  }));
}
