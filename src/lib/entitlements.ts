import { prisma } from "@/lib/prisma";
import { PLAN_FEATURES, type PlanFeature } from "@/lib/plans";

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "RENEWAL_DUE",
  "GRACE_PERIOD",
] as const;

export interface Entitlements {
  hasPlan: boolean;
  planKey: string | null;
  planName: string;
  profileLimit: number;
  workspaceLimit: number;
  teamSeatLimit: number;
  features: PlanFeature[];
  subscription: {
    id: string;
    status: string;
    billingPeriod: string;
    price: number;
    startDate: Date;
    renewalDate: Date;
  } | null;
}

export interface Usage {
  businessProfiles: number;
  activeWorkspaces: number;
  teamMembers: number;
}

export interface EntitlementCheck {
  allowed: boolean;
  reason?: string;
  used: number;
  limit: number;
}

const NO_PLAN: Entitlements = {
  hasPlan: false,
  planKey: null,
  planName: "No active plan",
  profileLimit: 0,
  workspaceLimit: 0,
  teamSeatLimit: 0,
  features: [],
  subscription: null,
};

function parseFeatures(value: string | null | undefined): PlanFeature[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PlanFeature =>
        typeof item === "string" && item in PLAN_FEATURES
    );
  } catch {
    return [];
  }
}

export async function getEntitlements(
  clientId: string | null | undefined
): Promise<Entitlements> {
  if (!clientId) return NO_PLAN;

  const subscription = await prisma.subscription.findFirst({
    where: {
      clientId,
      status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return NO_PLAN;

  return {
    hasPlan: true,
    planKey: subscription.plan.key,
    planName: subscription.plan.name,
    profileLimit: subscription.plan.profileLimit,
    workspaceLimit: subscription.plan.workspaceLimit,
    teamSeatLimit: subscription.plan.teamSeatLimit,
    features: parseFeatures(subscription.plan.featuresJson),
    subscription: {
      id: subscription.id,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
      price: subscription.price,
      startDate: subscription.startDate,
      renewalDate: subscription.renewalDate,
    },
  };
}

export async function getUsage(clientId: string): Promise<Usage> {
  const now = new Date();
  const [businessProfiles, activeWorkspaces, teamMembers, pendingInvitations] =
    await Promise.all([
      prisma.businessProfile.count({ where: { clientId } }),
      prisma.campaign.count({
        where: {
          clientId,
          status: { notIn: ["COMPLETED", "CANCELLED", "REJECTED"] },
        },
      }),
      prisma.user.count({
        where: {
          clientId,
          orgRole: "MEMBER",
          status: { not: "DEACTIVATED" },
        },
      }),
      prisma.invitation.count({
        where: {
          clientId,
          acceptedAt: null,
          expiresAt: { gt: now },
        },
      }),
    ]);

  return {
    businessProfiles,
    activeWorkspaces,
    teamMembers: teamMembers + pendingInvitations,
  };
}

export async function canCreateBusinessProfile(
  clientId: string | null | undefined
): Promise<EntitlementCheck> {
  const entitlements = await getEntitlements(clientId);
  if (!entitlements.hasPlan) {
    return {
      allowed: false,
      reason: "Choose a subscription plan before creating a business profile.",
      used: 0,
      limit: 0,
    };
  }
  if (!clientId) {
    return {
      allowed: false,
      reason: "Your account is not linked to a business yet.",
      used: 0,
      limit: entitlements.profileLimit,
    };
  }

  const used = await prisma.businessProfile.count({ where: { clientId } });
  if (used >= entitlements.profileLimit) {
    return {
      allowed: false,
      reason: `Your ${entitlements.planName} plan allows ${entitlements.profileLimit} business profile${
        entitlements.profileLimit === 1 ? "" : "s"
      }. Upgrade to add another.`,
      used,
      limit: entitlements.profileLimit,
    };
  }

  return { allowed: true, used, limit: entitlements.profileLimit };
}

export async function canCreateCampaignWorkspace(
  clientId: string | null | undefined
): Promise<EntitlementCheck> {
  const entitlements = await getEntitlements(clientId);
  if (!entitlements.hasPlan) {
    return {
      allowed: false,
      reason: "Choose a subscription plan before creating a campaign workspace.",
      used: 0,
      limit: 0,
    };
  }
  if (!clientId) {
    return {
      allowed: false,
      reason: "Your account is not linked to a business yet.",
      used: 0,
      limit: entitlements.workspaceLimit,
    };
  }

  const used = await prisma.campaign.count({
    where: {
      clientId,
      status: { notIn: ["COMPLETED", "CANCELLED", "REJECTED"] },
    },
  });

  if (used >= entitlements.workspaceLimit) {
    return {
      allowed: false,
      reason: `Your ${entitlements.planName} plan allows ${entitlements.workspaceLimit} active campaign workspace${
        entitlements.workspaceLimit === 1 ? "" : "s"
      }. Complete or archive an existing campaign, or upgrade.`,
      used,
      limit: entitlements.workspaceLimit,
    };
  }

  return { allowed: true, used, limit: entitlements.workspaceLimit };
}

export async function canInviteTeamMember(
  clientId: string | null | undefined
): Promise<EntitlementCheck> {
  const entitlements = await getEntitlements(clientId);
  if (!entitlements.hasPlan) {
    return {
      allowed: false,
      reason: "Choose a subscription plan before inviting team members.",
      used: 0,
      limit: 0,
    };
  }
  if (!clientId) {
    return {
      allowed: false,
      reason: "Your account is not linked to a business yet.",
      used: 0,
      limit: entitlements.teamSeatLimit,
    };
  }
  if (entitlements.teamSeatLimit === 0) {
    return {
      allowed: false,
      reason: "Team access is available on Business Pro Access. Upgrade to invite team members.",
      used: 0,
      limit: 0,
    };
  }

  const usage = await getUsage(clientId);
  if (usage.teamMembers >= entitlements.teamSeatLimit) {
    return {
      allowed: false,
      reason: `Your ${entitlements.planName} plan allows ${entitlements.teamSeatLimit} additional team members.`,
      used: usage.teamMembers,
      limit: entitlements.teamSeatLimit,
    };
  }

  return {
    allowed: true,
    used: usage.teamMembers,
    limit: entitlements.teamSeatLimit,
  };
}

export function hasFeature(
  entitlements: Entitlements,
  feature: PlanFeature
): boolean {
  return entitlements.features.includes(feature);
}
