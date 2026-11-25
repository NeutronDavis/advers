export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

export interface MediaAssetDTO {
  id: string;
  url: string;
  kind: MediaKind;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
}

export const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

const MIME_KIND: Record<string, MediaKind> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "video/quicktime": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/mp4": "AUDIO",
  "audio/wav": "AUDIO",
  "audio/x-wav": "AUDIO",
  "audio/ogg": "AUDIO",
  "application/pdf": "DOCUMENT",
};

export function mediaKindFromMime(mime: string): MediaKind | null {
  return MIME_KIND[mime.toLowerCase()] ?? null;
}

export function isAllowedMediaMime(mime: string): boolean {
  return mediaKindFromMime(mime) !== null;
}

export function sanitizeFileName(name: string): string {
  const base = name
    .split(/[\\/]/)
    .pop()
    ?.replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "upload";
}
