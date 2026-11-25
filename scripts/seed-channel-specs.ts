/**
 * Seeds configurable channel specifications from the code defaults.
 *
 * Usage: npm run seed:channel-specs
 * Safe to run repeatedly: rows are upserted by (channel, fieldKey).
 */
import { ChannelType } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { DEFAULT_CHANNEL_SPECS } from "../src/lib/channel-specs";

async function main(): Promise<void> {
  let count = 0;
  for (const [channelKey, fields] of Object.entries(DEFAULT_CHANNEL_SPECS)) {
    const channel = channelKey as ChannelType;
    for (const field of fields) {
      await prisma.channelSpec.upsert({
        where: { channel_fieldKey: { channel, fieldKey: field.key } },
        update: {
          label: field.label,
          inputType: field.inputType,
          required: field.required,
          optionsJson: field.options ? JSON.stringify(field.options) : null,
          mediaKind: field.mediaKind ?? null,
          accept: field.accept ?? null,
          maxBytes: field.maxBytes ?? null,
          minWidth: field.minWidth ?? null,
          maxWidth: field.maxWidth ?? null,
          minHeight: field.minHeight ?? null,
          maxHeight: field.maxHeight ?? null,
          minDurationSec: field.minDurationSec ?? null,
          maxDurationSec: field.maxDurationSec ?? null,
          helpText: field.help ?? null,
          groupName: field.groupName,
          sortOrder: field.sortOrder,
          active: true,
        },
        create: {
          channel,
          fieldKey: field.key,
          label: field.label,
          inputType: field.inputType,
          required: field.required,
          optionsJson: field.options ? JSON.stringify(field.options) : null,
          mediaKind: field.mediaKind ?? null,
          accept: field.accept ?? null,
          maxBytes: field.maxBytes ?? null,
          minWidth: field.minWidth ?? null,
          maxWidth: field.maxWidth ?? null,
          minHeight: field.minHeight ?? null,
          maxHeight: field.maxHeight ?? null,
          minDurationSec: field.minDurationSec ?? null,
          maxDurationSec: field.maxDurationSec ?? null,
          helpText: field.help ?? null,
          groupName: field.groupName,
          sortOrder: field.sortOrder,
        },
      });
      count += 1;
    }
  }
  console.log(`Seeded ${count} channel spec fields.`);
}

main()
  .catch((error) => {
    console.error("Channel spec seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
