import React from "react";
import { requireUser } from "@/lib/auth";
import {
  getBoosterProfileForUser,
  getUnreadNotificationCount,
} from "@/server/data/booster";
import BoosterShell from "./BoosterShell";

export const dynamic = "force-dynamic";

export default async function BoosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [profile, unreadNotifications] = await Promise.all([
    getBoosterProfileForUser(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <BoosterShell
      user={user}
      hasProfile={Boolean(profile)}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </BoosterShell>
  );
}
