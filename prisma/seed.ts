import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Advers database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Demo Client Organization
  const clientOrg = await prisma.client.upsert({
    where: { id: "client-adebayo-01" },
    update: {},
    create: {
      id: "client-adebayo-01",
      name: "Adebayo Holdings",
      industry: "Real Estate & Logistics",
      address: "Victoria Island, Lagos, Nigeria",
      notes: "VIP Client for Look Professional Package & Billboard reservation",
    },
  });

  // 2. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@advers.ng" },
    update: { passwordHash },
    create: {
      id: "usr-admin-01",
      email: "admin@advers.ng",
      name: "Advers Admin",
      phone: "+234 800 ADVERS",
      passwordHash,
      role: "ADMIN",
      orgRole: "OWNER",
      profileCompleteAt: new Date(),
    },
  });

  // 3. Create Demo Client User
  const clientUser = await prisma.user.upsert({
    where: { email: "client@advers.ng" },
    update: { passwordHash, clientId: clientOrg.id },
    create: {
      id: "usr-client-01",
      email: "client@advers.ng",
      name: "Olumide Adebayo",
      phone: "+234 803 123 4567",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      clientId: clientOrg.id,
      profileCompleteAt: new Date(),
    },
  });

  // 4. Create Packages
  const packages = [
    {
      id: "pkg-visible",
      key: "get-visible",
      name: "Get Visible",
      tagline: "For individuals and people just getting started",
      priceMin: 150000,
      priceMax: 200000,
      inclusionsJson: JSON.stringify([
        "1-page professional website",
        "Custom domain (1 year)",
        "1 business email account",
        "WhatsApp contact button",
      ]),
    },
    {
      id: "pkg-professional",
      key: "look-professional",
      name: "Look Professional",
      tagline: "For professionals and small businesses",
      priceMin: 250000,
      priceMax: 350000,
      inclusionsJson: JSON.stringify([
        "3–5 page custom website",
        "Logo design suite & brand colors",
        "Up to 3 business email accounts",
        "Google Business Profile setup",
      ]),
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { key: pkg.key },
      update: {},
      create: pkg,
    });
  }

  // 5. Create Active Client Engagement
  const engagement = await prisma.engagement.upsert({
    where: { id: "eng-101" },
    update: {},
    create: {
      id: "eng-101",
      clientId: clientOrg.id,
      packageId: "pkg-professional",
      type: "DIGITAL_PACKAGE",
      status: "ONBOARDING_IN_PROGRESS",
      onboardingProgress: 75,
      waitingOnClient: false,
    },
  });

  // 6. Create Demo Leads & Feedback Inquiries
  await prisma.feedback.upsert({
    where: { id: "FB-101" },
    update: {},
    create: {
      id: "FB-101",
      name: "Olumide Adebayo",
      email: "olumide@adebayoholdings.ng",
      phone: "+234 803 123 4567",
      company: "Adebayo Holdings",
      type: "ENQUIRY",
      status: "NEW",
      packageInterest: "Look Professional (₦250k - ₦350k)",
      message: "Interested in setting up 3-5 page custom website and business email provisioning for our Lagos operations.",
    },
  });

  console.log("✅ Database seeding completed!");
  console.log("------------------------------------------");
  console.log("🔐 ADMIN LOGIN:");
  console.log("   Email: admin@advers.ng");
  console.log("   Password: password123");
  console.log("------------------------------------------");
  console.log("👤 CLIENT LOGIN:");
  console.log("   Email: client@advers.ng");
  console.log("   Password: password123");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
