import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNotificationPreferences } from "@/lib/notifications";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function ClientSettingsPage() {
  const session = await requireUser();

  const [user, notificationPreferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: { client: true },
    }),
    getNotificationPreferences(session.id),
  ]);

  return (
    <SettingsClient
      initial={{
        name: user?.name || session.name,
        email: user?.email || session.email,
        phone: user?.phone || "",
        company: user?.client?.name || "",
      }}
      isOwner={session.orgRole === "OWNER" || session.role === "ADMIN"}
      notificationPreferences={notificationPreferences}
    />
  );
}
