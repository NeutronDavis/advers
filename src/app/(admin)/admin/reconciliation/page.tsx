import React from "react";
import { requireStaff } from "@/lib/auth";
import { getReconciliationData } from "@/server/data/reconciliation";
import ReconciliationClient from "./ReconciliationClient";

export const dynamic = "force-dynamic";

export default async function ReconciliationPage() {
  await requireStaff();
  const data = await getReconciliationData();
  return <ReconciliationClient data={data} />;
}
