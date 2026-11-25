/**
 * Backfills structured services and portfolio items from the legacy JSON fields.
 *
 * Usage: npm run backfill:marketplace-structured
 */
import { prisma } from "../src/lib/prisma";
import { parsePriceToInt } from "../src/lib/marketplace-structured";

interface LegacyRate {
  label?: string;
  amount?: string;
}

interface LegacyPortfolio {
  title?: string;
  url?: string;
  description?: string;
}

function parseArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const profiles = await prisma.boosterProfile.findMany({
    include: {
      services: { select: { id: true } },
      portfolioItems: { select: { id: true } },
    },
  });

  let servicesCreated = 0;
  let portfolioCreated = 0;

  for (const profile of profiles) {
    if (profile.services.length === 0) {
      const rates = parseArray<LegacyRate>(profile.ratesJson);
      const rows = rates
        .filter((rate) => rate.label)
        .map((rate, index) => {
          const price = parsePriceToInt(rate.amount);
          return {
            boosterId: profile.id,
            title: rate.label!.trim(),
            description: null,
            priceMin: price,
            priceMax: price,
            currency: "NGN",
            deliveryDays: null,
            sortOrder: index,
          };
        });

      if (rows.length === 0 && profile.startingPrice) {
        rows.push({
          boosterId: profile.id,
          title: "Custom project",
          description: null,
          priceMin: profile.startingPrice,
          priceMax: profile.startingPrice,
          currency: "NGN",
          deliveryDays: null,
          sortOrder: 0,
        });
      }

      if (rows.length > 0) {
        await prisma.boosterService.createMany({ data: rows });
        servicesCreated += rows.length;
        if (!profile.startingPrice) {
          await prisma.boosterProfile.update({
            where: { id: profile.id },
            data: { startingPrice: rows[0].priceMin },
          });
        }
      }
    }

    if (profile.portfolioItems.length === 0) {
      const items = parseArray<LegacyPortfolio>(profile.portfolioJson)
        .filter((item) => item.title && item.url)
        .map((item, index) => ({
          boosterId: profile.id,
          title: item.title!.trim(),
          description: item.description?.trim() || null,
          externalUrl: item.url!.trim(),
          sortOrder: index,
        }));

      if (items.length > 0) {
        await prisma.portfolioItem.createMany({ data: items });
        portfolioCreated += items.length;
      }
    }
  }

  console.log("Marketplace structured backfill complete.");
  console.log(`  services created: ${servicesCreated}`);
  console.log(`  portfolio items created: ${portfolioCreated}`);
}

main()
  .catch((error) => {
    console.error(
      "Marketplace structured backfill failed:",
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
