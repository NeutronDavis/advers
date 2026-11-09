import React from "react";
import { requireStaff } from "@/lib/auth";
import { getAdminTrustData } from "@/server/data/finance";
import AdminTrustClient from "./AdminTrustClient";

export const dynamic = "force-dynamic";

export default async function AdminTrustPage() {
  await requireStaff();
  const data = await getAdminTrustData();
  return <AdminTrustClient data={data} />;
}
