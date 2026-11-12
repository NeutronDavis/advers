import { prisma } from "@/lib/prisma";

export interface InfluencerAudience {
  ageRange?: string;
  gender?: string;
  locations?: string[];
}

export interface InfluencerProfileView {
  id: string;
  displayName: string;
  handle: string;
  niche: string;
  platform: string;
  followers: number;
  engagementRate: number | null;
  rateCard: number | null;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  status: string;
  audience: InfluencerAudience | null;
  createdAt: string;
}

function parseAudience(value: string | null): InfluencerAudience | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ageRange: typeof parsed.ageRange === "string" ? parsed.ageRange : undefined,
      gender: typeof parsed.gender === "string" ? parsed.gender : undefined,
      locations: Array.isArray(parsed.locations)
        ? parsed.locations.filter((item: unknown): item is string => typeof item === "string")
        : undefined,
    };
  } catch {
    return null;
  }
}

function mapInfluencer(profile: {
  id: string;
  displayName: string;
  handle: string;
  niche: string;
  platform: string;
  followers: number;
  engagementRate: number | null;
  rateCard: number | null;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  status: string;
  audienceJson: string | null;
  createdAt: Date;
}): InfluencerProfileView {
  return {
    id: profile.id,
    displayName: profile.displayName,
    handle: profile.handle,
    niche: profile.niche,
    platform: profile.platform,
    followers: profile.followers,
    engagementRate: profile.engagementRate,
    rateCard: profile.rateCard,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    verified: profile.verified,
    status: profile.status,
    audience: parseAudience(profile.audienceJson),
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function getInfluencerProfiles(): Promise<InfluencerProfileView[]> {
  const profiles = await prisma.influencerProfile.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ verified: "desc" }, { followers: "desc" }],
    take: 100,
  });
  return profiles.map(mapInfluencer);
}

export async function getInfluencerProfile(
  id: string
): Promise<InfluencerProfileView | null> {
  const profile = await prisma.influencerProfile.findUnique({ where: { id } });
  return profile ? mapInfluencer(profile) : null;
}

export async function getInfluencerRequestsForClient(clientId: string) {
  const requests = await prisma.influencerRequest.findMany({
    where: { clientId },
    include: {
      influencer: { select: { displayName: true, handle: true } },
      campaign: { select: { name: true, campaignNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return requests.map((request) => ({
    id: request.id,
    influencerName: request.influencer.displayName,
    influencerHandle: request.influencer.handle,
    campaignName: request.campaign?.name || null,
    campaignNumber: request.campaign?.campaignNumber || null,
    brief: request.brief,
    budget: request.budget,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  }));
}
