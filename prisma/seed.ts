import { PrismaClient, ChannelType, CampaignStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { PLAN_DEFINITIONS } from "../src/lib/plans";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding realistic ADVERS Multi-Channel Advertising Database...");

  const passwordHash = await bcrypt.hash("password123", 10);
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // 1. Core Client Organizations
  console.log("🏢 Seeding client organizations...");
  const clientAdebayo = await prisma.client.upsert({
    where: { id: "client-adebayo-01" },
    update: {},
    create: {
      id: "client-adebayo-01",
      name: "Adebayo Holdings Limited",
      industry: "Real Estate, Consumer Goods & Logistics",
      address: "14 Ahmadu Bello Way, Victoria Island, Lagos & GRA, Port Harcourt",
      notes: "Key enterprise advertiser across DOOH billboards and FM radio channels.",
      createdAt: daysAgo(90),
    },
  });

  const clientZinox = await prisma.client.upsert({
    where: { id: "client-zinox-02" },
    update: {},
    create: {
      id: "client-zinox-02",
      name: "Zinox Retail Group",
      industry: "Retail & Electronics",
      address: "Trans-Amadi Industrial Layout, Port Harcourt, Rivers State",
      notes: "Active advertiser focusing on radio drive-time promotions and AdBoosters crowd sharing.",
      createdAt: daysAgo(60),
    },
  });

  const clientGreenEnergy = await prisma.client.upsert({
    where: { id: "client-green-03" },
    update: {},
    create: {
      id: "client-green-03",
      name: "GreenEnergy Nigeria",
      industry: "Renewable Energy & Solar Power",
      address: "Central Business District, Abuja, FCT",
      notes: "Nationwide TV broadcast advertiser and digital press announcements.",
      createdAt: daysAgo(40),
    },
  });

  const clientNew = await prisma.client.upsert({
    where: { id: "client-new-04" },
    update: {},
    create: {
      id: "client-new-04",
      name: "Chika Okafor Studio",
      industry: "Creative Services",
      address: "Yaba, Lagos",
      notes: "New account created for the onboarding flow. No active plan yet.",
      createdAt: daysAgo(1),
    },
  });

  // 2. Platform Users
  console.log("👤 Seeding platform users...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@advers.ng" },
    update: { passwordHash, status: "ACTIVE" },
    create: {
      id: "usr-admin-01",
      email: "admin@advers.ng",
      name: "Advers Chief Media Controller",
      phone: "+234 800 238377",
      passwordHash,
      role: "ADMIN",
      orgRole: "OWNER",
      status: "ACTIVE",
      source: "INTERNAL",
      profileCompleteAt: daysAgo(120),
      lastLoginAt: daysAgo(0.1),
      createdAt: daysAgo(120),
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@advers.ng" },
    update: { passwordHash, status: "ACTIVE" },
    create: {
      id: "usr-staff-01",
      email: "staff@advers.ng",
      name: "Bisi Akande (Traffic Lead)",
      phone: "+234 802 111 2222",
      passwordHash,
      role: "STAFF",
      orgRole: "MEMBER",
      status: "ACTIVE",
      source: "INTERNAL",
      profileCompleteAt: daysAgo(60),
      lastLoginAt: daysAgo(0.3),
      createdAt: daysAgo(60),
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
      clientId: clientAdebayo.id,
      source: "ORGANIC",
      profileCompleteAt: daysAgo(90),
      lastLoginAt: daysAgo(0.2),
      createdAt: daysAgo(90),
    },
  });

  const newClientUser = await prisma.user.upsert({
    where: { email: "newclient@advers.ng" },
    update: { passwordHash, clientId: clientNew.id },
    create: {
      id: "usr-newclient-02",
      email: "newclient@advers.ng",
      name: "Chidi Okafor",
      phone: "+234 805 444 7788",
      passwordHash,
      role: "CLIENT",
      orgRole: "OWNER",
      status: "UNVERIFIED",
      clientId: clientNew.id,
      source: "INVITATION",
      createdAt: daysAgo(1),
    },
  });

  const teamMemberUser = await prisma.user.upsert({
    where: { email: "team@advers.ng" },
    update: { passwordHash, clientId: clientAdebayo.id },
    create: {
      id: "usr-team-01",
      email: "team@advers.ng",
      name: "Bisi Akande (Team Member)",
      phone: "+234 802 333 4455",
      passwordHash,
      role: "CLIENT",
      orgRole: "MEMBER",
      status: "ACTIVE",
      clientId: clientAdebayo.id,
      source: "INVITATION",
      profileCompleteAt: daysAgo(10),
      lastLoginAt: daysAgo(0.4),
      createdAt: daysAgo(10),
    },
  });

  // 3. User Media Wallet & Transactions
  console.log("💳 Seeding advertiser media wallet...");
  const clientWallet = await prisma.wallet.upsert({
    where: { userId: clientUser.id },
    update: {
      availableBalance: 485000,
      escrowBalance: 225000,
      totalSpent: 710000,
    },
    create: {
      id: "wallet-olumide-01",
      userId: clientUser.id,
      availableBalance: 485000,
      escrowBalance: 225000,
      totalSpent: 710000,
      transactions: {
        create: [
          {
            reference: "PAY-DEP-99201",
            type: "DEPOSIT",
            amount: 500000,
            description: "Direct Bank Card Top-Up via Paystack Checkout",
            status: "SUCCESS",
            createdAt: daysAgo(14),
          },
          {
            reference: "ESC-LOCK-8841",
            type: "ESCROW_LOCK",
            amount: 150000,
            description: "Escrow reservation for Summer Product Launch (Port Harcourt DOOH)",
            status: "SUCCESS",
            createdAt: daysAgo(7),
          },
          {
            reference: "ESC-LOCK-8840",
            type: "ESCROW_LOCK",
            amount: 75000,
            description: "Escrow reservation for Brand Awareness Drive (Cool FM Rivers)",
            status: "SUCCESS",
            createdAt: daysAgo(3),
          },
        ],
      },
    },
  });

  // 4. Media Inventory Directory
  console.log("📺 Seeding media inventory directory...");
  const invLekki = await prisma.mediaInventory.upsert({
    where: { inventoryCode: "INV-DOOH-01" },
    update: {},
    create: {
      inventoryCode: "INV-DOOH-01",
      name: "Lekki Toll Gate Phase 1 Mega Screen",
      channel: ChannelType.DIGITAL_BILLBOARD,
      city: "Lagos",
      state: "Lagos State",
      locationDetails: "Lekki-Epe Expressway corridor, directly opposite Phase 1 Toll Gate",
      screenSpecs: "18m x 6m (1080x1920 portrait) High-Brightness LED (6500 nits)",
      loopCapacity: "12 commercial slots (15s spot in 180s cycle)",
      availableSlots: 4,
      ratePerUnit: 25000,
      unitType: "per_day",
      vendorName: "Elevate Media Network Limited",
      vendorContact: "traffic@elevatemedia.ng / +234 1 234 5678",
      status: "OPERATIONAL",
    },
  });

  const invPortHarcourt = await prisma.mediaInventory.upsert({
    where: { inventoryCode: "INV-DOOH-02" },
    update: {},
    create: {
      inventoryCode: "INV-DOOH-02",
      name: "Peter Odili Road Trans-Amadi Hub",
      channel: ChannelType.DIGITAL_BILLBOARD,
      city: "Port Harcourt",
      state: "Rivers State",
      locationDetails: "Peter Odili Roundabout intersection connecting Woji & Trans-Amadi",
      screenSpecs: "12m x 4m (1920x1080 landscape) SMD LED Screen",
      loopCapacity: "10 commercial slots (15s spot)",
      availableSlots: 2,
      ratePerUnit: 18000,
      unitType: "per_day",
      vendorName: "Rivers Outdoor Advertising Ltd",
      vendorContact: "ops@riversoutdoor.ng",
      status: "OPERATIONAL",
    },
  });

  const invCoolFm = await prisma.mediaInventory.upsert({
    where: { inventoryCode: "INV-RAD-01" },
    update: {},
    create: {
      inventoryCode: "INV-RAD-01",
      name: "Cool FM 96.9 & Nigeria Info 99.3 Network",
      channel: ChannelType.FM_RADIO,
      city: "Port Harcourt / Lagos",
      state: "Rivers & Lagos",
      locationDetails: "Broadcasting across the Niger Delta and Greater Lagos commercial zones",
      screenSpecs: "Broadcast Audio (44.1kHz / 320kbps stereo) or Live OAP Mention",
      loopCapacity: "30 commercial breaks daily (Morning, Afternoon, Evening drive)",
      availableSlots: 8,
      ratePerUnit: 15000,
      unitType: "per_spot_30s",
      vendorName: "AIM Group Broadcasters",
      vendorContact: "bookings@coolfm.ng",
      status: "OPERATIONAL",
    },
  });

  const invChannelsTv = await prisma.mediaInventory.upsert({
    where: { inventoryCode: "INV-TV-01" },
    update: {},
    create: {
      inventoryCode: "INV-TV-01",
      name: "Channels Television Prime Evening News",
      channel: ChannelType.TELEVISION,
      city: "Nationwide",
      state: "National Terrestrial & DStv Channel 418",
      locationDetails: "Prime news broadcast block (7:00 PM – 10:00 PM WAT)",
      screenSpecs: "Full HD Broadcast Master (ProRes 422 / MP4 1080p)",
      loopCapacity: "12 commercial breaks per news hour",
      availableSlots: 3,
      ratePerUnit: 95000,
      unitType: "per_spot_30s",
      vendorName: "Channels Media Group",
      vendorContact: "commercial@channelstv.com",
      status: "OPERATIONAL",
    },
  });

  const invPunch = await prisma.mediaInventory.upsert({
    where: { inventoryCode: "INV-PRINT-01" },
    update: {},
    create: {
      inventoryCode: "INV-PRINT-01",
      name: "The Punch National Newspaper",
      channel: ChannelType.NEWSPAPER,
      city: "Nationwide Daily Circulation",
      state: "All 36 States & FCT",
      locationDetails: "Distributed in print and online across all state capitals",
      screenSpecs: "Full Color 300 DPI CMYK PDF (Full page, half page, front strip)",
      loopCapacity: "Daily Edition",
      availableSlots: 5,
      ratePerUnit: 320000,
      unitType: "per_issue",
      vendorName: "Punch Nigeria Limited",
      vendorContact: "advert@punchng.com",
      status: "OPERATIONAL",
    },
  });

  // 5. Campaigns Across Multiple Channels
  console.log("📢 Seeding multi-channel advertising campaigns...");
  const camp1 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-001" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-001",
      name: "Summer Product Launch",
      channel: ChannelType.DIGITAL_BILLBOARD,
      status: CampaignStatus.IN_PROGRESS,
      objective: "Brand awareness & foot traffic",
      targetLocation: "Port Harcourt (GRA Junction & Peter Odili)",
      budget: 150000,
      duration: "2 weeks",
      startDate: daysAgo(5),
      endDate: daysAhead(9),
      creativeAssetUrl: "https://assets.advers.ng/creatives/summer-launch-ph.mp4",
      creativeAssetType: "MP4 Video (1080x1920, 15s, 60fps)",
      arconCode: "ARCON/RIV/2026/041",
      complianceNotes: "Creative validated for visual clarity and ARCON registration seal included.",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      inventoryId: invPortHarcourt.id,
      createdAt: daysAgo(7),
    },
  });

  const camp2 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-002" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-002",
      name: "Brand Awareness Drive",
      channel: ChannelType.FM_RADIO,
      status: CampaignStatus.CONFIRMED,
      objective: "Drive store visits and customer phone enquiries",
      targetLocation: "Rivers State (Cool FM & Nigeria Info)",
      budget: 75000,
      duration: "1 week",
      startDate: daysAgo(1),
      endDate: daysAhead(6),
      creativeAssetUrl: "https://assets.advers.ng/creatives/coolfm-rivers-jingle.wav",
      creativeAssetType: "Broadcast Audio WAV (44.1kHz, 30s)",
      arconCode: "ARCON/RAD/2026/119",
      complianceNotes: "Loudness standard conforming to EBU R128 (-23 LUFS). Approved for broadcast.",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      inventoryId: invCoolFm.id,
      createdAt: daysAgo(3),
    },
  });

  const camp3 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-003" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-003",
      name: "Lekki Toll Mega Display",
      channel: ChannelType.DIGITAL_BILLBOARD,
      status: CampaignStatus.IN_PROGRESS,
      objective: "High-impact luxury brand positioning",
      targetLocation: "Lagos (Lekki Toll Gate Phase 1)",
      budget: 350000,
      duration: "1 month",
      startDate: daysAgo(12),
      endDate: daysAhead(18),
      creativeAssetUrl: "https://assets.advers.ng/creatives/lekki-toll-luxury.mp4",
      creativeAssetType: "4K Video Master (1080x1920, 15s loop)",
      arconCode: "ARCON/LAG/2026/891",
      complianceNotes: "Night-time luminance calibration verified.",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      inventoryId: invLekki.id,
      createdAt: daysAgo(14),
    },
  });

  const camp4 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-004" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-004",
      name: "Solar Inverter Product Showcase",
      channel: ChannelType.TELEVISION,
      status: CampaignStatus.UNDER_REVIEW,
      objective: "Nationwide commercial launch & dealer network expansion",
      targetLocation: "Nationwide (Channels TV)",
      budget: 750000,
      duration: "1 week",
      creativeAssetUrl: "https://assets.advers.ng/creatives/greenenergy-solar.mp4",
      creativeAssetType: "ProRes 422 (1080p, 45s TVC)",
      arconCode: "ARCON/NAT/2026/102",
      complianceNotes: "Submitted for broadcast clearance by GreenEnergy NG.",
      userId: clientUser.id,
      clientId: clientGreenEnergy.id,
      inventoryId: invChannelsTv.id,
      createdAt: daysAgo(1),
    },
  });

  const camp5 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-005" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-005",
      name: "Corporate Public Notice & Financial Announcement",
      channel: ChannelType.NEWSPAPER,
      status: CampaignStatus.COMPLETED,
      objective: "Statutory public announcement in national press",
      targetLocation: "Nationwide Daily Press",
      budget: 320000,
      duration: "1 day publication",
      startDate: daysAgo(20),
      endDate: daysAgo(20),
      creativeAssetUrl: "https://assets.advers.ng/creatives/public-notice-punch.pdf",
      creativeAssetType: "High-Res PDF CMYK (300 DPI, Page 8 Strip)",
      arconCode: "EXEMPT-PUBLIC-NOTICE",
      complianceNotes: "Official corporate resolution verified.",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      inventoryId: invPunch.id,
      createdAt: daysAgo(22),
    },
  });

  // 6. Proof of Performance (PoP) Records
  console.log("📸 Seeding verified proof of performance records...");
  await prisma.proofOfPerformance.upsert({
    where: { proofCode: "POP-901" },
    update: {},
    create: {
      proofCode: "POP-901",
      campaignId: camp1.id,
      type: "DAY_PHOTO",
      fileUrl: "https://assets.advers.ng/proofs/ph-gra-daytime-playback.jpg",
      caption: "Day-time loop display confirmed on Peter Odili LED Screen with clear daylight visibility.",
      broadcastTimestamp: daysAgo(4),
      verifiedBy: "Samuel (Advers Port Harcourt Field Officer)",
      verifiedAt: daysAgo(4),
    },
  });

  await prisma.proofOfPerformance.upsert({
    where: { proofCode: "POP-902" },
    update: {},
    create: {
      proofCode: "POP-902",
      campaignId: camp2.id,
      type: "BROADCAST_AFFIDAVIT",
      fileUrl: "https://assets.advers.ng/proofs/coolfm-transmission-certificate.pdf",
      caption: "Signed Station Broadcast Affidavit for morning drive-time airing (7:45 AM & 8:30 AM).",
      broadcastTimestamp: daysAgo(1),
      verifiedBy: "AIM Group Traffic Management Dept",
      verifiedAt: daysAgo(1),
    },
  });

  await prisma.proofOfPerformance.upsert({
    where: { proofCode: "POP-903" },
    update: {},
    create: {
      proofCode: "POP-903",
      campaignId: camp3.id,
      type: "NIGHT_PHOTO",
      fileUrl: "https://assets.advers.ng/proofs/lekki-toll-night-illumination.jpg",
      caption: "Night-time illuminated loop playback footage recorded at Lekki Toll Plaza Phase 1.",
      broadcastTimestamp: daysAgo(10),
      verifiedBy: "Lagos Field Surveillance Patrol",
      verifiedAt: daysAgo(10),
    },
  });

  // 7. AdBoosters Crowd Referral Network
  console.log("✦ Seeding AdBoosters promoters and tracking links...");
  const boosterChuks = await prisma.adBooster.upsert({
    where: { id: "booster-chuks-01" },
    update: {},
    create: {
      id: "booster-chuks-01",
      name: "Chukwudi Eze",
      handle: "@chuks_hype",
      phone: "+234 806 555 1234",
      networkType: "WhatsApp & Telegram (14k Reach)",
      audienceReach: 14000,
      bankName: "Access Bank Nigeria",
      bankAccountNumber: "0123456789",
      bankAccountName: "Chukwudi Eze",
      totalEarnedCommission: 32500,
      fraudRisk: "LOW",
      status: "ACTIVE",
    },
  });

  const boosterBlessing = await prisma.adBooster.upsert({
    where: { id: "booster-blessing-02" },
    update: {},
    create: {
      id: "booster-blessing-02",
      name: "Blessing Johnson",
      handle: "@blessing_promo",
      phone: "+234 813 888 4321",
      networkType: "X & Instagram (22k Reach)",
      audienceReach: 22000,
      bankName: "Guaranty Trust Bank (GTBank)",
      bankAccountNumber: "0987654321",
      bankAccountName: "Blessing Johnson",
      totalEarnedCommission: 25900,
      fraudRisk: "LOW",
      status: "ACTIVE",
    },
  });

  // Create trackable booster links for campaigns
  await prisma.boosterLink.upsert({
    where: { code: "BOOST-PH-CHUK" },
    update: {},
    create: {
      code: "BOOST-PH-CHUK",
      campaignId: camp1.id,
      boosterId: boosterChuks.id,
      clicksCount: 1840,
      sharesCount: 420,
      conversionsCount: 48,
      commissionAccrued: 32500,
    },
  });

  await prisma.boosterLink.upsert({
    where: { code: "BOOST-LEKKI-BLES" },
    update: {},
    create: {
      code: "BOOST-LEKKI-BLES",
      campaignId: camp3.id,
      boosterId: boosterBlessing.id,
      clicksCount: 1420,
      sharesCount: 310,
      conversionsCount: 36,
      commissionAccrued: 25900,
    },
  });

  // 8. Media Settlements Ledger
  console.log("🧾 Seeding media partner settlements & fee ledger...");
  await prisma.mediaSettlement.upsert({
    where: { settlementNumber: "SET-401" },
    update: {},
    create: {
      settlementNumber: "SET-401",
      campaignId: camp1.id,
      vendorName: "Rivers Outdoor Advertising Ltd",
      grossAmount: 150000,
      vendorPayout: 110000,
      adversFee: 40000,
      status: "READY_FOR_PAYOUT",
    },
  });

  await prisma.mediaSettlement.upsert({
    where: { settlementNumber: "SET-402" },
    update: {},
    create: {
      settlementNumber: "SET-402",
      campaignId: camp2.id,
      vendorName: "AIM Group Broadcasters (Cool FM)",
      grossAmount: 75000,
      vendorPayout: 55000,
      adversFee: 20000,
      status: "READY_FOR_PAYOUT",
    },
  });

  await prisma.mediaSettlement.upsert({
    where: { settlementNumber: "SET-400" },
    update: {},
    create: {
      settlementNumber: "SET-400",
      campaignId: camp5.id,
      vendorName: "Punch Nigeria Limited",
      grossAmount: 320000,
      vendorPayout: 240000,
      adversFee: 80000,
      status: "SETTLED",
      settledAt: daysAgo(18),
    },
  });

  // 9. Service packages, engagements and onboarding responses
  console.log("📦 Seeding service packages, engagements and onboarding...");
  const packageLaunchpad = await prisma.package.upsert({
    where: { key: "launchpad" },
    update: {},
    create: {
      key: "launchpad",
      name: "Launchpad",
      tagline: "Brand Foundation for Startups & Professionals",
      priceMin: 150000,
      priceMax: 200000,
      inclusionsJson: JSON.stringify([
        "Custom Vector Logo Suite",
        "Brand Guidelines",
        "Company Profile / Pitch Deck",
        "Domain & Business Email",
        "Social Media Launch Kit",
      ]),
    },
  });

  const packageGetVisible = await prisma.package.upsert({
    where: { key: "get-visible" },
    update: {},
    create: {
      key: "get-visible",
      name: "Get Visible",
      tagline: "Core Digital Engine for Scaling SMEs",
      priceMin: 250000,
      priceMax: 450000,
      inclusionsJson: JSON.stringify([
        "Everything in Launchpad",
        "3–5 Page Custom Website",
        "On-Page SEO",
        "Google Business Profile",
        "WhatsApp Chat & Lead Capture",
        "1 Year Hosting & SSL",
      ]),
    },
  });

  const packageMarketDominance = await prisma.package.upsert({
    where: { key: "market-dominance" },
    update: {},
    create: {
      key: "market-dominance",
      name: "Market Dominance",
      tagline: "Omnichannel Growth: Web, Email & Billboards",
      priceMin: 750000,
      priceMax: 1500000,
      inclusionsJson: JSON.stringify([
        "Everything in Get Visible",
        "Advanced Web App / E-commerce",
        "Email Marketing Funnels",
        "Digital LED Billboard Campaign",
        "Motion Graphics / Video Ad",
        "Traffic Impression Reports",
        "Dedicated Account Growth Lead",
      ]),
    },
  });

  // 9a. Marketing Access Plans & subscriptions
  console.log("💳 Seeding marketing access plans and subscriptions...");
  const planFeatures = (key: string) =>
    JSON.stringify(PLAN_DEFINITIONS.find((plan) => plan.key === key)?.features ?? []);

  const planStarter = await prisma.plan.upsert({
    where: { key: "STARTER" },
    update: {},
    create: {
      key: "STARTER",
      name: "Starter Access",
      tagline: "Your entry into professional marketing.",
      monthlyPrice: 1999,
      annualPrice: 19990,
      profileLimit: 1,
      workspaceLimit: 1,
      teamSeatLimit: 0,
      featuresJson: planFeatures("STARTER"),
      active: true,
    },
  });

  const planGrowth = await prisma.plan.upsert({
    where: { key: "GROWTH" },
    update: {},
    create: {
      key: "GROWTH",
      name: "Growth Access",
      tagline: "More campaigns, more control, more insight.",
      monthlyPrice: 4999,
      annualPrice: 49990,
      profileLimit: 3,
      workspaceLimit: 5,
      teamSeatLimit: 0,
      featuresJson: planFeatures("GROWTH"),
      active: true,
    },
  });

  const planBusinessPro = await prisma.plan.upsert({
    where: { key: "BUSINESS_PRO" },
    update: {},
    create: {
      key: "BUSINESS_PRO",
      name: "Business Pro Access",
      tagline: "Built for established businesses and multi-location teams.",
      monthlyPrice: 9999,
      annualPrice: 99990,
      profileLimit: 10,
      workspaceLimit: 15,
      teamSeatLimit: 3,
      featuresJson: planFeatures("BUSINESS_PRO"),
      active: true,
    },
  });

  await prisma.subscription.upsert({
    where: { id: "sub-adebayo-01" },
    update: {},
    create: {
      id: "sub-adebayo-01",
      clientId: clientAdebayo.id,
      planId: planBusinessPro.id,
      billingPeriod: "ANNUAL",
      status: "ACTIVE",
      price: 99990,
      startDate: daysAgo(30),
      renewalDate: daysAhead(335),
      paymentReference: "SUB-PAY-2026-001",
    },
  });

  await prisma.subscription.upsert({
    where: { id: "sub-zinox-01" },
    update: {},
    create: {
      id: "sub-zinox-01",
      clientId: clientZinox.id,
      planId: planGrowth.id,
      billingPeriod: "MONTHLY",
      status: "ACTIVE",
      price: 4999,
      startDate: daysAgo(20),
      renewalDate: daysAhead(10),
      paymentReference: "SUB-PAY-2026-002",
    },
  });

  await prisma.subscription.upsert({
    where: { id: "sub-green-01" },
    update: {},
    create: {
      id: "sub-green-01",
      clientId: clientGreenEnergy.id,
      planId: planStarter.id,
      billingPeriod: "MONTHLY",
      status: "ACTIVE",
      price: 1999,
      startDate: daysAgo(12),
      renewalDate: daysAhead(18),
      paymentReference: "SUB-PAY-2026-003",
    },
  });

  // 9b. Business profiles
  console.log("🏢 Seeding business profiles...");
  const businessProfiles = [
    {
      id: "bp-adebayo-01",
      clientId: clientAdebayo.id,
      name: "Adebayo Holdings — Victoria Island",
      category: "Real Estate, Consumer Goods & Logistics",
      location: "Victoria Island, Lagos",
      branchesJson: JSON.stringify([
        "Lekki Phase 1",
        "Ikeja",
        "Port Harcourt GRA",
      ]),
      isPrimary: true,
      status: "VERIFIED" as const,
      createdAt: daysAgo(85),
    },
    {
      id: "bp-adebayo-02",
      clientId: clientAdebayo.id,
      name: "Adebayo Logistics — Port Harcourt",
      category: "Logistics & Distribution",
      location: "Trans-Amadi, Port Harcourt",
      branchesJson: JSON.stringify(["Trans-Amadi", "Woji"]),
      isPrimary: false,
      status: "VERIFIED" as const,
      createdAt: daysAgo(40),
    },
    {
      id: "bp-zinox-01",
      clientId: clientZinox.id,
      name: "Zinox Retail Group",
      category: "Retail & Electronics",
      location: "Port Harcourt, Rivers State",
      branchesJson: JSON.stringify(["Trans-Amadi", "Aba Road"]),
      isPrimary: true,
      status: "VERIFIED" as const,
      createdAt: daysAgo(55),
    },
    {
      id: "bp-green-01",
      clientId: clientGreenEnergy.id,
      name: "GreenEnergy Nigeria",
      category: "Renewable Energy & Solar Power",
      location: "Central Business District, Abuja",
      branchesJson: JSON.stringify(["Abuja CBD", "Lagos Ikeja"]),
      isPrimary: true,
      status: "VERIFIED" as const,
      createdAt: daysAgo(35),
    },
  ];

  for (const profile of businessProfiles) {
    await prisma.businessProfile.upsert({
      where: { id: profile.id },
      update: {},
      create: profile,
    });
  }

  // Link existing campaigns to their business profiles
  await prisma.campaign.updateMany({
    where: { campaignNumber: "CAMP-2026-001" },
    data: { businessProfileId: "bp-adebayo-01" },
  });
  await prisma.campaign.updateMany({
    where: { campaignNumber: "CAMP-2026-002" },
    data: { businessProfileId: "bp-adebayo-01" },
  });
  await prisma.campaign.updateMany({
    where: { campaignNumber: "CAMP-2026-003" },
    data: { businessProfileId: "bp-adebayo-01" },
  });
  await prisma.campaign.updateMany({
    where: { campaignNumber: "CAMP-2026-004" },
    data: { businessProfileId: "bp-green-01" },
  });
  await prisma.campaign.updateMany({
    where: { campaignNumber: "CAMP-2026-005" },
    data: { businessProfileId: "bp-adebayo-01" },
  });

  // Campaign awaiting payment with an accepted itemised quote
  const camp6 = await prisma.campaign.upsert({
    where: { campaignNumber: "CAMP-2026-006" },
    update: {},
    create: {
      campaignNumber: "CAMP-2026-006",
      name: "Q4 Radio & Billboard Blitz",
      channel: ChannelType.FM_RADIO,
      status: CampaignStatus.AWAITING_PAYMENT,
      objective: "Drive festive season store visits and phone enquiries",
      targetLocation: "Lagos & Port Harcourt",
      budget: 220000,
      duration: "2 weeks",
      startDate: daysAhead(2),
      endDate: daysAhead(16),
      productService: "Festive retail bundles",
      targetAudience: "Shoppers and SME owners in Lagos and Port Harcourt",
      contactName: "Olumide Adebayo",
      contactEmail: "client@advers.ng",
      contactPhone: "+234 803 123 4567",
      notes: "Prefer morning drive-time and evening drive-time slots.",
      creativeAssetUrl: "https://assets.advers.ng/creatives/q4-blitz-jingle.wav",
      creativeAssetType: "Broadcast Audio WAV (44.1kHz, 30s)",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      businessProfileId: "bp-adebayo-01",
      inventoryId: invCoolFm.id,
      createdAt: daysAgo(4),
    },
  });

  const engagementAdebayo = await prisma.engagement.upsert({
    where: { id: "eng-101" },
    update: {},
    create: {
      id: "eng-101",
      clientId: clientAdebayo.id,
      type: "DIGITAL_PACKAGE",
      packageId: packageGetVisible.id,
      status: "ONBOARDING_IN_PROGRESS",
      onboardingProgress: 75,
      waitingOnClient: false,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
  });

  const engagementAdebayoCampaign = await prisma.engagement.upsert({
    where: { id: "eng-102" },
    update: {},
    create: {
      id: "eng-102",
      clientId: clientAdebayo.id,
      type: "BILLBOARD",
      packageId: packageMarketDominance.id,
      status: "IN_PRODUCTION",
      onboardingProgress: 40,
      waitingOnClient: true,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(6),
    },
  });

  const engagementZinox = await prisma.engagement.upsert({
    where: { id: "eng-103" },
    update: {},
    create: {
      id: "eng-103",
      clientId: clientZinox.id,
      type: "DIGITAL_PACKAGE",
      packageId: packageLaunchpad.id,
      status: "ACTIVE",
      onboardingProgress: 100,
      waitingOnClient: false,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(3),
    },
  });

  const engagementGreenEnergy = await prisma.engagement.upsert({
    where: { id: "eng-104" },
    update: {},
    create: {
      id: "eng-104",
      clientId: clientGreenEnergy.id,
      type: "ECOSYSTEM",
      packageId: packageGetVisible.id,
      status: "REVIEW",
      onboardingProgress: 90,
      waitingOnClient: false,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: {
      engagementId_stepKey: { engagementId: engagementAdebayo.id, stepKey: "identity" },
    },
    update: {},
    create: {
      engagementId: engagementAdebayo.id,
      stepKey: "identity",
      dataJson: JSON.stringify({
        businessName: "Adebayo Holdings",
        domain: "adebayoholdings.ng",
        email: "hello@adebayoholdings.ng",
      }),
      completedAt: daysAgo(18),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: {
      engagementId_stepKey: { engagementId: engagementAdebayo.id, stepKey: "brand" },
    },
    update: {},
    create: {
      engagementId: engagementAdebayo.id,
      stepKey: "brand",
      dataJson: JSON.stringify({
        colors: "Deep Indigo & Warm Gold",
        tone: "Professional, Modern & Authoritative",
      }),
      completedAt: daysAgo(10),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: {
      engagementId_stepKey: {
        engagementId: engagementAdebayoCampaign.id,
        stepKey: "identity",
      },
    },
    update: {},
    create: {
      engagementId: engagementAdebayoCampaign.id,
      stepKey: "identity",
      dataJson: JSON.stringify({
        campaign: "Q4 Festive Clearance",
        target: "Lekki Toll Plaza",
      }),
      completedAt: daysAgo(9),
    },
  });

  // 10. Leads, quotes and the commercial pipeline
  console.log("🧲 Seeding leads, quotes and pipeline...");
  const leads = [
    {
      id: "lead-001",
      name: "Amaka Nwosu",
      email: "amaka@bellafabrics.ng",
      phone: "+234 803 555 1100",
      company: "Bella Fabrics",
      source: "INSTAGRAM",
      utmSource: "instagram",
      utmCampaign: "q4-fabrics",
      packageInterest: "Get Visible",
      budgetRange: "₦250,000 – ₦450,000",
      timeline: "Within 2 weeks",
      status: "NEW",
      createdAt: daysAgo(2),
    },
    {
      id: "lead-002",
      name: "Ibrahim Musa",
      email: "ibrahim@northstar.ng",
      phone: "+234 806 222 3344",
      company: "Northstar Logistics",
      source: "GOOGLE",
      utmSource: "google",
      utmCampaign: "billboard-search",
      packageInterest: "Market Dominance",
      budgetRange: "₦750,000+",
      timeline: "This month",
      status: "QUALIFIED",
      createdAt: daysAgo(5),
    },
    {
      id: "lead-003",
      name: "Grace Etim",
      email: "grace@freshmart.ng",
      phone: "+234 807 888 9900",
      company: "FreshMart Stores",
      source: "REFERRAL",
      utmSource: "referral",
      packageInterest: "Launchpad",
      budgetRange: "₦150,000 – ₦200,000",
      timeline: "Next month",
      status: "QUOTED",
      createdAt: daysAgo(8),
    },
    {
      id: "lead-004",
      name: "Tunde Balogun",
      email: "tunde@swifttelecom.ng",
      phone: "+234 809 111 2233",
      company: "Swift Telecom",
      source: "WEBSITE",
      utmSource: "organic",
      packageInterest: "Get Visible",
      budgetRange: "₦250,000 – ₦450,000",
      timeline: "Within 2 weeks",
      status: "NEW",
      createdAt: daysAgo(1),
    },
    {
      id: "lead-005",
      name: "Halima Bello",
      email: "halima@zariafoods.ng",
      phone: "+234 810 444 5566",
      company: "Zaria Foods",
      source: "WHATSAPP",
      utmSource: "whatsapp",
      packageInterest: "Market Dominance",
      budgetRange: "₦750,000+",
      timeline: "This quarter",
      status: "QUALIFIED",
      createdAt: daysAgo(11),
    },
    {
      id: "lead-006",
      name: "Emeka Obi",
      email: "emeka@lagosautohub.ng",
      phone: "+234 811 777 8899",
      company: "Lagos Auto Hub",
      source: "WEBSITE",
      utmSource: "organic",
      packageInterest: "Get Visible",
      budgetRange: "₦250,000 – ₦450,000",
      timeline: "Within 2 weeks",
      status: "CONVERTED",
      createdAt: daysAgo(30),
    },
    {
      id: "lead-007",
      name: "Fatima Yusuf",
      email: "fatima@greenleaf.ng",
      phone: "+234 812 333 4455",
      company: "GreenLeaf Farms",
      source: "INSTAGRAM",
      utmSource: "instagram",
      utmCampaign: "agro-awareness",
      packageInterest: "Launchpad",
      budgetRange: "₦150,000 – ₦200,000",
      timeline: "Next month",
      status: "NEW",
      createdAt: daysAgo(3),
    },
    {
      id: "lead-008",
      name: "David Adeleke",
      email: "david@primeevents.ng",
      phone: "+234 813 666 7788",
      company: "Prime Events",
      source: "REFERRAL",
      utmSource: "referral",
      packageInterest: "Market Dominance",
      budgetRange: "₦750,000+",
      timeline: "This month",
      status: "QUALIFIED",
      createdAt: daysAgo(14),
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: {},
      create: lead,
    });
  }

  const quotes = [
    {
      id: "quote-001",
      quoteNumber: "QUO-2026-001",
      leadId: "lead-003",
      title: "FreshMart Launchpad Brand Foundation",
      amount: 180000,
      status: "SENT" as const,
      sentAt: daysAgo(6),
      expiresAt: daysAhead(7),
    },
    {
      id: "quote-002",
      quoteNumber: "QUO-2026-002",
      leadId: "lead-002",
      title: "Northstar Billboard + Radio Launch",
      amount: 950000,
      status: "VIEWED" as const,
      openedAt: daysAgo(2),
      sentAt: daysAgo(4),
      expiresAt: daysAhead(10),
    },
    {
      id: "quote-003",
      quoteNumber: "QUO-2026-003",
      leadId: "lead-005",
      title: "Zaria Foods Market Dominance Retainer",
      amount: 1250000,
      status: "ACCEPTED" as const,
      openedAt: daysAgo(9),
      sentAt: daysAgo(10),
      expiresAt: daysAhead(20),
    },
    {
      id: "quote-004",
      quoteNumber: "QUO-2026-004",
      leadId: "lead-001",
      title: "Bella Fabrics Get Visible Website",
      amount: 350000,
      status: "SENT" as const,
      sentAt: daysAgo(5),
      expiresAt: daysAhead(5),
    },
    {
      id: "quote-005",
      quoteNumber: "QUO-2026-005",
      leadId: "lead-007",
      title: "GreenLeaf Farms Launchpad Package",
      amount: 165000,
      status: "EXPIRED" as const,
      sentAt: daysAgo(25),
      expiresAt: daysAgo(4),
    },
    {
      id: "quote-camp-001",
      quoteNumber: "QTE-2026-001",
      campaignId: camp6.id,
      clientId: clientAdebayo.id,
      title: "Campaign quote: Q4 Radio & Billboard Blitz",
      amount: 220000,
      mediaCost: 160000,
      adversFee: 40000,
      productionCost: 15000,
      logisticsCost: 5000,
      smsCost: 0,
      taxAmount: 0,
      bookingReference: "BOOK-2026-001",
      notes: "Includes morning and evening drive-time spots.",
      status: "ACCEPTED" as const,
      sentAt: daysAgo(3),
      approvedAt: daysAgo(1),
      expiresAt: daysAhead(4),
    },
  ];

  for (const quote of quotes) {
    await prisma.quote.upsert({
      where: { quoteNumber: quote.quoteNumber },
      update: {},
      create: quote,
    });
  }

  const invoices = [
    {
      id: "inv-2026-001",
      invoiceNumber: "INV-2026-001",
      clientId: clientAdebayo.id,
      engagementId: engagementAdebayo.id,
      userId: clientUser.id,
      title: "Get Visible — Website & Brand Suite",
      amount: 350000,
      serviceType: "DIGITAL_PACKAGE",
      status: "PAID" as const,
      dueDate: daysAgo(18),
      paidAt: daysAgo(17),
      createdAt: daysAgo(25),
    },
    {
      id: "inv-2026-002",
      invoiceNumber: "INV-2026-002",
      clientId: clientAdebayo.id,
      engagementId: engagementAdebayoCampaign.id,
      userId: clientUser.id,
      title: "Lekki Toll DOOH — 2 Week Flight",
      amount: 350000,
      serviceType: "BILLBOARD",
      status: "PAID" as const,
      dueDate: daysAgo(10),
      paidAt: daysAgo(9),
      createdAt: daysAgo(16),
    },
    {
      id: "inv-2026-003",
      invoiceNumber: "INV-2026-003",
      clientId: clientZinox.id,
      engagementId: engagementZinox.id,
      title: "Launchpad Brand Foundation",
      amount: 180000,
      serviceType: "DIGITAL_PACKAGE",
      status: "PAID" as const,
      dueDate: daysAgo(35),
      paidAt: daysAgo(34),
      createdAt: daysAgo(40),
    },
    {
      id: "inv-2026-004",
      invoiceNumber: "INV-2026-004",
      clientId: clientGreenEnergy.id,
      engagementId: engagementGreenEnergy.id,
      title: "Ecosystem Growth Retainer — Q4",
      amount: 450000,
      serviceType: "ECOSYSTEM",
      status: "PENDING" as const,
      dueDate: daysAhead(7),
      createdAt: daysAgo(5),
    },
    {
      id: "inv-2026-005",
      invoiceNumber: "INV-2026-005",
      clientId: clientAdebayo.id,
      engagementId: engagementAdebayo.id,
      title: "Website Care Plan Renewal",
      amount: 120000,
      serviceType: "CARE_PLAN",
      status: "OVERDUE" as const,
      dueDate: daysAgo(6),
      createdAt: daysAgo(20),
    },
    {
      id: "inv-2026-006",
      invoiceNumber: "INV-2026-006",
      clientId: clientZinox.id,
      engagementId: engagementZinox.id,
      title: "Radio Drive-Time Campaign — Rivers",
      amount: 120000,
      serviceType: "BILLBOARD",
      status: "OVERDUE" as const,
      dueDate: daysAgo(3),
      createdAt: daysAgo(15),
    },
    {
      id: "inv-sub-001",
      invoiceNumber: "SUB-2026-001",
      clientId: clientAdebayo.id,
      userId: clientUser.id,
      title: "Business Pro Access — annual",
      amount: 99990,
      serviceType: "SUBSCRIPTION",
      status: "PAID" as const,
      dueDate: daysAgo(30),
      paidAt: daysAgo(30),
      createdAt: daysAgo(30),
    },
    {
      id: "inv-camp-001",
      invoiceNumber: "CAMP-INV-2026-001",
      clientId: clientAdebayo.id,
      campaignId: camp6.id,
      userId: clientUser.id,
      title: "Campaign: Q4 Radio & Billboard Blitz",
      amount: 220000,
      serviceType: "CAMPAIGN",
      status: "PENDING" as const,
      dueDate: daysAhead(2),
      createdAt: daysAgo(1),
    },
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: invoice.invoiceNumber },
      update: {},
      create: invoice,
    });
  }

  const payments = [
    {
      id: "pay-2026-001",
      invoiceId: "inv-2026-001",
      amount: 350000,
      paymentMethod: "PAYSTACK",
      reference: "PAY-2026-001",
      status: "SUCCESS" as const,
      createdAt: daysAgo(17),
    },
    {
      id: "pay-2026-002",
      invoiceId: "inv-2026-002",
      amount: 350000,
      paymentMethod: "PAYSTACK",
      reference: "PAY-2026-002",
      status: "SUCCESS" as const,
      createdAt: daysAgo(9),
    },
    {
      id: "pay-2026-003",
      invoiceId: "inv-2026-003",
      amount: 180000,
      paymentMethod: "BANK_TRANSFER",
      reference: "PAY-2026-003",
      status: "SUCCESS" as const,
      createdAt: daysAgo(34),
    },
    {
      id: "pay-sub-001",
      invoiceId: "inv-sub-001",
      amount: 99990,
      paymentMethod: "PAYSTACK",
      reference: "SUB-PAY-2026-001",
      status: "SUCCESS" as const,
      createdAt: daysAgo(30),
    },
  ];

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { reference: payment.reference },
      update: {},
      create: payment,
    });
  }

  const renewals = [
    {
      id: "ren-001",
      clientId: clientAdebayo.id,
      engagementId: engagementAdebayo.id,
      title: "Website Care Plan Renewal",
      amount: 120000,
      renewalDate: daysAhead(12),
      status: "UPCOMING" as const,
    },
    {
      id: "ren-002",
      clientId: clientZinox.id,
      engagementId: engagementZinox.id,
      title: "Digital Package Annual Renewal",
      amount: 180000,
      renewalDate: daysAhead(25),
      status: "UPCOMING" as const,
    },
    {
      id: "ren-003",
      clientId: clientGreenEnergy.id,
      engagementId: engagementGreenEnergy.id,
      title: "Ecosystem Growth Retainer Renewal",
      amount: 450000,
      renewalDate: daysAhead(40),
      status: "UPCOMING" as const,
    },
  ];

  for (const renewal of renewals) {
    await prisma.renewal.upsert({
      where: { id: renewal.id },
      update: {},
      create: renewal,
    });
  }

  // 11. Inbox / feedback records
  console.log("📨 Seeding enquiry inbox records...");
  const feedbackItems = [
    {
      id: "fb-001",
      type: "BILLBOARD_ENQUIRY" as const,
      status: "NEW" as const,
      name: "Ngozi Eze",
      email: "ngozi@ezenaturals.ng",
      phone: "+234 803 111 2233",
      company: "Eze Naturals",
      message:
        "We want to run a 2-week digital billboard campaign around Lekki and Victoria Island. Please share availability and rates.",
      packageInterest: "Market Dominance",
      source: "WEBSITE",
      createdAt: daysAgo(2),
    },
    {
      id: "fb-002",
      type: "ENQUIRY" as const,
      status: "NEW" as const,
      name: "Samuel Adeyemi",
      email: "samuel@brightpath.ng",
      phone: "+234 806 444 5566",
      company: "BrightPath Academy",
      message:
        "We need a new website and brand refresh before the next admission cycle. What is the timeline for Get Visible?",
      packageInterest: "Get Visible",
      source: "INSTAGRAM",
      createdAt: daysAgo(1),
    },
    {
      id: "fb-003",
      type: "ENQUIRY" as const,
      status: "NEW" as const,
      name: "Aisha Lawal",
      email: "aisha@modestyles.ng",
      phone: "+234 807 222 3344",
      company: "Mode Styles",
      message:
        "Please send a quote for a launch campaign across radio and Instagram. We are launching next month.",
      packageInterest: "Launchpad",
      source: "REFERRAL",
      createdAt: daysAgo(3),
    },
    {
      id: "fb-004",
      type: "FEEDBACK" as const,
      status: "REPLIED" as const,
      name: "Chinedu Okeke",
      email: "chinedu@primeautos.ng",
      phone: "+234 808 555 6677",
      company: "Prime Autos",
      message:
        "The website looks great and the team was responsive. We would like to discuss billboard options next quarter.",
      packageInterest: "Get Visible",
      source: "WEBSITE",
      rating: 5,
      repliedAt: daysAgo(2),
      createdAt: daysAgo(4),
    },
    {
      id: "fb-005",
      type: "COMPLAINT" as const,
      status: "IN_REVIEW" as const,
      name: "Blessing Okafor",
      email: "blessing@urbanfit.ng",
      phone: "+234 809 888 9900",
      company: "UrbanFit Gym",
      message:
        "One of the radio spots ran later than the agreed drive-time window. Please review the broadcast log.",
      packageInterest: "Market Dominance",
      source: "EMAIL",
      createdAt: daysAgo(2),
    },
    {
      id: "fb-006",
      type: "OTHER" as const,
      status: "RESOLVED" as const,
      name: "Peter Uche",
      email: "peter@lagosprints.ng",
      phone: "+234 810 222 3344",
      company: "Lagos Prints",
      message:
        "We are a printing press interested in joining the Advers Booster network. How do we register?",
      source: "WEBSITE",
      createdAt: daysAgo(12),
      repliedAt: daysAgo(11),
    },
  ];

  for (const feedback of feedbackItems) {
    await prisma.feedback.upsert({
      where: { id: feedback.id },
      update: {},
      create: feedback,
    });
  }

  // 11b. Campaign status timeline events
  console.log("🕒 Seeding campaign status timeline...");
  const campaignStatusEvents = [
    {
      id: "cse-001",
      campaignId: camp1.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(7),
    },
    {
      id: "cse-002",
      campaignId: camp1.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: adminUser.id,
      note: "Campaign moved into review.",
      createdAt: daysAgo(6),
    },
    {
      id: "cse-003",
      campaignId: camp1.id,
      fromStatus: CampaignStatus.UNDER_REVIEW,
      toStatus: CampaignStatus.CONFIRMED,
      actorId: adminUser.id,
      note: "Media partner confirmed the Port Harcourt slot.",
      createdAt: daysAgo(5),
    },
    {
      id: "cse-004",
      campaignId: camp1.id,
      fromStatus: CampaignStatus.CONFIRMED,
      toStatus: CampaignStatus.IN_PROGRESS,
      actorId: adminUser.id,
      note: "Campaign went live.",
      createdAt: daysAgo(5),
    },
    {
      id: "cse-005",
      campaignId: camp2.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(3),
    },
    {
      id: "cse-006",
      campaignId: camp2.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: adminUser.id,
      note: "Audio loudness clearance requested.",
      createdAt: daysAgo(2),
    },
    {
      id: "cse-007",
      campaignId: camp2.id,
      fromStatus: CampaignStatus.UNDER_REVIEW,
      toStatus: CampaignStatus.CONFIRMED,
      actorId: adminUser.id,
      note: "Approved for Cool FM broadcast.",
      createdAt: daysAgo(1),
    },
    {
      id: "cse-008",
      campaignId: camp3.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(14),
    },
    {
      id: "cse-009",
      campaignId: camp3.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.IN_PROGRESS,
      actorId: adminUser.id,
      note: "Lekki Toll screen confirmed and live.",
      createdAt: daysAgo(12),
    },
    {
      id: "cse-010",
      campaignId: camp4.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(1),
    },
    {
      id: "cse-011",
      campaignId: camp4.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: adminUser.id,
      note: "Creative and ARCON details under review.",
      createdAt: daysAgo(0.5),
    },
    {
      id: "cse-012",
      campaignId: camp5.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(22),
    },
    {
      id: "cse-013",
      campaignId: camp5.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.COMPLETED,
      actorId: adminUser.id,
      note: "Public notice published and tearsheet verified.",
      createdAt: daysAgo(18),
    },
    {
      id: "cse-014",
      campaignId: camp6.id,
      fromStatus: null,
      toStatus: CampaignStatus.SUBMITTED,
      actorId: clientUser.id,
      note: "Campaign submitted for review.",
      createdAt: daysAgo(4),
    },
    {
      id: "cse-015",
      campaignId: camp6.id,
      fromStatus: CampaignStatus.SUBMITTED,
      toStatus: CampaignStatus.UNDER_REVIEW,
      actorId: adminUser.id,
      note: "Campaign moved into review.",
      createdAt: daysAgo(4),
    },
    {
      id: "cse-016",
      campaignId: camp6.id,
      fromStatus: CampaignStatus.UNDER_REVIEW,
      toStatus: CampaignStatus.QUOTE_REQUIRED,
      actorId: adminUser.id,
      note: "Quote preparation started.",
      createdAt: daysAgo(3),
    },
    {
      id: "cse-017",
      campaignId: camp6.id,
      fromStatus: CampaignStatus.QUOTE_REQUIRED,
      toStatus: CampaignStatus.AWAITING_APPROVAL,
      actorId: adminUser.id,
      note: "Quote QTE-2026-001 issued to the advertiser.",
      createdAt: daysAgo(3),
    },
    {
      id: "cse-018",
      campaignId: camp6.id,
      fromStatus: CampaignStatus.AWAITING_APPROVAL,
      toStatus: CampaignStatus.AWAITING_PAYMENT,
      actorId: clientUser.id,
      note: "Advertiser approved the quote. Awaiting payment.",
      createdAt: daysAgo(1),
    },
  ];

  for (const event of campaignStatusEvents) {
    await prisma.campaignStatusEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  // 12. Activity and audit trail
  console.log("🧾 Seeding activity and audit trails...");
  const activityLogs = [
    {
      id: "act-001",
      userId: adminUser.id,
      action: "LOGIN",
      description: "Advers Chief Media Controller signed in to the admin workspace.",
      createdAt: daysAgo(0.2),
    },
    {
      id: "act-002",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      action: "CAMPAIGN_SUBMITTED",
      description: "Olumide Adebayo submitted the Summer Product Launch campaign.",
      createdAt: daysAgo(7),
    },
    {
      id: "act-003",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      action: "PAYMENT_SUCCESS",
      description: "Payment of ₦350,000 received for INV-2026-001.",
      createdAt: daysAgo(17),
    },
    {
      id: "act-004",
      userId: staffUser.id,
      action: "PROOF_VERIFIED",
      description: "Bisi Akande verified the Lekki Toll night-time playback proof.",
      createdAt: daysAgo(10),
    },
    {
      id: "act-005",
      userId: adminUser.id,
      action: "CAMPAIGN_APPROVED",
      description: "Brand Awareness Drive was approved for Cool FM broadcast.",
      createdAt: daysAgo(3),
    },
    {
      id: "act-006",
      userId: clientUser.id,
      clientId: clientAdebayo.id,
      action: "PROFILE_UPDATED",
      description: "Adebayo Holdings updated its business profile details.",
      createdAt: daysAgo(5),
    },
    {
      id: "act-007",
      userId: newClientUser.id,
      action: "SIGNUP",
      description: "Chidi Okafor created a new Advers account.",
      createdAt: daysAgo(1),
    },
    {
      id: "act-008",
      userId: staffUser.id,
      action: "INVOICE_REMINDER_SENT",
      description: "Payment reminder sent for overdue invoice INV-2026-005.",
      createdAt: daysAgo(2),
    },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.upsert({
      where: { id: log.id },
      update: {},
      create: log,
    });
  }

  const auditLogs = [
    {
      id: "audit-001",
      actorId: adminUser.id,
      action: "CAMPAIGN_STATUS_CHANGED",
      targetType: "Campaign",
      targetId: "CAMP-2026-002",
      details: "Status changed from PENDING_REVIEW to APPROVED.",
      createdAt: daysAgo(3),
    },
    {
      id: "audit-002",
      actorId: adminUser.id,
      action: "USER_ROLE_CHANGED",
      targetType: "User",
      targetId: staffUser.id,
      details: "Staff role confirmed for Bisi Akande.",
      createdAt: daysAgo(20),
    },
    {
      id: "audit-003",
      actorId: adminUser.id,
      action: "PAYMENT_APPROVED",
      targetType: "Invoice",
      targetId: "inv-2026-003",
      details: "Manual bank transfer confirmed and reconciled.",
      createdAt: daysAgo(34),
    },
    {
      id: "audit-004",
      actorId: adminUser.id,
      action: "PROOF_APPROVED",
      targetType: "ProofOfPerformance",
      targetId: "POP-901",
      details: "Day-time playback photo approved for client dashboard.",
      createdAt: daysAgo(4),
    },
    {
      id: "audit-005",
      actorId: adminUser.id,
      action: "INVITATION_SENT",
      targetType: "Invitation",
      targetId: "invite-demo-001",
      details: "Invitation sent to invited@advers.ng.",
      createdAt: daysAgo(2),
    },
  ];

  for (const audit of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: audit.id },
      update: {},
      create: audit,
    });
  }

  // 13. Demo invitation (token: demo-token)
  console.log("✉️ Seeding demo invitation...");
  const demoTokenHash = createHash("sha256").update("demo-token").digest("hex");
  await prisma.invitation.upsert({
    where: { tokenHash: demoTokenHash },
    update: {},
    create: {
      id: "invite-demo-001",
      email: "invited@advers.ng",
      tokenHash: demoTokenHash,
      clientId: clientAdebayo.id,
      orgRole: "MEMBER",
      invitedById: adminUser.id,
      expiresAt: daysAhead(14),
      createdAt: daysAgo(2),
    },
  });

  // 14. Booster marketplace
  console.log("🧑‍🔧 Seeding Booster profiles, jobs, applications and proof...");

  const boosterUserSeed = async (input: {
    id: string;
    email: string;
    name: string;
    phone: string;
  }) =>
    prisma.user.upsert({
      where: { email: input.email },
      update: { passwordHash },
      create: {
        id: input.id,
        email: input.email,
        name: input.name,
        phone: input.phone,
        passwordHash,
        role: "CLIENT",
        orgRole: "OWNER",
        status: "ACTIVE",
        source: "BOOSTER",
        profileCompleteAt: daysAgo(30),
        lastLoginAt: daysAgo(0.2),
        createdAt: daysAgo(30),
      },
    });

  const boosterCreativeUser = await boosterUserSeed({
    id: "usr-booster-creative",
    email: "booster@advers.ng",
    name: "Chukwudi Eze",
    phone: "+234 806 555 1234",
  });
  const boosterFieldUser = await boosterUserSeed({
    id: "usr-booster-field",
    email: "booster.field@advers.ng",
    name: "Blessing Johnson",
    phone: "+234 813 888 4321",
  });
  const boosterPrintUser = await boosterUserSeed({
    id: "usr-booster-print",
    email: "booster.print@advers.ng",
    name: "Lagos Prints",
    phone: "+234 810 222 3344",
  });
  const boosterIntelUser = await boosterUserSeed({
    id: "usr-booster-intel",
    email: "booster.intel@advers.ng",
    name: "Amaka Nwosu",
    phone: "+234 803 555 1100",
  });
  const boosterTechUser = await boosterUserSeed({
    id: "usr-booster-tech",
    email: "booster.tech@advers.ng",
    name: "Tunde Balogun",
    phone: "+234 809 111 2233",
  });
  const boosterSalesUser = await boosterUserSeed({
    id: "usr-booster-sales",
    email: "booster.sales@advers.ng",
    name: "Ibrahim Musa",
    phone: "+234 806 222 3344",
  });
  const boosterLogisticsUser = await boosterUserSeed({
    id: "usr-booster-logistics",
    email: "booster.logistics@advers.ng",
    name: "Swift Delivery",
    phone: "+234 807 444 5566",
  });
  const boosterVoiceUser = await boosterUserSeed({
    id: "usr-booster-voice",
    email: "booster.voice@advers.ng",
    name: "Grace Etim",
    phone: "+234 807 888 9900",
  });

  const boosterProfiles = [
    {
      id: "booster-creative-01",
      userId: boosterCreativeUser.id,
      displayName: "Chukwudi Eze",
      businessName: null,
      bio: "Creative designer and video editor with 6+ years of experience across brand, retail and campaign design.",
      isBusiness: false,
      categoriesJson: JSON.stringify(["CREATIVE", "PRODUCTION"]),
      skillsJson: JSON.stringify([
        "Graphic design",
        "Video editing",
        "Copywriting",
        "Adobe Illustrator",
      ]),
      coverageJson: JSON.stringify(["Lagos", "Remote"]),
      portfolioJson: JSON.stringify([
        {
          title: "Q4 retail campaign",
          url: "https://assets.advers.ng/boosters/chuks-retail.pdf",
          description: "Flyers, banners and social cutdowns.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "Flyer design", amount: "₦35,000" },
        { label: "Video edit (30s)", amount: "₦90,000" },
      ]),
      availableHours: "Mon–Sat, 9am–7pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.8,
      ratingCount: 12,
      completedJobs: 14,
    },
    {
      id: "booster-field-01",
      userId: boosterFieldUser.id,
      displayName: "Blessing Johnson",
      businessName: "Blessing Field Network",
      bio: "Field marketing lead coordinating street activations, sampling and campus campaigns.",
      isBusiness: true,
      categoriesJson: JSON.stringify(["FIELD_MARKETING", "SALES_CONVERSION"]),
      skillsJson: JSON.stringify([
        "Street activation",
        "Sampling",
        "Lead capture",
        "Team coordination",
      ]),
      coverageJson: JSON.stringify(["Lagos", "Port Harcourt", "Abuja"]),
      portfolioJson: JSON.stringify([
        {
          title: "Lekki activation",
          url: "https://assets.advers.ng/boosters/lekki-activation.jpg",
          description: "3-day brand activation with 18 field agents.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "Field activation (per day)", amount: "₦45,000" },
      ]),
      availableHours: "Mon–Sun, 8am–8pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.7,
      ratingCount: 9,
      completedJobs: 11,
    },
    {
      id: "booster-print-01",
      userId: boosterPrintUser.id,
      displayName: "Lagos Prints",
      businessName: "Lagos Prints Limited",
      bio: "Large-format printing, flyers, banners and branded materials with same-week delivery.",
      isBusiness: true,
      categoriesJson: JSON.stringify(["PRODUCTION", "DISTRIBUTION"]),
      skillsJson: JSON.stringify([
        "Large format printing",
        "Flyers",
        "Banners",
        "Packaging",
      ]),
      coverageJson: JSON.stringify(["Lagos", "Ogun", "Oyo"]),
      portfolioJson: JSON.stringify([
        {
          title: "500 A5 flyers",
          url: "https://assets.advers.ng/boosters/lagos-prints-flyers.jpg",
          description: "Full-colour flyers delivered in 48 hours.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "500 A5 flyers", amount: "₦120,000" },
        { label: "3m x 1m banner", amount: "₦65,000" },
      ]),
      availableHours: "Mon–Fri, 8am–6pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.9,
      ratingCount: 21,
      completedJobs: 34,
    },
    {
      id: "booster-intel-01",
      userId: boosterIntelUser.id,
      displayName: "Amaka Nwosu",
      businessName: null,
      bio: "Location intelligence and billboard verification specialist.",
      isBusiness: false,
      categoriesJson: JSON.stringify(["INTELLIGENCE"]),
      skillsJson: JSON.stringify([
        "Billboard scouting",
        "Price checks",
        "Location reports",
        "Audit",
      ]),
      coverageJson: JSON.stringify(["Lagos", "South-East Nigeria"]),
      portfolioJson: JSON.stringify([]),
      ratesJson: JSON.stringify([
        { label: "Billboard verification", amount: "₦6,000" },
      ]),
      availableHours: "Flexible",
      verificationStatus: "PENDING" as const,
      verificationLevel: "Standard",
      verificationDocumentsJson: JSON.stringify([
        "https://assets.advers.ng/boosters/amaka-id.pdf",
        "https://assets.advers.ng/boosters/amaka-portfolio.pdf",
      ]),
      status: "ACTIVE" as const,
      ratingAvg: 4.6,
      ratingCount: 5,
      completedJobs: 7,
    },
    {
      id: "booster-tech-01",
      userId: boosterTechUser.id,
      displayName: "Tunde Balogun",
      businessName: "Swift Technical Services",
      bio: "LED screen installation, event production and technical verification.",
      isBusiness: true,
      categoriesJson: JSON.stringify(["EXPERIENCE_TECHNOLOGY"]),
      skillsJson: JSON.stringify([
        "LED installation",
        "Event production",
        "Electrical",
        "Livestream",
      ]),
      coverageJson: JSON.stringify(["Lagos", "Port Harcourt", "Abuja"]),
      portfolioJson: JSON.stringify([
        {
          title: "LED stage install",
          url: "https://assets.advers.ng/boosters/led-install.jpg",
          description: "Outdoor LED wall for a 500-guest launch.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "LED install", amount: "₦200,000" },
      ]),
      availableHours: "Mon–Sat, 7am–9pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.8,
      ratingCount: 8,
      completedJobs: 9,
    },
    {
      id: "booster-sales-01",
      userId: boosterSalesUser.id,
      displayName: "Ibrahim Musa",
      businessName: null,
      bio: "Business development and qualified lead generation across retail and hospitality.",
      isBusiness: false,
      categoriesJson: JSON.stringify(["SALES_CONVERSION"]),
      skillsJson: JSON.stringify([
        "Lead generation",
        "Business development",
        "Partnerships",
      ]),
      coverageJson: JSON.stringify(["Port Harcourt", "Abuja", "Remote"]),
      portfolioJson: JSON.stringify([]),
      ratesJson: JSON.stringify([
        { label: "Qualified lead", amount: "₦10,000" },
      ]),
      availableHours: "Mon–Fri, 9am–6pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.7,
      ratingCount: 6,
      completedJobs: 8,
    },
    {
      id: "booster-logistics-01",
      userId: boosterLogisticsUser.id,
      displayName: "Swift Delivery",
      businessName: "Swift Delivery Logistics",
      bio: "Same-day and interstate dispatch for campaign materials and equipment.",
      isBusiness: true,
      categoriesJson: JSON.stringify(["DISTRIBUTION"]),
      skillsJson: JSON.stringify([
        "Dispatch riding",
        "Interstate delivery",
        "Warehousing",
      ]),
      coverageJson: JSON.stringify(["Lagos", "South-West", "South-South"]),
      portfolioJson: JSON.stringify([]),
      ratesJson: JSON.stringify([
        { label: "Lagos same-day delivery", amount: "₦15,000" },
      ]),
      availableHours: "Mon–Sun, 7am–8pm WAT",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.5,
      ratingCount: 14,
      completedJobs: 22,
    },
    {
      id: "booster-voice-01",
      userId: boosterVoiceUser.id,
      displayName: "Grace Etim",
      businessName: null,
      bio: "Voice-over artist and audio producer for radio, TV and digital campaigns.",
      isBusiness: false,
      categoriesJson: JSON.stringify(["CREATIVE"]),
      skillsJson: JSON.stringify([
        "Voice-over",
        "Radio jingle",
        "Audio production",
      ]),
      coverageJson: JSON.stringify(["Remote", "Lagos"]),
      portfolioJson: JSON.stringify([
        {
          title: "Radio jingle reel",
          url: "https://assets.advers.ng/boosters/grace-jingle-reel.mp3",
          description: "Selected 15s and 30s jingle samples.",
        },
      ]),
      ratesJson: JSON.stringify([
        { label: "30s jingle", amount: "₦70,000" },
      ]),
      availableHours: "Flexible",
      verificationStatus: "VERIFIED" as const,
      status: "ACTIVE" as const,
      ratingAvg: 4.9,
      ratingCount: 18,
      completedJobs: 25,
    },
  ];

  for (const profile of boosterProfiles) {
    await prisma.boosterProfile.upsert({
      where: { userId: profile.userId },
      update: {},
      create: profile,
    });
  }

  const boosterJobs = [
    {
      jobNumber: "BJOB-2026-001",
      category: "CREATIVE" as const,
      title: "Design 3 campaign flyers",
      description:
        "Create three print-ready flyers for the Q4 festive campaign. Adhere to the supplied brand guidelines and include a social cutdown of each design.",
      scope:
        "3 flyer designs, 2 revisions each, source files and print-ready PDFs.",
      location: "Remote",
      isRemote: true,
      deadline: daysAhead(5),
      budget: 80000,
      paymentModel: "FIXED" as const,
      proofRequirementsJson: JSON.stringify([
        "Print-ready PDF",
        "Source files",
        "Brand approval screenshot",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Graphic design",
        "Adobe Illustrator",
        "Brand consistency",
      ]),
      verificationLevel: "Verified",
      status: "APPLICATIONS_OPEN" as const,
      publishedAt: daysAgo(2),
      clientId: clientAdebayo.id,
      campaignId: camp1.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-002",
      category: "PRODUCTION" as const,
      title: "Print 500 A5 flyers",
      description:
        "Print 500 full-colour A5 flyers on 150gsm paper. Deliver to the Advers Lagos office.",
      scope: "500 A5 flyers, full colour, 150gsm, delivery included.",
      location: "Lagos",
      isRemote: false,
      deadline: daysAhead(7),
      budget: 120000,
      paymentModel: "PER_ORDER" as const,
      proofRequirementsJson: JSON.stringify([
        "Production photos",
        "Delivery note",
      ]),
      requiredSkillsJson: JSON.stringify(["Offset printing", "Flyers", "Delivery"]),
      verificationLevel: "Verified",
      status: "APPLICATIONS_OPEN" as const,
      publishedAt: daysAgo(2),
      clientId: clientAdebayo.id,
      campaignId: camp1.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-003",
      category: "LOGISTICS" as const,
      title: "Deliver flyers to 5 Lagos locations",
      description:
        "Collect printed flyers from the printer and deliver to five retail locations in Lagos.",
      scope: "5 delivery points, proof of delivery at each location.",
      location: "Lagos",
      isRemote: false,
      deadline: daysAhead(3),
      budget: 45000,
      paymentModel: "PER_DELIVERY" as const,
      proofRequirementsJson: JSON.stringify([
        "Photo at each drop-off",
        "Recipient name and signature",
      ]),
      requiredSkillsJson: JSON.stringify(["Dispatch", "Route planning"]),
      verificationLevel: "Standard",
      status: "APPLICATIONS_OPEN" as const,
      publishedAt: daysAgo(2),
      clientId: clientAdebayo.id,
      campaignId: camp1.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-004",
      category: "FIELD_MARKETING" as const,
      title: "Street activation at Lekki Toll",
      description:
        "Run a 2-day street activation with 4 agents, distribute samples and capture qualified leads.",
      scope: "2 days, 4 agents, 200 samples, lead capture sheet.",
      location: "Lagos",
      isRemote: false,
      deadline: daysAhead(10),
      budget: 150000,
      paymentModel: "PER_TASK" as const,
      proofRequirementsJson: JSON.stringify([
        "Photos and videos of activation",
        "Lead capture sheet",
        "Daily activity report",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Street activation",
        "Lead capture",
        "Team supervision",
      ]),
      verificationLevel: "Verified",
      status: "ASSIGNED" as const,
      publishedAt: daysAgo(5),
      clientId: clientAdebayo.id,
      campaignId: camp3.id,
      businessProfileId: "bp-adebayo-01",
      assignedBoosterId: "booster-field-01",
    },
    {
      jobNumber: "BJOB-2026-005",
      category: "INTELLIGENCE" as const,
      title: "Verify 10 billboard locations",
      description:
        "Visit 10 billboard locations, capture timestamped photos and confirm availability and current rates.",
      scope: "10 locations, photo evidence, rate confirmation and report.",
      location: "Lagos",
      isRemote: false,
      deadline: daysAhead(8),
      budget: 60000,
      paymentModel: "PER_VERIFICATION" as const,
      proofRequirementsJson: JSON.stringify([
        "Timestamped photos",
        "GPS location",
        "Rate confirmation",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Billboard scouting",
        "Photo documentation",
        "Reporting",
      ]),
      verificationLevel: "Verified",
      status: "APPLICATIONS_OPEN" as const,
      publishedAt: daysAgo(1),
      clientId: clientAdebayo.id,
      campaignId: camp3.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-006",
      category: "TECHNICAL" as const,
      title: "Install LED screen at event",
      description:
        "Install and operate a 3m x 2m LED screen for a one-day retail event in Port Harcourt.",
      scope: "LED wall, rigging, operator and dismantling.",
      location: "Port Harcourt",
      isRemote: false,
      deadline: daysAhead(4),
      budget: 200000,
      paymentModel: "FIXED" as const,
      proofRequirementsJson: JSON.stringify([
        "Installation photos",
        "Signed handover",
        "Event playback video",
      ]),
      requiredSkillsJson: JSON.stringify([
        "LED installation",
        "Event production",
        "Electrical safety",
      ]),
      verificationLevel: "Verified",
      status: "IN_PROGRESS" as const,
      publishedAt: daysAgo(6),
      clientId: clientZinox.id,
      campaignId: camp2.id,
      businessProfileId: "bp-zinox-01",
      assignedBoosterId: "booster-tech-01",
    },
    {
      jobNumber: "BJOB-2026-007",
      category: "SALES_REFERRALS" as const,
      title: "Introduce 5 restaurant leads",
      description:
        "Identify and introduce five independent restaurants in Port Harcourt that could benefit from a festive advertising package.",
      scope: "5 qualified introductions with contact details and notes.",
      location: "Port Harcourt",
      isRemote: false,
      deadline: daysAhead(12),
      budget: 50000,
      paymentModel: "PER_LEAD" as const,
      proofRequirementsJson: JSON.stringify([
        "Lead name and contact",
        "Introduction confirmation",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Lead generation",
        "Business development",
      ]),
      verificationLevel: "Standard",
      status: "APPLICATIONS_OPEN" as const,
      publishedAt: daysAgo(1),
      clientId: clientAdebayo.id,
      campaignId: camp6.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-008",
      category: "CAMPAIGN_MANAGEMENT" as const,
      title: "Coordinate Port Harcourt launch",
      description:
        "Coordinate the Port Harcourt launch across printing, delivery, field activation and reporting.",
      scope:
        "Work package coordination, daily stand-ups, vendor hand-offs and final report.",
      location: "Port Harcourt",
      isRemote: false,
      deadline: daysAhead(15),
      budget: 250000,
      paymentModel: "PROJECT_FEE" as const,
      proofRequirementsJson: JSON.stringify([
        "Launch plan",
        "Daily status reports",
        "Final campaign report",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Campaign management",
        "Vendor coordination",
        "Reporting",
      ]),
      verificationLevel: "Verified",
      status: "SUBMITTED_FOR_REVIEW" as const,
      publishedAt: daysAgo(8),
      clientId: clientAdebayo.id,
      campaignId: camp6.id,
      businessProfileId: "bp-adebayo-01",
      assignedBoosterId: "booster-sales-01",
    },
    {
      jobNumber: "BJOB-2026-009",
      category: "TEAM_OPPORTUNITY" as const,
      title: "Weekend field team (3 people)",
      description:
        "Assemble a three-person field team for a weekend flyer distribution and lead capture exercise.",
      scope: "3 agents, 2 days, 6 hours per day.",
      location: "Lagos",
      isRemote: false,
      deadline: daysAhead(9),
      budget: 90000,
      paymentModel: "PER_TASK" as const,
      proofRequirementsJson: JSON.stringify([
        "Team attendance",
        "Photos",
        "Lead capture summary",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Field marketing",
        "Team coordination",
      ]),
      verificationLevel: "Standard",
      status: "PUBLISHED" as const,
      publishedAt: daysAgo(0.5),
      clientId: clientAdebayo.id,
      campaignId: camp1.id,
      businessProfileId: "bp-adebayo-01",
    },
    {
      jobNumber: "BJOB-2026-010",
      category: "CREATIVE" as const,
      title: "Record 30s radio jingle",
      description:
        "Write and record a 30-second radio jingle with a 15-second cutdown for the festive campaign.",
      scope: "30s master, 15s cutdown, dry voice and mixed versions.",
      location: "Remote",
      isRemote: true,
      deadline: daysAgo(1),
      budget: 70000,
      paymentModel: "FIXED" as const,
      proofRequirementsJson: JSON.stringify([
        "30s master",
        "15s cutdown",
        "Mixed and dry versions",
      ]),
      requiredSkillsJson: JSON.stringify([
        "Voice-over",
        "Audio production",
        "Copywriting",
      ]),
      verificationLevel: "Verified",
      status: "APPROVED" as const,
      publishedAt: daysAgo(10),
      clientId: clientAdebayo.id,
      campaignId: camp6.id,
      businessProfileId: "bp-adebayo-01",
      assignedBoosterId: "booster-voice-01",
    },
  ];

  const createdJobs: Record<string, { id: string }> = {};
  for (const job of boosterJobs) {
    const created = await prisma.boosterJob.upsert({
      where: { jobNumber: job.jobNumber },
      update: {},
      create: {
        ...job,
        createdById: adminUser.id,
      },
    });
    createdJobs[job.jobNumber] = created;
  }

  const boosterApplications = [
    {
      jobId: createdJobs["BJOB-2026-001"].id,
      boosterId: "booster-creative-01",
      status: "APPLIED" as const,
      coverNote:
        "I have designed similar retail campaign flyers and can deliver within 3 days.",
      appliedAt: daysAgo(1),
    },
    {
      jobId: createdJobs["BJOB-2026-001"].id,
      boosterId: "booster-voice-01",
      status: "APPLIED" as const,
      coverNote: "I can support the audio cutdowns and voice-over version.",
      appliedAt: daysAgo(0.5),
    },
    {
      jobId: createdJobs["BJOB-2026-002"].id,
      boosterId: "booster-print-01",
      status: "SHORTLISTED" as const,
      coverNote: "We can print and deliver within 48 hours.",
      proposedFee: 115000,
      appliedAt: daysAgo(1),
    },
    {
      jobId: createdJobs["BJOB-2026-003"].id,
      boosterId: "booster-logistics-01",
      status: "APPLIED" as const,
      coverNote: "We cover all five locations and provide proof of delivery.",
      appliedAt: daysAgo(1),
    },
    {
      jobId: createdJobs["BJOB-2026-004"].id,
      boosterId: "booster-field-01",
      status: "ASSIGNED" as const,
      coverNote: "Team and activation plan ready.",
      assignedAt: daysAgo(4),
      appliedAt: daysAgo(5),
    },
    {
      jobId: createdJobs["BJOB-2026-006"].id,
      boosterId: "booster-tech-01",
      status: "ASSIGNED" as const,
      coverNote: "LED wall and operator available.",
      assignedAt: daysAgo(5),
      appliedAt: daysAgo(6),
    },
    {
      jobId: createdJobs["BJOB-2026-008"].id,
      boosterId: "booster-sales-01",
      status: "ASSIGNED" as const,
      coverNote: "I can coordinate the full Port Harcourt work package.",
      assignedAt: daysAgo(7),
      appliedAt: daysAgo(8),
    },
    {
      jobId: createdJobs["BJOB-2026-010"].id,
      boosterId: "booster-voice-01",
      status: "ASSIGNED" as const,
      coverNote: "Jingle script and recording slot available.",
      assignedAt: daysAgo(9),
      appliedAt: daysAgo(10),
    },
  ];

  for (const application of boosterApplications) {
    await prisma.boosterApplication.upsert({
      where: {
        jobId_boosterId: {
          jobId: application.jobId,
          boosterId: application.boosterId,
        },
      },
      update: {},
      create: application,
    });
  }

  await prisma.boosterDeliverable.upsert({
    where: { id: "deliverable-001" },
    update: {},
    create: {
      id: "deliverable-001",
      jobId: createdJobs["BJOB-2026-008"].id,
      boosterId: "booster-sales-01",
      filesJson: JSON.stringify([
        "https://assets.advers.ng/boosters/ph-launch-plan.pdf",
        "https://assets.advers.ng/boosters/ph-vendor-schedule.xlsx",
      ]),
      notes:
        "Launch plan and vendor schedule attached. Field activation confirmed for Saturday.",
      locationEvidence: "Port Harcourt GRA, 4.8156° N, 7.0498° E",
      decision: "PENDING",
      fraudRisk: "MEDIUM",
      submittedAt: daysAgo(1),
    },
  });

  await prisma.boosterDeliverable.upsert({
    where: { id: "deliverable-002" },
    update: {},
    create: {
      id: "deliverable-002",
      jobId: createdJobs["BJOB-2026-010"].id,
      boosterId: "booster-voice-01",
      filesJson: JSON.stringify([
        "https://assets.advers.ng/boosters/radio-jingle-master.wav",
        "https://assets.advers.ng/boosters/radio-jingle-15s.wav",
      ]),
      notes: "30s master, 15s cutdown, mixed and dry versions included.",
      decision: "APPROVED",
      reviewerId: adminUser.id,
      decisionReason: "Clear audio, approved for broadcast.",
      reviewedAt: daysAgo(0.5),
      submittedAt: daysAgo(1),
    },
  });

  const notifications = [
    {
      id: "notif-001",
      userId: boosterCreativeUser.id,
      event: "BOOSTER_JOB_PUBLISHED",
      title: "New creative job",
      body: "Design 3 campaign flyers is now open in the marketplace.",
      link: "/booster/jobs",
      readAt: null,
      createdAt: daysAgo(2),
    },
    {
      id: "notif-002",
      userId: boosterFieldUser.id,
      event: "BOOSTER_JOB_ASSIGNED",
      title: "You have a new assignment",
      body: "Street activation at Lekki Toll has been assigned to you.",
      link: "/booster/applications",
      readAt: null,
      createdAt: daysAgo(4),
    },
    {
      id: "notif-003",
      userId: boosterSalesUser.id,
      event: "BOOSTER_DELIVERABLE_SUBMITTED",
      title: "Proof submitted",
      body: "Your proof for Coordinate Port Harcourt launch is under review.",
      link: "/booster/applications",
      readAt: null,
      createdAt: daysAgo(1),
    },
    {
      id: "notif-004",
      userId: boosterVoiceUser.id,
      event: "BOOSTER_DELIVERABLE_APPROVED",
      title: "Proof approved",
      body: "Your radio jingle deliverable was approved.",
      link: "/booster/applications",
      readAt: daysAgo(0.4),
      createdAt: daysAgo(0.5),
    },
    {
      id: "notif-005",
      userId: adminUser.id,
      event: "BOOSTER_JOB_REQUESTED",
      title: "New Booster job request",
      body: "A client requested Booster support for an active campaign.",
      link: "/admin/boosters/jobs",
      readAt: null,
      createdAt: daysAgo(1),
    },
    {
      id: "notif-006",
      userId: boosterCreativeUser.id,
      event: "BOOSTER_PROFILE_VERIFIED",
      title: "Profile verified",
      body: "Your Booster profile has been verified. You can now apply for verified jobs.",
      link: "/booster/profile",
      readAt: daysAgo(20),
      createdAt: daysAgo(21),
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {},
      create: {
        ...notification,
        channel: "IN_APP",
      },
    });
  }

  // 15. Earnings, withdrawals, ledger, ratings and disputes
  console.log("💰 Seeding Booster earnings, withdrawals and trust records...");

  const approvedEarning = await prisma.boosterEarning.upsert({
    where: { jobId: createdJobs["BJOB-2026-010"].id },
    update: {},
    create: {
      jobId: createdJobs["BJOB-2026-010"].id,
      boosterId: "booster-voice-01",
      amount: 70000,
      paymentModel: "FIXED",
      status: "APPROVED",
      reference: `EARN-${createdJobs["BJOB-2026-010"].id}`,
      approvedAt: daysAgo(0.5),
    },
  });

  await prisma.boosterEarning.upsert({
    where: { jobId: createdJobs["BJOB-2026-008"].id },
    update: {},
    create: {
      jobId: createdJobs["BJOB-2026-008"].id,
      boosterId: "booster-sales-01",
      amount: 250000,
      paymentModel: "PROJECT_FEE",
      status: "PENDING",
      reference: `EARN-${createdJobs["BJOB-2026-008"].id}`,
    },
  });

  await prisma.withdrawal.upsert({
    where: { reference: "WDR-2026-001" },
    update: {},
    create: {
      boosterId: "booster-voice-01",
      amount: 30000,
      status: "REQUESTED",
      method: "BANK_TRANSFER",
      reference: "WDR-2026-001",
      accountDetailsJson: JSON.stringify({
        details: "GTBank · Grace Etim · 0123456789",
      }),
      requestedAt: daysAgo(0.2),
    },
  });

  const ledgerEntries = [
    {
      reference: "LEDGER-SUB-inv-sub-001",
      type: "SUBSCRIPTION" as const,
      status: "PAID" as const,
      payerId: clientUser.id,
      grossAmount: 99990,
      feeAmount: 0,
      netAmount: 99990,
      metadataJson: JSON.stringify({ invoiceId: "inv-sub-001" }),
    },
    {
      reference: "LEDGER-CAMPAIGN-inv-2026-002",
      type: "CAMPAIGN_PAYMENT" as const,
      status: "HELD" as const,
      payerId: clientUser.id,
      grossAmount: 350000,
      feeAmount: 0,
      netAmount: 350000,
      campaignId: camp3.id,
      metadataJson: JSON.stringify({ invoiceId: "inv-2026-002" }),
    },
    {
      reference: `LEDGER-BOOSTER-${createdJobs["BJOB-2026-010"].id}`,
      type: "BOOSTER_PAYMENT" as const,
      status: "HELD" as const,
      payeeId: boosterVoiceUser.id,
      grossAmount: 70000,
      feeAmount: 0,
      netAmount: 70000,
      jobId: createdJobs["BJOB-2026-010"].id,
      boosterId: "booster-voice-01",
      metadataJson: JSON.stringify({ earningId: approvedEarning.id }),
    },
    {
      reference: "LEDGER-COMMISSION-BOOST-PH-CHUK",
      type: "COMMISSION" as const,
      status: "PAID" as const,
      payeeId: null,
      grossAmount: 32500,
      feeAmount: 0,
      netAmount: 32500,
      metadataJson: JSON.stringify({
        adBoosterId: "booster-chuks-01",
        boosterLink: "BOOST-PH-CHUK",
      }),
    },
  ];

  for (const entry of ledgerEntries) {
    await prisma.ledgerEntry.upsert({
      where: { reference: entry.reference },
      update: {},
      create: entry,
    });
  }

  await prisma.rating.upsert({
    where: {
      jobId_reviewerId: {
        jobId: createdJobs["BJOB-2026-010"].id,
        reviewerId: clientUser.id,
      },
    },
    update: {},
    create: {
      jobId: createdJobs["BJOB-2026-010"].id,
      reviewerId: clientUser.id,
      ratedBoosterId: "booster-voice-01",
      score: 5,
      comment: "Clear audio, delivered ahead of the deadline.",
      moderationState: "PENDING",
      createdAt: daysAgo(0.3),
    },
  });

  await prisma.dispute.upsert({
    where: { id: "dispute-001" },
    update: {},
    create: {
      id: "dispute-001",
      jobId: createdJobs["BJOB-2026-008"].id,
      campaignId: camp6.id,
      openedById: clientUser.id,
      againstBoosterId: "booster-sales-01",
      reason:
        "The launch report is missing two vendor confirmations and the final photo set.",
      evidenceJson: JSON.stringify([
        "https://assets.advers.ng/disputes/ph-launch-gap.pdf",
      ]),
      status: "OPEN",
      createdAt: daysAgo(0.4),
    },
  });

  // 15b. Booster team
  console.log("👥 Seeding Booster team...");
  const boosterTeam = await prisma.boosterTeam.upsert({
    where: { id: "team-ph-launch" },
    update: {},
    create: {
      id: "team-ph-launch",
      name: "Port Harcourt Launch Crew",
      description:
        "Field activation, delivery and campaign coordination team for the Port Harcourt launch.",
      managerId: "booster-field-01",
      status: "ACTIVE",
    },
  });

  const teamMembers = [
    { boosterId: "booster-field-01", role: "MANAGER" as const },
    { boosterId: "booster-sales-01", role: "MEMBER" as const },
    { boosterId: "booster-voice-01", role: "MEMBER" as const },
  ];

  for (const member of teamMembers) {
    await prisma.boosterTeamMember.upsert({
      where: {
        teamId_boosterId: {
          teamId: boosterTeam.id,
          boosterId: member.boosterId,
        },
      },
      update: {},
      create: {
        teamId: boosterTeam.id,
        boosterId: member.boosterId,
        role: member.role,
        status: "ACTIVE",
      },
    });
  }

  await prisma.boosterJob.updateMany({
    where: { jobNumber: "BJOB-2026-008" },
    data: { teamId: boosterTeam.id },
  });

  // 16. Notification preferences
  const preferenceSeeds = [
    { userId: clientUser.id, inApp: true, email: true, sms: false, whatsapp: true },
    {
      userId: boosterCreativeUser.id,
      inApp: true,
      email: true,
      sms: false,
      whatsapp: false,
    },
    {
      userId: boosterVoiceUser.id,
      inApp: true,
      email: true,
      sms: true,
      whatsapp: true,
    },
  ];

  for (const preference of preferenceSeeds) {
    await prisma.notificationPreference.upsert({
      where: { userId: preference.userId },
      update: {},
      create: preference,
    });
  }

  console.log("✅ ADVERS database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
