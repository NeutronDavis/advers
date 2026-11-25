import type { ChannelSpecField } from "./channel-specs";

export type ChannelConfig = Record<string, string>;

export interface ChannelAssetMeta {
  id: string;
  kind: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
}

export interface ChannelValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function parseAccept(accept: string | undefined): string[] {
  return (accept ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function validateChannelSubmission(input: {
  fields: ChannelSpecField[];
  config: ChannelConfig;
  assets: Record<string, ChannelAssetMeta>;
  requireRequired?: boolean;
}): ChannelValidationResult {
  const errors: Record<string, string> = {};
  const requireRequired = input.requireRequired ?? true;

  for (const field of input.fields) {
    const value = input.config[field.key]?.trim() ?? "";

    if (!value) {
      if (field.required && requireRequired) {
        errors[field.key] = `${field.label} is required.`;
      }
      continue;
    }

    if (field.inputType === "FILE") {
      const asset = input.assets[field.key] ?? input.assets[value];
      if (!asset) {
        errors[field.key] = `Upload a file for ${field.label}.`;
        continue;
      }
      if (field.mediaKind && asset.kind !== field.mediaKind) {
        errors[field.key] = `${field.label} must be a ${field.mediaKind.toLowerCase()} file.`;
        continue;
      }
      const accept = parseAccept(field.accept);
      if (accept.length > 0 && !accept.includes(asset.mime.toLowerCase())) {
        errors[field.key] = `${field.label} uses an unsupported file type.`;
        continue;
      }
      if (field.maxBytes && asset.bytes > field.maxBytes) {
        errors[field.key] = `${field.label} exceeds the ${Math.round(
          field.maxBytes / 1024 / 1024
        )} MB limit.`;
        continue;
      }
      if (field.minWidth && (!asset.width || asset.width < field.minWidth)) {
        errors[field.key] = `${field.label} must be at least ${field.minWidth}px wide.`;
        continue;
      }
      if (field.maxWidth && asset.width && asset.width > field.maxWidth) {
        errors[field.key] = `${field.label} must be at most ${field.maxWidth}px wide.`;
        continue;
      }
      if (field.minHeight && (!asset.height || asset.height < field.minHeight)) {
        errors[field.key] = `${field.label} must be at least ${field.minHeight}px tall.`;
        continue;
      }
      if (field.maxHeight && asset.height && asset.height > field.maxHeight) {
        errors[field.key] = `${field.label} must be at most ${field.maxHeight}px tall.`;
        continue;
      }
      if (
        field.minDurationSec &&
        (asset.durationSec === null || asset.durationSec < field.minDurationSec)
      ) {
        errors[field.key] = `${field.label} must be at least ${field.minDurationSec}s.`;
        continue;
      }
      if (
        field.maxDurationSec &&
        asset.durationSec !== null &&
        asset.durationSec > field.maxDurationSec
      ) {
        errors[field.key] = `${field.label} must be at most ${field.maxDurationSec}s.`;
        continue;
      }
      continue;
    }

    if (field.inputType === "SELECT" && field.options && !field.options.includes(value)) {
      errors[field.key] = `Choose a valid option for ${field.label}.`;
      continue;
    }

    if (field.inputType === "NUMBER" && !Number.isFinite(Number(value))) {
      errors[field.key] = `${field.label} must be a number.`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function parseChannelConfig(value: string | null | undefined): ChannelConfig {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([key, item]) => [key, item])
    );
  } catch {
    return {};
  }
}
