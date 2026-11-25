import React from "react";
import { requireUser } from "@/lib/auth";
import { getWalletOverview } from "@/server/data/wallet";
import WalletClient from "./WalletClient";

export const dynamic = "force-dynamic";

export default async function WalletAndBillingPage() {
  const session = await requireUser();
  const overview = await getWalletOverview(session.id);
  return <WalletClient overview={overview} />;
}
