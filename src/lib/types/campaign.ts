export type CampaignViewStatus =
  | "ACTIVE"
  | "IN_REVIEW"
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  location: string;
  budget: number;
  duration: string;
  goal: string;
  status: CampaignViewStatus;
  rawStatus: string;
  statusLabel: string;
  createdAt: string;
  icon: string;
}

export const CHANNEL_ICONS: Record<string, string> = {
  "Digital billboards": "▣",
  "Static billboards": "▧",
  "FM radio": "♫",
  Television: "▣",
  Newspapers: "▤",
  "Podcast advertising": "🎙",
  AdBoosters: "✦",
  "Influencer Hub": "◎",
  "Influencer marketplace": "◎",
};

export const CHANNEL_LABELS: Record<string, string> = {
  DIGITAL_BILLBOARD: "Digital billboards",
  STATIC_BILLBOARD: "Static billboards",
  FM_RADIO: "FM radio",
  TELEVISION: "Television",
  NEWSPAPER: "Newspapers",
  PODCAST: "Podcast advertising",
  ADBOOSTERS: "AdBoosters",
  INFLUENCER: "Influencer Hub",
};

export function channelIcon(channelLabel: string): string {
  return CHANNEL_ICONS[channelLabel] || "▣";
}

export function campaignStatusLabel(status: CampaignViewStatus): string {
  switch (status) {
    case "ACTIVE":
      return "● Active";
    case "IN_REVIEW":
      return "In review";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Draft";
  }
}

export function campaignStatusClass(status: CampaignViewStatus): string {
  switch (status) {
    case "ACTIVE":
      return "badge-success badge-soft text-[var(--portal-success-strong)]";
    case "IN_REVIEW":
      return "badge-warning badge-soft text-[var(--portal-gold-ink)]";
    case "COMPLETED":
      return "badge-info badge-soft";
    case "CANCELLED":
      return "badge-error badge-soft";
    default:
      return "badge-neutral badge-soft text-[var(--portal-muted)]";
  }
}
