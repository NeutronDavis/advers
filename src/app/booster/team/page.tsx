import React from "react";
import { requireUser } from "@/lib/auth";
import { getBoosterTeamsForUser } from "@/server/data/booster";
import BoosterTeamClient from "./BoosterTeamClient";

export const dynamic = "force-dynamic";

export default async function BoosterTeamPage() {
  const user = await requireUser();
  const teams = await getBoosterTeamsForUser(user.id);

  return <BoosterTeamClient teams={teams} />;
}
