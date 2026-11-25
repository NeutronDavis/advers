import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CHANNEL_SPECS,
  type ChannelSpecField,
} from "@/lib/channel-specs";
import type { ChannelTypeValue } from "@/lib/channels";

function parseOptions(value: string | null): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : undefined;
  } catch {
    return undefined;
  }
}

function rowToField(row: {
  fieldKey: string;
  label: string;
  inputType: string;
  required: boolean;
  optionsJson: string | null;
  mediaKind: string | null;
  accept: string | null;
  maxBytes: number | null;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  minDurationSec: number | null;
  maxDurationSec: number | null;
  helpText: string | null;
  groupName: string;
  sortOrder: number;
}): ChannelSpecField {
  return {
    key: row.fieldKey,
    label: row.label,
    inputType: row.inputType as ChannelSpecField["inputType"],
    required: row.required,
    options: parseOptions(row.optionsJson),
    mediaKind: row.mediaKind as ChannelSpecField["mediaKind"],
    accept: row.accept ?? undefined,
    maxBytes: row.maxBytes ?? undefined,
    minWidth: row.minWidth ?? undefined,
    maxWidth: row.maxWidth ?? undefined,
    minHeight: row.minHeight ?? undefined,
    maxHeight: row.maxHeight ?? undefined,
    minDurationSec: row.minDurationSec ?? undefined,
    maxDurationSec: row.maxDurationSec ?? undefined,
    help: row.helpText ?? undefined,
    groupName: row.groupName,
    sortOrder: row.sortOrder,
  };
}

export async function getChannelSpecs(): Promise<
  Record<string, ChannelSpecField[]>
> {
  const rows = await prisma.channelSpec.findMany({
    where: { active: true },
    orderBy: [{ channel: "asc" }, { sortOrder: "asc" }],
  });

  const result: Record<string, ChannelSpecField[]> = {};
  for (const row of rows) {
    const key = row.channel as string;
    if (!result[key]) result[key] = [];
    result[key].push(rowToField(row));
  }

  // Fall back to code defaults for any channel not yet configured in the DB.
  for (const [channel, fields] of Object.entries(DEFAULT_CHANNEL_SPECS)) {
    if (!result[channel]?.length) {
      result[channel] = fields;
    }
  }

  return result;
}

export async function getChannelSpecFields(
  channel: string
): Promise<ChannelSpecField[]> {
  const specs = await getChannelSpecs();
  return specs[channel] ?? DEFAULT_CHANNEL_SPECS[channel as ChannelTypeValue] ?? [];
}
