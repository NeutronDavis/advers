import type { ChannelTypeValue } from "@/lib/channels";

export type ChannelFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "SELECT"
  | "DATE"
  | "FILE";

export interface ChannelSpecField {
  key: string;
  label: string;
  inputType: ChannelFieldType;
  required: boolean;
  options?: string[];
  mediaKind?: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  accept?: string;
  maxBytes?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minDurationSec?: number;
  maxDurationSec?: number;
  help?: string;
  groupName: string;
  sortOrder: number;
}

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const AUDIO_ACCEPT = "audio/mpeg,audio/mp4,audio/wav,audio/ogg";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

function field(
  key: string,
  label: string,
  inputType: ChannelFieldType,
  required: boolean,
  extra: Partial<ChannelSpecField> = {}
): ChannelSpecField {
  return {
    key,
    label,
    inputType,
    required,
    groupName: "Channel requirements",
    sortOrder: 0,
    ...extra,
  };
}

export const DEFAULT_CHANNEL_SPECS: Record<ChannelTypeValue, ChannelSpecField[]> = {
  DIGITAL_BILLBOARD: [
    field("media_file", "Screen creative (video or image)", "FILE", true, {
      mediaKind: "VIDEO",
      accept: `${VIDEO_ACCEPT},${IMAGE_ACCEPT}`,
      maxBytes: 100 * 1024 * 1024,
      maxDurationSec: 30,
      help: "MP4/WebM video or a high-resolution still. Most screens loop 10–30s spots.",
      sortOrder: 1,
    }),
    field("duration_seconds", "Spot duration (seconds)", "NUMBER", true, {
      help: "Most DOOH screens accept 10, 15 or 30 second spots.",
      sortOrder: 2,
    }),
    field("resolution", "Required resolution", "TEXT", true, {
      help: "Example: 1920x1080 landscape or 1080x1920 portrait.",
      sortOrder: 3,
    }),
    field("screen_location", "Screen / location", "TEXT", true, {
      help: "The billboard operator will confirm the exact screen.",
      sortOrder: 4,
    }),
    field("playback_frequency", "Playback frequency", "TEXT", false, {
      help: "Example: 12 plays per hour.",
      sortOrder: 5,
    }),
  ],
  STATIC_BILLBOARD: [
    field("artwork", "Artwork / poster", "FILE", true, {
      mediaKind: "IMAGE",
      accept: IMAGE_ACCEPT,
      maxBytes: 40 * 1024 * 1024,
      minWidth: 1000,
      help: "High-resolution print-ready artwork.",
      sortOrder: 1,
    }),
    field("dimensions", "Artwork dimensions", "TEXT", true, {
      help: "Example: 6m x 3m or 48-sheet.",
      sortOrder: 2,
    }),
    field("billboard_location", "Billboard location", "TEXT", true, {
      sortOrder: 3,
    }),
    field("display_period", "Display period", "TEXT", true, {
      help: "Example: 4 weeks.",
      sortOrder: 4,
    }),
    field("installation_date", "Installation date", "DATE", false, {
      sortOrder: 5,
    }),
  ],
  FM_RADIO: [
    field("audio_file", "Audio spot", "FILE", true, {
      mediaKind: "AUDIO",
      accept: AUDIO_ACCEPT,
      maxBytes: 30 * 1024 * 1024,
      minDurationSec: 5,
      maxDurationSec: 90,
      sortOrder: 1,
    }),
    field("script", "Written script", "TEXTAREA", true, { sortOrder: 2 }),
    field("voice_over", "Voice-over / talent", "TEXT", false, { sortOrder: 3 }),
    field("spot_duration", "Spot duration", "SELECT", true, {
      options: ["15 seconds", "30 seconds", "45 seconds", "60 seconds"],
      sortOrder: 4,
    }),
    field("station", "Station", "TEXT", true, { sortOrder: 5 }),
    field("broadcast_schedule", "Broadcast schedule", "TEXT", true, {
      help: "Example: morning and evening drive, Mon–Fri.",
      sortOrder: 6,
    }),
  ],
  TELEVISION: [
    field("video_file", "TV commercial", "FILE", true, {
      mediaKind: "VIDEO",
      accept: VIDEO_ACCEPT,
      maxBytes: 200 * 1024 * 1024,
      maxDurationSec: 120,
      sortOrder: 1,
    }),
    field("script", "Script / storyboard", "TEXTAREA", false, { sortOrder: 2 }),
    field("voice_over", "Voice-over / talent", "TEXT", false, { sortOrder: 3 }),
    field("duration_seconds", "Duration (seconds)", "NUMBER", true, {
      sortOrder: 4,
    }),
    field("resolution", "Resolution / format", "TEXT", true, {
      help: "Example: 1920x1080, 25fps, H.264.",
      sortOrder: 5,
    }),
    field("station", "Station", "TEXT", true, { sortOrder: 6 }),
    field("broadcast_schedule", "Broadcast schedule", "TEXT", true, {
      sortOrder: 7,
    }),
  ],
  NEWSPAPER: [
    field("headline", "Headline", "TEXT", true, { sortOrder: 1 }),
    field("copy", "Advertisement copy", "TEXTAREA", true, { sortOrder: 2 }),
    field("artwork", "Artwork / image", "FILE", false, {
      mediaKind: "IMAGE",
      accept: IMAGE_ACCEPT,
      maxBytes: 40 * 1024 * 1024,
      sortOrder: 3,
    }),
    field("publication", "Publication", "TEXT", true, { sortOrder: 4 }),
    field("advert_size", "Advert size / placement", "SELECT", true, {
      options: ["Quarter page", "Half page", "Full page", "Front page strip"],
      sortOrder: 5,
    }),
    field("publication_date", "Publication date", "DATE", true, {
      sortOrder: 6,
    }),
  ],
  PODCAST: [
    field("audio_file", "Audio spot (optional)", "FILE", false, {
      mediaKind: "AUDIO",
      accept: AUDIO_ACCEPT,
      maxBytes: 30 * 1024 * 1024,
      maxDurationSec: 120,
      sortOrder: 1,
    }),
    field("host_read_script", "Host-read script", "TEXTAREA", true, {
      sortOrder: 2,
    }),
    field("show_placement", "Show / episode placement", "TEXT", true, {
      sortOrder: 3,
    }),
    field("spot_duration", "Spot duration", "SELECT", true, {
      options: ["15 seconds", "30 seconds", "60 seconds", "90 seconds"],
      sortOrder: 4,
    }),
    field("publication_schedule", "Publication schedule", "TEXT", true, {
      sortOrder: 5,
    }),
  ],
  ADBOOSTERS: [
    field("creative_file", "Share creative", "FILE", true, {
      mediaKind: "IMAGE",
      accept: IMAGE_ACCEPT,
      maxBytes: 20 * 1024 * 1024,
      sortOrder: 1,
    }),
    field("caption", "Share caption", "TEXT", true, { sortOrder: 2 }),
    field("target_platform", "Primary platform", "SELECT", true, {
      options: ["WhatsApp", "Telegram", "Instagram", "X", "Facebook"],
      sortOrder: 3,
    }),
    field("share_instructions", "Sharing instructions", "TEXTAREA", false, {
      sortOrder: 4,
    }),
  ],
  INFLUENCER: [
    field("brief", "Collaboration brief", "TEXTAREA", true, { sortOrder: 1 }),
    field("platform", "Primary platform", "SELECT", true, {
      options: ["Instagram", "TikTok", "YouTube", "X", "Facebook"],
      sortOrder: 2,
    }),
    field("deliverables", "Deliverables", "TEXT", true, {
      help: "Example: 2 reels + 3 stories.",
      sortOrder: 3,
    }),
    field("budget_range", "Budget range", "TEXT", false, { sortOrder: 4 }),
  ],
};
