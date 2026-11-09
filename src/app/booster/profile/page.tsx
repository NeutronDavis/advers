import React from "react";
import { requireUser } from "@/lib/auth";
import { getBoosterProfileForUser } from "@/server/data/booster";
import BoosterProfileClient from "./BoosterProfileClient";

export const dynamic = "force-dynamic";

export default async function BoosterProfilePage() {
  const user = await requireUser();
  const profile = await getBoosterProfileForUser(user.id);

  return <BoosterProfileClient userName={user.name} profile={profile} />;
}
