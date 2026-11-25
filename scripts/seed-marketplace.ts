/**
 * Seeds Phase 3 marketplace demo data.
 *
 * Usage: npm run seed:marketplace
 *
 * Idempotent: handles are backfilled, and likes/recommendations/reviews use
 * unique constraints. Comments are de-duplicated by body.
 */
import { prisma } from "../src/lib/prisma";
import { slugifyHandle } from "../src/lib/marketplace";
import { parseJsonArray, parseStringArray } from "../src/server/data/booster";

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main(): Promise<void> {
  const profiles = await prisma.boosterProfile.findMany({
    orderBy: { createdAt: "asc" },
  });
  const users = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "asc" },
    take: 6,
  });
  if (users.length < 2) {
    throw new Error("Need at least two client users to seed marketplace social data.");
  }

  const usedHandles = new Set(
    profiles.map((profile) => profile.handle).filter((handle): handle is string => Boolean(handle))
  );

  for (const [index, profile] of profiles.entries()) {
    let handle = profile.handle;
    if (!handle) {
      const base = slugifyHandle(profile.displayName);
      handle = base;
      let suffix = 2;
      while (usedHandles.has(handle)) {
        handle = `${base}-${suffix}`;
        suffix += 1;
      }
      usedHandles.add(handle);
    }

    const coverage = parseStringArray(profile.coverageJson);
    const rates = parseJsonArray<{ label: string; amount: string }>(profile.ratesJson);
    const startingPrice =
      profile.startingPrice ?? parsePrice(rates[0]?.amount) ?? 50_000 + index * 10_000;

    await prisma.boosterProfile.update({
      where: { id: profile.id },
      data: {
        handle,
        location: profile.location ?? coverage[0] ?? "Lagos, Nigeria",
        coverUrl: profile.coverUrl ?? `https://picsum.photos/seed/${handle}/1200/400`,
        responseTimeHours: profile.responseTimeHours ?? 4 + (index % 5) * 4,
        startingPrice,
        availabilityStatus:
          profile.availabilityStatus === "UNAVAILABLE"
            ? "AVAILABLE"
            : index % 4 === 0
              ? "BUSY"
              : "AVAILABLE",
      },
    });

    const candidates = users.filter((user) => user.id !== profile.userId);
    const likers = candidates.slice(0, 2 + (index % 2));
    for (const user of likers) {
      await prisma.boosterLike.upsert({
        where: { boosterId_userId: { boosterId: profile.id, userId: user.id } },
        update: {},
        create: { boosterId: profile.id, userId: user.id },
      });
    }

    const recommender = candidates[0];
    if (recommender) {
      await prisma.boosterRecommendation.upsert({
        where: {
          boosterId_userId: { boosterId: profile.id, userId: recommender.id },
        },
        update: {
          note: "Reliable delivery and clear communication on our last campaign.",
        },
        create: {
          boosterId: profile.id,
          userId: recommender.id,
          note: "Reliable delivery and clear communication on our last campaign.",
        },
      });
    }

    const commentBodies = [
      "Do you handle urgent campaign requests?",
      "Your portfolio looks strong — what is your typical turnaround?",
      "Can you work with a national radio and billboard mix?",
    ];
    for (const [commentIndex, user] of candidates.slice(0, 2).entries()) {
      const body = commentBodies[(index + commentIndex) % commentBodies.length];
      const existing = await prisma.boosterComment.findFirst({
        where: { boosterId: profile.id, userId: user.id, body },
      });
      if (!existing) {
        await prisma.boosterComment.create({
          data: {
            boosterId: profile.id,
            userId: user.id,
            body,
            moderationState: "APPROVED",
          },
        });
      }
    }

    const completedJob = await prisma.boosterJob.findFirst({
      where: {
        assignedBoosterId: profile.id,
        status: { in: ["APPROVED", "PAID", "CLOSED"] },
        clientId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });
    const reviewer = completedJob
      ? users.find((user) => user.clientId === completedJob.clientId)
      : undefined;
    if (reviewer && completedJob) {
      await prisma.boosterReview.upsert({
        where: {
          boosterId_reviewerId: { boosterId: profile.id, reviewerId: reviewer.id },
        },
        update: {
          jobId: completedJob.id,
          score: 5 - (index % 2),
          body: "Delivered on time and kept us updated through the campaign.",
          verified: true,
          moderationState: "APPROVED",
        },
        create: {
          boosterId: profile.id,
          reviewerId: reviewer.id,
          jobId: completedJob.id,
          score: 5 - (index % 2),
          body: "Delivered on time and kept us updated through the campaign.",
          verified: true,
          moderationState: "APPROVED",
        },
      });
    }

    const [reviews, ratings] = await Promise.all([
      prisma.boosterReview.findMany({
        where: { boosterId: profile.id, moderationState: "APPROVED" },
        select: { score: true },
      }),
      prisma.rating.findMany({
        where: { ratedBoosterId: profile.id, moderationState: "APPROVED" },
        select: { score: true },
      }),
    ]);
    const scores = [...reviews.map((r) => r.score), ...ratings.map((r) => r.score)];
    await prisma.boosterProfile.update({
      where: { id: profile.id },
      data: {
        ratingAvg:
          scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            : 0,
        ratingCount: scores.length,
      },
    });
  }

  console.log(`Marketplace seed complete for ${profiles.length} Booster profiles.`);
}

main()
  .catch((error) => {
    console.error("Marketplace seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
