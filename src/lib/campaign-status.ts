export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  QUOTE_REQUIRED: "Quote required",
  AWAITING_APPROVAL: "Awaiting advertiser approval",
  AWAITING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  ON_HOLD: "On hold",
  PARTIALLY_COMPLETED: "Partially completed",
  DISPUTED: "Disputed",
  // Legacy
  PENDING_REVIEW: "Submitted",
  APPROVED: "Confirmed",
  SCHEDULED: "Confirmed",
  ACTIVE: "In progress",
  REVISION_REQUESTED: "Under review",
};

const LEGACY_STATUS_MAP: Record<string, string> = {
  PENDING_REVIEW: "SUBMITTED",
  APPROVED: "CONFIRMED",
  SCHEDULED: "CONFIRMED",
  ACTIVE: "IN_PROGRESS",
  REVISION_REQUESTED: "UNDER_REVIEW",
};

export function normalizeCampaignStatus(status: string): string {
  return LEGACY_STATUS_MAP[status] || status;
}

export function campaignStatusLabel(status: string): string {
  return CAMPAIGN_STATUS_LABELS[status] || CAMPAIGN_STATUS_LABELS[normalizeCampaignStatus(status)] || status;
}

export type CampaignStatusTone =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "neutral";

export function campaignStatusTone(status: string): CampaignStatusTone {
  const normalized = normalizeCampaignStatus(status);
  switch (normalized) {
    case "COMPLETED":
    case "CONFIRMED":
      return "success";
    case "IN_PROGRESS":
    case "AWAITING_PAYMENT":
    case "AWAITING_APPROVAL":
    case "QUOTE_REQUIRED":
      return "info";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "ON_HOLD":
    case "PARTIALLY_COMPLETED":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
    case "DISPUTED":
      return "error";
    default:
      return "neutral";
  }
}

export function campaignStatusBadgeClass(status: string): string {
  const tone = campaignStatusTone(status);
  switch (tone) {
    case "success":
      return "badge-success badge-soft";
    case "warning":
      return "badge-warning badge-soft";
    case "info":
      return "badge-info badge-soft";
    case "error":
      return "badge-error badge-soft";
    default:
      return "badge-neutral badge-soft";
  }
}

export const CAMPAIGN_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED", "CANCELLED"],
  UNDER_REVIEW: [
    "QUOTE_REQUIRED",
    "AWAITING_APPROVAL",
    "REJECTED",
    "ON_HOLD",
    "CANCELLED",
  ],
  QUOTE_REQUIRED: ["AWAITING_APPROVAL", "UNDER_REVIEW", "REJECTED", "CANCELLED"],
  AWAITING_APPROVAL: ["AWAITING_PAYMENT", "REJECTED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "PARTIALLY_COMPLETED", "DISPUTED", "ON_HOLD"],
  ON_HOLD: ["UNDER_REVIEW", "IN_PROGRESS", "CANCELLED"],
  PARTIALLY_COMPLETED: ["COMPLETED", "DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionCampaign(from: string, to: string): boolean {
  const normalizedFrom = normalizeCampaignStatus(from);
  const normalizedTo = normalizeCampaignStatus(to);
  return (CAMPAIGN_TRANSITIONS[normalizedFrom] || []).includes(normalizedTo);
}

export const CAMPAIGN_ACTIVE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTE_REQUIRED",
  "AWAITING_APPROVAL",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "IN_PROGRESS",
  "ON_HOLD",
  "PARTIALLY_COMPLETED",
  "DISPUTED",
  "PENDING_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "ACTIVE",
  "REVISION_REQUESTED",
];

export function isCampaignWorkspaceActive(status: string): boolean {
  return CAMPAIGN_ACTIVE_STATUSES.includes(status);
}
