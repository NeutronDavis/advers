import { prisma } from "@/lib/prisma";

export interface AdversPostView {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  sponsorName: string;
  sponsorLogoUrl: string | null;
  category: string | null;
  placement: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

function mapPost(post: {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  sponsorName: string;
  sponsorLogoUrl: string | null;
  category: string | null;
  placement: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
}): AdversPostView {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    ctaLabel: post.ctaLabel,
    ctaUrl: post.ctaUrl,
    sponsorName: post.sponsorName,
    sponsorLogoUrl: post.sponsorLogoUrl,
    category: post.category,
    placement: post.placement,
    status: post.status,
    startsAt: post.startsAt ? post.startsAt.toISOString() : null,
    endsAt: post.endsAt ? post.endsAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
  };
}

export async function getPublishedAdversPosts(
  placement = "DASHBOARD",
  limit = 6
): Promise<AdversPostView[]> {
  const now = new Date();
  const posts = await prisma.adversPost.findMany({
    where: {
      status: "PUBLISHED",
      placement,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return posts.map(mapPost);
}

export async function getAdminAdversPosts(): Promise<AdversPostView[]> {
  const posts = await prisma.adversPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return posts.map(mapPost);
}
