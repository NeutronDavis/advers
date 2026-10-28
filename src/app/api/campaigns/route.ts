import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChannelType, CampaignStatus } from "@prisma/client";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        inventory: true,
        proofs: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, channel, location, budget, duration, goal } = body;

    // Find default client user to link campaign
    let user = await prisma.user.findFirst({
      where: { role: "CLIENT" },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No user account found to associate campaign" },
        { status: 400 }
      );
    }

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

    const campaign = await prisma.campaign.create({
      data: {
        campaignNumber: `CAMP-${Date.now().toString().slice(-6)}`,
        name,
        channel: channelMap[channel] || ChannelType.DIGITAL_BILLBOARD,
        status: CampaignStatus.PENDING_REVIEW,
        objective: goal || "Brand awareness",
        targetLocation: location,
        budget: Number(budget),
        duration: duration || "1 week",
        userId: user.id,
        clientId: user.clientId,
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}

