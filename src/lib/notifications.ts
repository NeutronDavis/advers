import { prisma } from "@/lib/prisma";

export interface NotificationInput {
  userId: string;
  event: string;
  title: string;
  body: string;
  link?: string | null;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  sms: false,
  whatsapp: false,
};

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });
  if (!preferences) return DEFAULT_NOTIFICATION_PREFERENCES;

  return {
    inApp: preferences.inApp,
    email: preferences.email,
    sms: preferences.sms,
    whatsapp: preferences.whatsapp,
  };
}

/**
 * In-app notifications are always the source of truth. Email, SMS and WhatsApp
 * are simulated as additional channel records until provider adapters are
 * connected; they are marked read so they do not inflate the in-app unread count.
 */
export async function dispatchNotification(
  input: NotificationInput
): Promise<void> {
  const preferences = await getNotificationPreferences(input.userId);
  const channels: Array<"IN_APP" | "EMAIL" | "SMS" | "WHATSAPP"> = [];

  if (preferences.inApp) channels.push("IN_APP");
  if (preferences.email) channels.push("EMAIL");
  if (preferences.sms) channels.push("SMS");
  if (preferences.whatsapp) channels.push("WHATSAPP");
  if (channels.length === 0) channels.push("IN_APP");

  await prisma.notification.createMany({
    data: channels.map((channel) => ({
      userId: input.userId,
      event: input.event,
      title: input.title,
      body: input.body,
      link: input.link || null,
      channel,
      readAt: channel === "IN_APP" ? null : new Date(),
    })),
  });
}
