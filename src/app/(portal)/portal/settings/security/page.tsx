import React from "react";
import { requireUser } from "@/lib/auth";
import { getTwoFactorState } from "@/server/security/two-factor";
import SecurityClient from "./SecurityClient";

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {
  const session = await requireUser();
  const state = await getTwoFactorState(session.id);
  return <SecurityClient initial={state} />;
}
