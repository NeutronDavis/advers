"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type NotificationPreferenceResult =
  | { success: true }
  | { success: false; error: string };

const PreferencesSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
  sms: z.boolean(),
  whatsapp: z.boolean(),
});

export async function updateNotificationPreferencesAction(
  input: z.input<typeof PreferencesSchema>
): Promise<NotificationPreferenceResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const parsed = PreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.notificationPreference.upsert({
    where: { userId: session.id },
    update: parsed.data,
    create: {
      userId: session.id,
      ...parsed.data,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "NOTIFICATION_PREFERENCES_UPDATED",
      description: `${session.name} updated notification channel preferences.`,
    },
  });

  revalidatePath("/portal/settings");
  revalidatePath("/booster/notifications");
  return { success: true };
}
