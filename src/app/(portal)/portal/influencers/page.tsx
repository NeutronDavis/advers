import React from "react";
import { requireUser } from "@/lib/auth";
import {
  getInfluencerProfiles,
  getInfluencerRequestsForClient,
} from "@/server/data/influencers";
import InfluencerHubClient from "./InfluencerHubClient";

export const dynamic = "force-dynamic";

export default async function InfluencerHubPage() {
  const user = await requireUser();
  const [profiles, requests] = await Promise.all([
    getInfluencerProfiles(),
    user.clientId ? getInfluencerRequestsForClient(user.clientId) : Promise.resolve([]),
  ]);

  return <InfluencerHubClient profiles={profiles} requests={requests} />;
}
