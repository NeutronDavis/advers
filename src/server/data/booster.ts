import { prisma } from "@/lib/prisma";
import {
  BOOSTER_CATEGORY_LABELS,
  BOOSTER_JOB_CATEGORY_LABELS,
  BOOSTER_JOB_STATUS_LABELS,
  BOOSTER_PAYMENT_MODEL_LABELS,
  BOOSTER_APPLICATION_STATUS_LABELS,
  BOOSTER_DELIVERABLE_DECISION_LABELS,
  BOOSTER_VERIFICATION_LABELS,
  boosterJobStatusBadgeClass,
  boosterJobStatusLabel,
} from "@/lib/booster-status";

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export interface BoosterProfileData {
  id: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  logoUrl: string | null;
  bio: string | null;
  isBusiness: boolean;
  categories: string[];
  skills: string[];
  coverage: string[];
  portfolio: { title: string; url: string; description?: string }[];
  rates: { label: string; amount: string }[];
  availableHours: string | null;
  verificationStatus: string;
  verificationLabel: string;
  verificationDocuments: string[];
  verificationLevel: string | null;
  verificationSubmittedAt: string | null;
  verificationSubmittedNote: string | null;
  verificationNotes: string | null;
  verificationReviewedAt: string | null;
  verifiedAt: string | null;
  fraudRisk: string;
  status: string;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  createdAt: string;
}

export interface BoosterJobCard {
  id: string;
  jobNumber: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  scope: string | null;
  location: string;
  isRemote: boolean;
  deadline: string | null;
  budget: number;
  paymentModel: string;
  paymentModelLabel: string;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  verificationLevel: string | null;
  requiredSkills: string[];
  proofRequirements: string[];
  clientName: string | null;
  campaignName: string | null;
  businessProfileName: string | null;
  teamId: string | null;
  teamName: string | null;
  assignedBoosterId: string | null;
  assignedBoosterName: string | null;
  applicationsCount: number;
  createdAt: string;
}

export interface BoosterJobDetailData extends BoosterJobCard {
  assignedBoosterName: string | null;
  assignedBoosterId: string | null;
  application: {
    id: string;
    status: string;
    statusLabel: string;
    coverNote: string | null;
    proposedFee: number | null;
    appliedAt: string;
  } | null;
  deliverables: {
    id: string;
    files: string[];
    notes: string | null;
    locationEvidence: string | null;
    decision: string;
    decisionLabel: string;
    decisionReason: string | null;
    submittedAt: string;
    reviewerName: string | null;
  }[];
}

function mapJob(job: {
  id: string;
  jobNumber: string;
  title: string;
  category: string;
  description: string;
  scope: string | null;
  location: string;
  isRemote: boolean;
  deadline: Date | null;
  budget: number;
  paymentModel: string;
  status: string;
  verificationLevel: string | null;
  requiredSkillsJson: string | null;
  proofRequirementsJson: string | null;
  createdAt: Date;
  client?: { name: string } | null;
  campaign?: { name: string } | null;
  businessProfile?: { name: string } | null;
  team?: { id: string; name: string } | null;
  assignedBooster?: { id?: string; displayName: string } | null;
  _count?: { applications: number };
}): BoosterJobCard {
  return {
    id: job.id,
    jobNumber: job.jobNumber,
    title: job.title,
    category: job.category,
    categoryLabel: BOOSTER_JOB_CATEGORY_LABELS[job.category] || job.category,
    description: job.description,
    scope: job.scope,
    location: job.location,
    isRemote: job.isRemote,
    deadline: job.deadline ? job.deadline.toISOString() : null,
    budget: job.budget,
    paymentModel: job.paymentModel,
    paymentModelLabel:
      BOOSTER_PAYMENT_MODEL_LABELS[job.paymentModel] || job.paymentModel,
    status: job.status,
    statusLabel: boosterJobStatusLabel(job.status),
    statusBadgeClass: boosterJobStatusBadgeClass(job.status),
    verificationLevel: job.verificationLevel,
    requiredSkills: parseStringArray(job.requiredSkillsJson),
    proofRequirements: parseStringArray(job.proofRequirementsJson),
    clientName: job.client?.name || null,
    campaignName: job.campaign?.name || null,
    businessProfileName: job.businessProfile?.name || null,
    teamId: job.team?.id || null,
    teamName: job.team?.name || null,
    assignedBoosterId: job.assignedBooster?.id || null,
    assignedBoosterName: job.assignedBooster?.displayName || null,
    applicationsCount: job._count?.applications ?? 0,
    createdAt: job.createdAt.toISOString(),
  };
}

export async function getBoosterProfileForUser(
  userId: string
): Promise<BoosterProfileData | null> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    businessName: profile.businessName,
    logoUrl: profile.logoUrl,
    bio: profile.bio,
    isBusiness: profile.isBusiness,
    categories: parseStringArray(profile.categoriesJson),
    skills: parseStringArray(profile.skillsJson),
    coverage: parseStringArray(profile.coverageJson),
    portfolio: parseJsonArray<{
      title: string;
      url: string;
      description?: string;
    }>(profile.portfolioJson),
    rates: parseJsonArray<{ label: string; amount: string }>(profile.ratesJson),
    availableHours: profile.availableHours,
    verificationStatus: profile.verificationStatus,
    verificationLabel:
      BOOSTER_VERIFICATION_LABELS[profile.verificationStatus] ||
      profile.verificationStatus,
    verificationDocuments: parseStringArray(profile.verificationDocumentsJson),
    verificationLevel: profile.verificationLevel,
    verificationSubmittedAt: profile.verificationSubmittedAt?.toISOString() || null,
    verificationSubmittedNote: profile.verificationSubmittedNote,
    verificationNotes: profile.verificationNotes,
    verificationReviewedAt: profile.verificationReviewedAt?.toISOString() || null,
    verifiedAt: profile.verifiedAt?.toISOString() || null,
    fraudRisk: profile.fraudRisk,
    status: profile.status,
    ratingAvg: profile.ratingAvg,
    ratingCount: profile.ratingCount,
    completedJobs: profile.completedJobs,
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function getOpenBoosterJobs(filters?: {
  category?: string;
  location?: string;
  remote?: boolean;
  paymentModel?: string;
  search?: string;
}): Promise<BoosterJobCard[]> {
  const jobs = await prisma.boosterJob.findMany({
    where: {
      status: { in: ["PUBLISHED", "APPLICATIONS_OPEN"] },
      ...(filters?.category ? { category: filters.category as never } : {}),
      ...(filters?.location
        ? { location: { contains: filters.location } }
        : {}),
      ...(filters?.remote ? { isRemote: true } : {}),
      ...(filters?.paymentModel
        ? { paymentModel: filters.paymentModel as never }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { description: { contains: filters.search } },
              { requiredSkillsJson: { contains: filters.search } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { name: true } },
      campaign: { select: { name: true } },
      businessProfile: { select: { name: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return jobs.map(mapJob);
}

export async function getBoosterJobDetail(
  jobId: string,
  userId: string
): Promise<BoosterJobDetailData | null> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });

  const job = await prisma.boosterJob.findUnique({
    where: { id: jobId },
    include: {
      client: { select: { name: true } },
      campaign: { select: { name: true } },
      businessProfile: { select: { name: true } },
      team: { select: { id: true, name: true } },
      assignedBooster: { select: { id: true, displayName: true } },
      applications: profile
        ? { where: { boosterId: profile.id }, take: 1 }
        : { where: { id: "__none__" }, take: 1 },
      deliverables: {
        where: profile ? { boosterId: profile.id } : { id: "__none__" },
        orderBy: { submittedAt: "desc" },
        include: { reviewer: { select: { name: true } } },
      },
    },
  });

  if (!job) return null;

  const application = job.applications[0];

  return {
    ...mapJob(job),
    assignedBoosterName: job.assignedBooster?.displayName || null,
    assignedBoosterId: job.assignedBoosterId,
    application: application
      ? {
          id: application.id,
          status: application.status,
          statusLabel:
            BOOSTER_APPLICATION_STATUS_LABELS[application.status] ||
            application.status,
          coverNote: application.coverNote,
          proposedFee: application.proposedFee,
          appliedAt: application.appliedAt.toISOString(),
        }
      : null,
    deliverables: job.deliverables.map((deliverable) => ({
      id: deliverable.id,
      files: parseStringArray(deliverable.filesJson),
      notes: deliverable.notes,
      locationEvidence: deliverable.locationEvidence,
      decision: deliverable.decision,
      decisionLabel:
        BOOSTER_DELIVERABLE_DECISION_LABELS[deliverable.decision] ||
        deliverable.decision,
      decisionReason: deliverable.decisionReason,
      submittedAt: deliverable.submittedAt.toISOString(),
      reviewerName: deliverable.reviewer?.name || null,
    })),
  };
}

export interface BoosterApplicationView {
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  jobStatusLabel: string;
  jobStatusBadgeClass: string;
  categoryLabel: string;
  location: string;
  budget: number;
  paymentModelLabel: string;
  status: string;
  statusLabel: string;
  appliedAt: string;
  assignedAt: string | null;
  deadline: string | null;
}

export async function getBoosterApplicationsForUser(
  userId: string
): Promise<BoosterApplicationView[]> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const applications = await prisma.boosterApplication.findMany({
    where: { boosterId: profile.id },
    include: { job: true },
    orderBy: { appliedAt: "desc" },
    take: 100,
  });

  return applications.map((application) => ({
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    jobStatus: application.job.status,
    jobStatusLabel: BOOSTER_JOB_STATUS_LABELS[application.job.status] || application.job.status,
    jobStatusBadgeClass: boosterJobStatusBadgeClass(application.job.status),
    categoryLabel:
      BOOSTER_JOB_CATEGORY_LABELS[application.job.category] ||
      application.job.category,
    location: application.job.location,
    budget: application.job.budget,
    paymentModelLabel:
      BOOSTER_PAYMENT_MODEL_LABELS[application.job.paymentModel] ||
      application.job.paymentModel,
    status: application.status,
    statusLabel:
      BOOSTER_APPLICATION_STATUS_LABELS[application.status] ||
      application.status,
    appliedAt: application.appliedAt.toISOString(),
    assignedAt: application.assignedAt ? application.assignedAt.toISOString() : null,
    deadline: application.job.deadline
      ? application.job.deadline.toISOString()
      : null,
  }));
}

export async function getBoosterAssignedJobsForUser(
  userId: string
): Promise<BoosterJobCard[]> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const jobs = await prisma.boosterJob.findMany({
    where: {
      status: {
        in: [
          "ASSIGNED",
          "ACCEPTED",
          "IN_PROGRESS",
          "SUBMITTED_FOR_REVIEW",
          "APPROVED",
          "PAYMENT_PENDING",
          "PAID",
          "REWORK_REQUESTED",
        ],
      },
      OR: [
        { assignedBoosterId: profile.id },
        { team: { members: { some: { boosterId: profile.id } } } },
      ],
    },
    include: {
      client: { select: { name: true } },
      campaign: { select: { name: true } },
      businessProfile: { select: { name: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return jobs.map(mapJob);
}

export async function getAdvertiserBoosterJobs(
  clientId: string
): Promise<BoosterJobCard[]> {
  const jobs = await prisma.boosterJob.findMany({
    where: { clientId },
    include: {
      client: { select: { name: true } },
      campaign: { select: { name: true } },
      businessProfile: { select: { name: true } },
      team: { select: { id: true, name: true } },
      assignedBooster: { select: { id: true, displayName: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return jobs.map(mapJob);
}

export interface AdminBoosterApplicationView {
  id: string;
  boosterId: string;
  boosterName: string;
  status: string;
  statusLabel: string;
  proposedFee: number | null;
  appliedAt: string;
}

export interface AdminBoosterDeliverableView {
  id: string;
  files: string[];
  notes: string | null;
  decision: string;
  decisionLabel: string;
  decisionReason: string | null;
  submittedAt: string;
  boosterName: string;
}

export interface AdminBoosterJobView extends BoosterJobCard {
  applications: AdminBoosterApplicationView[];
  deliverables: AdminBoosterDeliverableView[];
}

export async function getAdminBoosterJobs(): Promise<AdminBoosterJobView[]> {
  const jobs = await prisma.boosterJob.findMany({
    include: {
      client: { select: { name: true } },
      campaign: { select: { name: true } },
      businessProfile: { select: { name: true } },
      team: { select: { id: true, name: true } },
      applications: {
        include: { booster: { select: { displayName: true } } },
        orderBy: { appliedAt: "desc" },
      },
      deliverables: {
        include: { booster: { select: { displayName: true } } },
        orderBy: { submittedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return jobs.map((job) => ({
    ...mapJob(job),
    applications: job.applications.map((application) => ({
      id: application.id,
      boosterId: application.boosterId,
      boosterName: application.booster.displayName,
      status: application.status,
      statusLabel:
        BOOSTER_APPLICATION_STATUS_LABELS[application.status] ||
        application.status,
      proposedFee: application.proposedFee,
      appliedAt: application.appliedAt.toISOString(),
    })),
    deliverables: job.deliverables.map((deliverable) => ({
      id: deliverable.id,
      files: parseStringArray(deliverable.filesJson),
      notes: deliverable.notes,
      decision: deliverable.decision,
      decisionLabel:
        BOOSTER_DELIVERABLE_DECISION_LABELS[deliverable.decision] ||
        deliverable.decision,
      decisionReason: deliverable.decisionReason,
      submittedAt: deliverable.submittedAt.toISOString(),
      boosterName: deliverable.booster.displayName,
    })),
  }));
}

export interface NotificationView {
  id: string;
  event: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function getNotificationsForUser(
  userId: string,
  limit = 12
): Promise<NotificationView[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId, channel: "IN_APP" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    event: notification.event,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null, channel: "IN_APP" },
  });
}

export interface BoosterTeamView {
  id: string;
  name: string;
  description: string | null;
  status: string;
  managerName: string;
  isManager: boolean;
  members: {
    id: string;
    boosterId: string;
    name: string;
    role: string;
    status: string;
  }[];
  jobs: BoosterJobCard[];
}

export async function getBoosterTeamsForUser(
  userId: string
): Promise<BoosterTeamView[]> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const teams = await prisma.boosterTeam.findMany({
    where: {
      OR: [
        { managerId: profile.id },
        { members: { some: { boosterId: profile.id } } },
      ],
    },
    include: {
      manager: { select: { displayName: true } },
      members: {
        include: { booster: { select: { displayName: true } } },
        orderBy: { joinedAt: "asc" },
      },
      jobs: {
        include: {
          client: { select: { name: true } },
          campaign: { select: { name: true } },
          businessProfile: { select: { name: true } },
          team: { select: { id: true, name: true } },
          assignedBooster: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    status: team.status,
    managerName: team.manager.displayName,
    isManager: team.managerId === profile.id,
    members: team.members.map((member) => ({
      id: member.id,
      boosterId: member.boosterId,
      name: member.booster.displayName,
      role: member.role,
      status: member.status,
    })),
    jobs: team.jobs.map(mapJob),
  }));
}

export const BOOSTER_CATEGORY_OPTIONS = Object.entries(BOOSTER_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const BOOSTER_JOB_CATEGORY_OPTIONS = Object.entries(
  BOOSTER_JOB_CATEGORY_LABELS
).map(([value, label]) => ({ value, label }));

export const BOOSTER_PAYMENT_MODEL_OPTIONS = Object.entries(
  BOOSTER_PAYMENT_MODEL_LABELS
).map(([value, label]) => ({ value, label }));
