import React from "react";
import { requireUser } from "@/lib/auth";
import { getBoosterEngagementRequests } from "@/server/data/booster-engagement";
import BoosterRequestsClient from "./BoosterRequestsClient";

export const dynamic = "force-dynamic";

export default async function BoosterRequestsPage() {
  const session = await requireUser();
  const requests = await getBoosterEngagementRequests(session.id);
  return <BoosterRequestsClient requests={requests} />;
}
