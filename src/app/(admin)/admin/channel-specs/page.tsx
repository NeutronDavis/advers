import React from "react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChannelSpecsClient from "./ChannelSpecsClient";

export const dynamic = "force-dynamic";

export default async function ChannelSpecsPage() {
  await requireStaff();
  const specs = await prisma.channelSpec.findMany({
    orderBy: [{ channel: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <ChannelSpecsClient
      specs={specs.map((spec) => ({
        id: spec.id,
        channel: spec.channel,
        fieldKey: spec.fieldKey,
        label: spec.label,
        inputType: spec.inputType,
        required: spec.required,
        active: spec.active,
        maxBytes: spec.maxBytes,
        minWidth: spec.minWidth,
        maxWidth: spec.maxWidth,
        minHeight: spec.minHeight,
        maxHeight: spec.maxHeight,
        minDurationSec: spec.minDurationSec,
        maxDurationSec: spec.maxDurationSec,
      }))}
    />
  );
}
