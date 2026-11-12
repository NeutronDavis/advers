import React from "react";
import { requireUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/server/data/booster";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function PortalNotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsForUser(user.id, 50);

  return <NotificationsClient notifications={notifications} />;
}
