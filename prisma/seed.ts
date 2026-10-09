import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding comprehensive Advers database for Admin Dashboard...");

  const passwordHash = await bcrypt.hash("password123", 10);
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // 1. Create Demo Client Organizations
  const clientAdebayo = await prisma.client.upsert({
    where: { id: "client-adebayo-01" },
    update: {},
    create: {
      id: "client-adebayo-01",
      name: "Adebayo Holdings",
      industry: "Real Estate & Logistics",
      address: "Victoria Island, Lagos, Nigeria",
      notes: "VIP Client for Look Professional Package & Billboard reservation",
      createdAt: daysAgo(60),
    },
  });

  const clientLekki = await prisma.client.upsert({
    where: { id: "client-lekki-02" },
    update: {},
    create: {
      id: "client-lekki-02",
      name: "Lekki Retail Hub",
      industry: "Retail & Fashion",
      address: "Admiralty Way, Lekki Phase 1, Lagos",
      notes: "Digital package + VI LED screen slot reservation",
      createdAt: daysAgo(35),
    },
  });

  const clientEko = await prisma.client.upsert({
    where: { id: "client-eko-03" },
    update: {},
    create: {
      id: "client-eko-03",
      name: "Eko FinTech Solutions",
      industry: "Financial Technology",
      address: "Marina, Lagos Island, Lagos",
      notes: "Onboarding progress currently stalled awaiting brand asset upload",
      createdAt: daysAgo(20),
    },
  });

  // 2. Create Users across all roles and statuses
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@advers.ng" },
    update: { passwordHash, status: "ACTIVE" },
    create: {
      id: "usr-admin-01",
      email: "admin@advers.ng",
      name: "Advers Admin",
      phone: "+234 800 ADVERS",
      passwordHash,
      role: "ADMIN",
      orgRole: "OWNER",
      status: "ACTIVE",
      source: "INTERNAL",
      profileCompleteAt: daysAgo(100),
      lastLoginAt: daysAgo(0.1),
      createdAt: daysAgo(100),
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@advers.ng" },
    update: { passwordHash, status: "ACTIVE" },
    create: {
      id: "usr-staff-01",
      email: "staff@advers.ng",
      name: "Bisi Akande (Staff)",
      phone: "+234 802 111 2222",
      passwordHash,
      role: "STAFF",
      orgRole: "MEMBER",
      status: "ACTIVE",
      source: "INTERNAL",
      profileCompleteAt: daysAgo(45),
      lastLoginAt: daysAgo(0.5),
      createdAt: daysAgo(50),
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@advers.ng" },
    update: { passwordHash, clientId: clientAdebayo.id, status: "ACTIVE" },
    create: {
      id: "usr-client-01",
      email: "client@advers.ng",
      name: "Olumide Adebayo",
      phone: "+234 803 123 4567",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      status: "ACTIVE",
      source: "GOOGLE_ADS",
      utmSource: "google",
      utmCampaign: "ooh_search_lagos",
      clientId: clientAdebayo.id,
      profileCompleteAt: daysAgo(55),
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(60),
    },
  });

  const clientUser2 = await prisma.user.upsert({
    where: { email: "chidi@lekkiretail.com" },
    update: { passwordHash, clientId: clientLekki.id, status: "ACTIVE" },
    create: {
      id: "usr-client-02",
      email: "chidi@lekkiretail.com",
      name: "Chidi Nwosu",
      phone: "+234 802 987 6543",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      status: "ACTIVE",
      source: "LINKEDIN",
      utmSource: "linkedin",
      utmCampaign: "retail_billboard_promo",
      clientId: clientLekki.id,
      profileCompleteAt: daysAgo(30),
      lastLoginAt: daysAgo(2),
      createdAt: daysAgo(35),
    },
  });

  const clientUser3 = await prisma.user.upsert({
    where: { email: "fatima@ekofintech.ng" },
    update: { passwordHash, clientId: clientEko.id, status: "PROSPECT" },
    create: {
      id: "usr-client-03",
      email: "fatima@ekofintech.ng",
      name: "Fatima Bello",
      phone: "+234 805 555 7777",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      status: "PROSPECT",
      source: "DIRECT",
      clientId: clientEko.id,
      createdAt: daysAgo(20),
    },
  });

  const clientUser4 = await prisma.user.upsert({
    where: { email: "tunde@zariaagro.ng" },
    update: { passwordHash, status: "UNVERIFIED" },
    create: {
      id: "usr-client-04",
      email: "tunde@zariaagro.ng",
      name: "Tunde Bakare",
      phone: "+234 807 888 9999",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      status: "UNVERIFIED",
      source: "WEBSITE",
      createdAt: daysAgo(3),
    },
  });

  const deactivatedUser = await prisma.user.upsert({
    where: { email: "deactivated@advers.ng" },
    update: { passwordHash, status: "DEACTIVATED" },
    create: {
      id: "usr-client-05",
      email: "deactivated@advers.ng",
      name: "Former Client User",
      phone: "+234 800 000 0000",
      passwordHash,
      role: "CLIENT",
      orgRole: "MEMBER",
      status: "DEACTIVATED",
      source: "WEBSITE",
      createdAt: daysAgo(120),
    },
  });

  // 3. Create Packages
  const pkgVisible = await prisma.package.upsert({
    where: { key: "get-visible" },
    update: {},
    create: {
      id: "pkg-visible",
      key: "get-visible",
      name: "Get Visible",
      tagline: "For individuals and startups getting started",
      priceMin: 150000,
      priceMax: 200000,
      inclusionsJson: JSON.stringify([
        "1-page custom responsive website",
        "Custom domain (.ng / .com)",
        "1 business email account",
        "WhatsApp contact button & lead capture",
      ]),
    },
  });

  const pkgProfessional = await prisma.package.upsert({
    where: { key: "look-professional" },
    update: {},
    create: {
      id: "pkg-professional",
      key: "look-professional",
      name: "Look Professional",
      tagline: "For established SMEs and small businesses",
      priceMin: 250000,
      priceMax: 350000,
      inclusionsJson: JSON.stringify([
        "3–5 page custom website",
        "Logo suite & brand color guidelines",
        "Up to 3 business email accounts",
        "Google Business Profile setup",
      ]),
    },
  });

  const pkgEcosystem = await prisma.package.upsert({
    where: { key: "ecosystem-growth" },
    update: {},
    create: {
      id: "pkg-ecosystem",
      key: "ecosystem-growth",
      name: "Ecosystem Growth",
      tagline: "Full-stack digital + OOH billboard campaign setup",
      priceMin: 650000,
      priceMax: 1200000,
      inclusionsJson: JSON.stringify([
        "Multi-page enterprise site + CMS",
        "4-week Victoria Island LED billboard slot",
        "Full brand guidelines & social templates",
        "Real-time analytics dashboard integration",
      ]),
    },
  });

  // 4. Create Engagements
  const eng1 = await prisma.engagement.upsert({
    where: { id: "eng-101" },
    update: {},
    create: {
      id: "eng-101",
      clientId: clientAdebayo.id,
      packageId: pkgProfessional.id,
      type: "DIGITAL_PACKAGE",
      status: "ONBOARDING_IN_PROGRESS",
      onboardingProgress: 75,
      waitingOnClient: false,
      createdAt: daysAgo(50),
    },
  });

  const eng2 = await prisma.engagement.upsert({
    where: { id: "eng-102" },
    update: {},
    create: {
      id: "eng-102",
      clientId: clientLekki.id,
      packageId: pkgEcosystem.id,
      type: "ECOSYSTEM",
      status: "IN_PRODUCTION",
      onboardingProgress: 40,
      waitingOnClient: true, // waiting > 5 days!
      createdAt: daysAgo(30),
    },
  });

  const eng3 = await prisma.engagement.upsert({
    where: { id: "eng-103" },
    update: {},
    create: {
      id: "eng-103",
      clientId: clientEko.id,
      packageId: pkgVisible.id,
      type: "DIGITAL_PACKAGE",
      status: "PROSPECT",
      onboardingProgress: 20, // stuck < 50% for 7+ days!
      waitingOnClient: true,
      createdAt: daysAgo(14),
    },
  });

  // 5. Create Leads
  const leadsData = [
    {
      id: "lead-01",
      name: "Amaka Eze",
      email: "amaka@ezelogistics.com",
      phone: "+234 803 444 5555",
      company: "Eze Freight",
      source: "GOOGLE_ADS",
      utmSource: "google",
      utmCampaign: "lagos_logistics_ads",
      packageInterest: "Look Professional",
      budgetRange: "₦300,000",
      status: "NEW",
      createdAt: daysAgo(2),
    },
    {
      id: "lead-02",
      name: "David Adeleke",
      email: "david@30bg.ng",
      phone: "+234 809 300 0000",
      company: "30BG Entertainment",
      source: "LINKEDIN",
      utmSource: "linkedin",
      utmCampaign: "billboard_vi",
      packageInterest: "Ecosystem Growth",
      budgetRange: "₦1,500,000",
      status: "QUALIFIED",
      createdAt: daysAgo(8),
    },
    {
      id: "lead-03",
      name: "Kemi Balogun",
      email: "kemi@balogunlaw.ng",
      phone: "+234 802 777 8888",
      company: "Balogun & Co Legal",
      source: "WEBSITE",
      packageInterest: "Get Visible",
      budgetRange: "₦200,000",
      status: "NEW",
      createdAt: daysAgo(1),
    },
  ];

  for (const l of leadsData) {
    await prisma.lead.upsert({
      where: { id: l.id },
      update: {},
      create: l,
    });
  }

  // 6. Create Feedback & Inquiries (Inbox)
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
      status: "NEW", // NEW > 24h attention item!
      packageInterest: "Look Professional (₦250k - ₦350k)",
      message: "Interested in setting up 3-5 page custom website and business email provisioning for our Lagos operations.",
      createdAt: daysAgo(2), // 48 hours ago
    },
  });

  await prisma.feedback.upsert({
    where: { id: "FB-102" },
    update: {},
    create: {
      id: "FB-102",
      name: "Chidi Nwosu",
      email: "chidi@lekkiretail.com",
      phone: "+234 802 987 6543",
      company: "Lekki Retail Hub",
      type: "BILLBOARD_ENQUIRY",
      status: "IN_REVIEW",
      packageInterest: "LED Billboard Slot (Victoria Island)",
      message: "Looking for 4-week slot reservation on the Victoria Island digital screen.",
      createdAt: daysAgo(1),
    },
  });

  await prisma.feedback.upsert({
    where: { id: "FB-103" },
    update: {},
    create: {
      id: "FB-103",
      name: "Amaka Eze",
      email: "amaka@ezelogistics.com",
      company: "Eze Freight",
      type: "ENQUIRY",
      status: "NEW", // NEW < 24h
      packageInterest: "Look Professional",
      message: "Can we get a quick call to discuss domain transfer and custom email setups?",
      createdAt: daysAgo(0.2),
    },
  });

  // 7. Create Quotes
  await prisma.quote.upsert({
    where: { quoteNumber: "QUO-2026-001" },
    update: {},
    create: {
      id: "quote-01",
      quoteNumber: "QUO-2026-001",
      leadId: "lead-01",
      title: "Custom Web Suite & Email Provisioning",
      amount: 320000,
      status: "SENT", // Unopened > 3 days!
      sentAt: daysAgo(4),
      expiresAt: daysAhead(10),
      createdAt: daysAgo(4),
    },
  });

  await prisma.quote.upsert({
    where: { quoteNumber: "QUO-2026-002" },
    update: {},
    create: {
      id: "quote-02",
      quoteNumber: "QUO-2026-002",
      clientId: clientLekki.id,
      title: "Victoria Island LED Screen 4-Week Slot",
      amount: 850000,
      status: "ACCEPTED",
      openedAt: daysAgo(12),
      sentAt: daysAgo(15),
      expiresAt: daysAhead(15),
      createdAt: daysAgo(15),
    },
  });

  // 8. Create Invoices & Payments
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-001" },
    update: {},
    create: {
      id: "inv-01",
      invoiceNumber: "INV-2026-001",
      clientId: clientAdebayo.id,
      engagementId: eng1.id,
      userId: clientUser.id,
      title: "Look Professional Package Deposit (50%)",
      amount: 175000,
      serviceType: "DIGITAL_PACKAGE",
      status: "PAID",
      dueDate: daysAgo(20),
      paidAt: daysAgo(22),
      createdAt: daysAgo(25),
    },
  });

  await prisma.payment.upsert({
    where: { reference: "PAY-ADVERS-001" },
    update: {},
    create: {
      id: "pay-01",
      invoiceId: inv1.id,
      amount: 175000,
      paymentMethod: "PAYSTACK",
      reference: "PAY-ADVERS-001",
      status: "SUCCESS",
      createdAt: daysAgo(22),
    },
  });

  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-002" },
    update: {},
    create: {
      id: "inv-02",
      invoiceNumber: "INV-2026-002",
      clientId: clientLekki.id,
      engagementId: eng2.id,
      userId: clientUser2.id,
      title: "Ecosystem Growth Package & Screen Deposit",
      amount: 450000,
      serviceType: "ECOSYSTEM",
      status: "PAID",
      dueDate: daysAgo(10),
      paidAt: daysAgo(12),
      createdAt: daysAgo(15),
    },
  });

  await prisma.payment.upsert({
    where: { reference: "PAY-ADVERS-002" },
    update: {},
    create: {
      id: "pay-02",
      invoiceId: inv2.id,
      amount: 450000,
      paymentMethod: "PAYSTACK",
      reference: "PAY-ADVERS-002",
      status: "SUCCESS",
      createdAt: daysAgo(12),
    },
  });

  // Overdue Invoice (Needs Attention!)
  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-003" },
    update: {},
    create: {
      id: "inv-03",
      invoiceNumber: "INV-2026-003",
      clientId: clientEko.id,
      engagementId: eng3.id,
      userId: clientUser3.id,
      title: "Get Visible Web Suite Final Milestone",
      amount: 150000,
      serviceType: "DIGITAL_PACKAGE",
      status: "OVERDUE",
      dueDate: daysAgo(8), // Overdue by 8 days
      createdAt: daysAgo(25),
    },
  });

  // 9. Create Renewals
  await prisma.renewal.upsert({
    where: { id: "ren-01" },
    update: {},
    create: {
      id: "ren-01",
      clientId: clientAdebayo.id,
      engagementId: eng1.id,
      title: "Annual Domain & Business Email Renewal (Adebayo Holdings)",
      amount: 45000,
      renewalDate: daysAhead(18), // Due in 18 days
      status: "UPCOMING",
      createdAt: daysAgo(50),
    },
  });

  await prisma.renewal.upsert({
    where: { id: "ren-02" },
    update: {},
    create: {
      id: "ren-02",
      clientId: clientLekki.id,
      engagementId: eng2.id,
      title: "Victoria Island LED Screen Monthly Subscription",
      amount: 250000,
      renewalDate: daysAhead(24), // Due in 24 days
      status: "UPCOMING",
      createdAt: daysAgo(30),
    },
  });

  // 10. Create Activity Logs
  const activityLogs = [
    {
      id: "act-01",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      action: "USER_SIGNUP",
      description: "New client registered: Olumide Adebayo (Adebayo Holdings)",
      createdAt: daysAgo(60),
    },
    {
      id: "act-02",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      action: "PAYMENT_RECEIVED",
      description: "Received payment of ₦175,000 via Paystack for INV-2026-001",
      createdAt: daysAgo(22),
    },
    {
      id: "act-03",
      userId: clientUser2.id,
      clientId: clientLekki.id,
      action: "FILE_UPLOADED",
      description: "Uploaded high-resolution brand logo & Victoria Island billboard creative",
      createdAt: daysAgo(5),
    },
    {
      id: "act-04",
      userId: staffUser.id,
      action: "STATUS_CHANGED",
      description: "Staff updated Engagement #eng-101 onboarding status to 75%",
      createdAt: daysAgo(2),
    },
    {
      id: "act-05",
      userId: clientUser4.id,
      action: "USER_SIGNUP",
      description: "New user registered: Tunde Bakare (tunde@zariaagro.ng)",
      createdAt: daysAgo(3),
    },
  ];

  for (const act of activityLogs) {
    await prisma.activityLog.upsert({
      where: { id: act.id },
      update: {},
      create: act,
    });
  }

  // 11. Create Audit Logs
  await prisma.auditLog.upsert({
    where: { id: "audit-01" },
    update: {},
    create: {
      id: "audit-01",
      actorId: adminUser.id,
      action: "CLIENT_IMPERSONATION",
      targetType: "User",
      targetId: clientUser.id,
      details: "Admin initiated read-only client dashboard impersonation session",
      createdAt: daysAgo(1),
    },
  });

  console.log("✅ Database seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("🔐 ADMIN LOGIN:");
  console.log("   Email: admin@advers.ng");
  console.log("   Password: password123");
  console.log("--------------------------------------------------");
  console.log("🛡️ STAFF LOGIN:");
  console.log("   Email: staff@advers.ng");
  console.log("   Password: password123");
  console.log("--------------------------------------------------");
  console.log("👤 CLIENT LOGIN:");
  console.log("   Email: client@advers.ng");
  console.log("   Password: password123");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
