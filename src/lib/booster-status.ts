export const BOOSTER_CATEGORY_LABELS: Record<string, string> = {
  CREATIVE: "Creative",
  PRODUCTION: "Production",
  DISTRIBUTION: "Distribution",
  FIELD_MARKETING: "Field marketing",
  INTELLIGENCE: "Intelligence",
  SALES_CONVERSION: "Sales & conversion",
  EXPERIENCE_TECHNOLOGY: "Experience & technology",
};

export const BOOSTER_JOB_CATEGORY_LABELS: Record<string, string> = {
  CREATIVE: "Creative jobs",
  PRODUCTION: "Production jobs",
  LOGISTICS: "Logistics jobs",
  FIELD_MARKETING: "Field marketing",
  INTELLIGENCE: "Intelligence opportunities",
  SALES_REFERRALS: "Sales & referrals",
  TECHNICAL: "Technical services",
  CAMPAIGN_MANAGEMENT: "Campaign management",
  TEAM_OPPORTUNITY: "Team opportunities",
};

export const BOOSTER_PAYMENT_MODEL_LABELS: Record<string, string> = {
  FIXED: "Fixed job payment",
  COMMISSION: "Commission",
  PER_ORDER: "Per order",
  PER_DELIVERY: "Per delivery",
  PER_TASK: "Per task",
  PER_VERIFICATION: "Per verification",
  PER_REPORT: "Per approved report",
  PER_LEAD: "Per qualified lead",
  PROJECT_FEE: "Project fee",
  MANAGEMENT_FEE: "Management fee",
};

export const BOOSTER_JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  APPLICATIONS_OPEN: "Applications open",
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In progress",
  SUBMITTED_FOR_REVIEW: "Submitted for review",
  APPROVED: "Approved",
  PAYMENT_PENDING: "Payment pending",
  PAID: "Paid",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  REWORK_REQUESTED: "Rework requested",
};

export const BOOSTER_APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  ASSIGNED: "Assigned",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const BOOSTER_DELIVERABLE_DECISION_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REWORK_REQUESTED: "Rework requested",
};

export const BOOSTER_VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  PENDING: "Pending verification",
  VERIFIED: "Verified",
  REJECTED: "Verification rejected",
};

export function boosterJobStatusLabel(status: string): string {
  return BOOSTER_JOB_STATUS_LABELS[status] || status;
}

export function boosterJobStatusBadgeClass(status: string): string {
  switch (status) {
    case "APPROVED":
    case "PAID":
    case "CLOSED":
      return "badge-success badge-soft";
    case "PUBLISHED":
    case "APPLICATIONS_OPEN":
    case "ASSIGNED":
    case "ACCEPTED":
      return "badge-info badge-soft";
    case "IN_PROGRESS":
    case "SUBMITTED_FOR_REVIEW":
    case "PAYMENT_PENDING":
      return "badge-warning badge-soft";
    case "REJECTED":
    case "CANCELLED":
    case "DISPUTED":
      return "badge-error badge-soft";
    case "WITHDRAWN":
    case "REWORK_REQUESTED":
      return "badge-neutral badge-soft";
    default:
      return "badge-ghost";
  }
}

export const BOOSTER_JOB_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["APPLICATIONS_OPEN", "CANCELLED"],
  APPLICATIONS_OPEN: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "REJECTED", "WITHDRAWN", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["SUBMITTED_FOR_REVIEW", "DISPUTED", "CANCELLED"],
  SUBMITTED_FOR_REVIEW: ["APPROVED", "REJECTED", "REWORK_REQUESTED", "DISPUTED"],
  REWORK_REQUESTED: ["IN_PROGRESS", "SUBMITTED_FOR_REVIEW"],
  APPROVED: ["PAYMENT_PENDING", "PAID", "CLOSED"],
  PAYMENT_PENDING: ["PAID", "CLOSED"],
  PAID: ["CLOSED"],
  REJECTED: ["CLOSED"],
  WITHDRAWN: ["CLOSED"],
  CANCELLED: ["CLOSED"],
  DISPUTED: ["IN_PROGRESS", "CLOSED"],
  CLOSED: [],
};

export function canTransitionBoosterJob(from: string, to: string): boolean {
  return (BOOSTER_JOB_TRANSITIONS[from] || []).includes(to);
}

export const BOOSTER_JOB_OPEN_STATUSES = [
  "PUBLISHED",
  "APPLICATIONS_OPEN",
];

export function isBoosterJobOpen(status: string): boolean {
  return BOOSTER_JOB_OPEN_STATUSES.includes(status);
}
