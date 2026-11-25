"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type ActionResult = { success: true } | { success: false; error: string };

const SpecSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(120),
  required: z.boolean(),
  active: z.boolean(),
  maxBytes: z.number().int().min(0).nullable().optional(),
  minWidth: z.number().int().min(0).nullable().optional(),
  maxWidth: z.number().int().min(0).nullable().optional(),
  minHeight: z.number().int().min(0).nullable().optional(),
  maxHeight: z.number().int().min(0).nullable().optional(),
  minDurationSec: z.number().int().min(0).nullable().optional(),
  maxDurationSec: z.number().int().min(0).nullable().optional(),
});

export async function updateChannelSpecAction(
  input: z.input<typeof SpecSchema>
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return { success: false, error: "Staff access required." };
  }

  const parsed = SpecSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.channelSpec.update({
    where: { id: parsed.data.id },
    data: {
      label: parsed.data.label,
      required: parsed.data.required,
      active: parsed.data.active,
      maxBytes: parsed.data.maxBytes ?? null,
      minWidth: parsed.data.minWidth ?? null,
      maxWidth: parsed.data.maxWidth ?? null,
      minHeight: parsed.data.minHeight ?? null,
      maxHeight: parsed.data.maxHeight ?? null,
      minDurationSec: parsed.data.minDurationSec ?? null,
      maxDurationSec: parsed.data.maxDurationSec ?? null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "CHANNEL_SPEC_UPDATED",
      description: `${session.name} updated a channel specification.`,
      metadata: JSON.stringify({ specId: parsed.data.id }),
    },
  });

  revalidatePath("/admin/channel-specs");
  revalidatePath("/portal", "layout");
  return { success: true };
}
