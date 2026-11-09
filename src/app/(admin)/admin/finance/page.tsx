import React from "react";
import { requireStaff } from "@/lib/auth";
import { getAdminFinanceData } from "@/server/data/finance";
import AdminFinanceClient from "./AdminFinanceClient";

export const dynamic = "force-dynamic";

export default async function AdminFinanceAndSettlementsPage() {
  await requireStaff();
  const data = await getAdminFinanceData();
  return <AdminFinanceClient data={data} />;
}
