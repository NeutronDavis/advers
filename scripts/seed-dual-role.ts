/**
 * Creates a dual-role demo account so the User ↔ AdBooster switcher can be
 * exercised with the seeded advertiser login.
 *
 * Usage: npm run seed:dual-role
 */
import { prisma } from "../src/lib/prisma";
import { slugifyHandle } from "../src/lib/marketplace";

async function main(): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: "client@advers.ng" },
  });
  if (!user) throw new Error("client@advers.ng not found. Run the base seed first.");

  const existing = await prisma.boosterProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    console.log("Dual-role demo already exists.");
    return;
  }

  const base = slugifyHandle(`${user.name} Studio`);
  let handle = base;
  let suffix = 2;
  while (await prisma.boosterProfile.findUnique({ where: { handle } })) {
    handle = `${base}-${suffix}`;
    suffix += 1;
  }

  await prisma.boosterProfile.create({
    data: {
      userId: user.id,
      displayName: `${user.name} Studio`,
      handle,
      businessName: `${user.name} Studio`,
      bio: "Full-service creative and campaign production studio. Brand systems, motion, photography and launch campaigns.",
      location: "Lagos, Nigeria",
      coverUrl: `https://picsum.photos/seed/${handle}/1200/400`,
      availabilityStatus: "AVAILABLE",
      responseTimeHours: 6,
      startingPrice: 150_000,
      categoriesJson: JSON.stringify(["CREATIVE", "PRODUCTION"]),
      skillsJson: JSON.stringify([
        "Brand identity",
        "Motion design",
        "Photography",
        "Campaign production",
      ]),
      coverageJson: JSON.stringify(["Lagos", "Abuja", "Remote"]),
      portfolioJson: JSON.stringify([
        {
          title: "Festive retail campaign",
          url: "https://example.com/case-study",
          description: "Multi-channel launch across radio, outdoor and social.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "Brand identity package", amount: "₦450,000" },
        { label: "Campaign production", amount: "₦250,000" },
      ]),
      availableHours: "Mon–Fri, 9am–6pm WAT",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      verificationLevel: "BUSINESS",
      status: "ACTIVE",
      ratingAvg: 4.8,
      ratingCount: 18,
      completedJobs: 24,
    },
  });

  console.log(`Dual-role demo created for ${user.email} with handle @${handle}.`);
}

main()
  .catch((error) => {
    console.error("Dual-role seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
