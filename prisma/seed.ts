import { PrismaClient, ChannelType, CampaignStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      status: CampaignStatus.ACTIVE,
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
      status: CampaignStatus.APPROVED,
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
      status: CampaignStatus.ACTIVE,
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
      status: CampaignStatus.PENDING_REVIEW,
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
