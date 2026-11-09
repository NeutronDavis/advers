import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHANNEL_LABELS } from "@/lib/types/campaign";
import ExploreClient, { type ExploreInventoryItem } from "./ExploreClient";

export const dynamic = "force-dynamic";

export default async function ExploreAdvertisingPage() {
  await requireUser();

  const items = await prisma.mediaInventory.findMany({
    where: { status: "OPERATIONAL" },
    orderBy: [{ channel: "asc" }, { city: "asc" }],
  });

  const inventory: ExploreInventoryItem[] = items.map((item) => ({
    id: item.id,
    inventoryCode: item.inventoryCode,
    name: item.name,
    channel: CHANNEL_LABELS[item.channel] || item.channel,
    city: item.city,
    state: item.state,
    locationDetails: item.locationDetails,
    screenSpecs: item.screenSpecs,
    loopCapacity: item.loopCapacity,
    availableSlots: item.availableSlots,
    ratePerUnit: item.ratePerUnit,
    unitType: item.unitType,
    vendorName: item.vendorName,
  }));

  return <ExploreClient inventory={inventory} />;
}
