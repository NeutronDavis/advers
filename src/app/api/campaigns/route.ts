import { NextResponse } from "next/server";
import { CampaignStatus, ChannelType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const channelMap: Record<string, ChannelType> = {
  "Digital billboards": ChannelType.DIGITAL_BILLBOARD,
  "Static billboards": ChannelType.STATIC_BILLBOARD,
  "FM radio": ChannelType.FM_RADIO,
  Television: ChannelType.TELEVISION,
  Newspapers: ChannelType.NEWSPAPER,
  "Podcast advertising": ChannelType.PODCAST,
  AdBoosters: ChannelType.ADBOOSTERS,
  "Influencer marketplace": ChannelType.INFLUENCER,
};

function resolveChannel(value: string): ChannelType {
  if (value?.startsWith("Influencer:")) return ChannelType.INFLUENCER;
  return channelMap[value] || ChannelType.DIGITAL_BILLBOARD;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      where: session.clientId
        ? { OR: [{ userId: session.id }, { clientId: session.clientId }] }
        : { userId: session.id },
      include: { inventory: true, proofs: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch campaigns";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, channel, location, budget, duration, goal } = body;

    if (!name || !channel || !location || !budget) {
      return NextResponse.json(
        { success: false, error: "Name, channel, location and budget are required." },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        campaignNumber: `CAMP-${Date.now().toString().slice(-8)}`,
        name,
        channel: resolveChannel(channel),
        status: CampaignStatus.PENDING_REVIEW,
        objective: goal || "Brand awareness",
        targetLocation: location,
        budget: Number(budget),
        duration: duration || "1 week",
        userId: session.id,
        clientId: session.clientId,
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create campaign";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
