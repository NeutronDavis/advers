import React from "react";
import { requireUser } from "@/lib/auth";
import { getBoosterProfileForUser } from "@/server/data/booster";
import BoosterProfileForm from "./BoosterProfileForm";

export const dynamic = "force-dynamic";

export default async function BoosterProfileEditPage() {
  const user = await requireUser();
  const profile = await getBoosterProfileForUser(user.id);

  return <BoosterProfileForm userName={user.name} profile={profile} />;
}
