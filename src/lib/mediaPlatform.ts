import { prisma } from "@/lib/prisma";
import { ChannelType, CampaignStatus } from "@prisma/client";

export async function getCampaignsList(filters?: {
  userId?: string;
  channel?: ChannelType;
  status?: CampaignStatus;
  limit?: number;
}) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.channel && { channel: filters.channel }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        inventory: true,
        proofs: true,
        boosterLinks: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 50,
    });
    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns from database:", error);
    return [];
  }
}

export async function getMediaInventoryList(channel?: ChannelType) {
  try {
    const inventory = await prisma.mediaInventory.findMany({
      where: {
        ...(channel && { channel }),
        status: "OPERATIONAL",
      },
      orderBy: { createdAt: "desc" },
    });
    return inventory;
  } catch (error) {
    console.error("Error fetching inventory from database:", error);
    return [];
  }
}

export async function getAdBoostersList() {
  try {
    const boosters = await prisma.adBooster.findMany({
      where: { status: "ACTIVE" },
      include: {
        links: true,
      },
      orderBy: { audienceReach: "desc" },
    });
    return boosters;
  } catch (error) {
    console.error("Error fetching AdBoosters from database:", error);
    return [];
  }
}

export async function getWalletDetails(userId: string) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    return wallet;
  } catch (error) {
    console.error("Error fetching wallet from database:", error);
    return null;
  }
}

