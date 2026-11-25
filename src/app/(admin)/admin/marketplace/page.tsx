import React from "react";
import { requireStaff } from "@/lib/auth";
import { getAdminMarketplaceData } from "@/server/data/marketplace-admin";
import MarketplaceModerationClient from "./MarketplaceModerationClient";

export const dynamic = "force-dynamic";

export default async function MarketplaceModerationPage() {
  await requireStaff();
  const data = await getAdminMarketplaceData();
  return <MarketplaceModerationClient data={data} />;
}
