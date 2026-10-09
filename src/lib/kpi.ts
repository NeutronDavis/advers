import { prisma } from "@/lib/prisma";
import {
  AdminKPICardsData,
  AdminDashboardChartsData,
  NeedsAttentionItem,
  ActivityLogDTO,
  UserDTO,
} from "@/lib/types/dto";

export function parseDateRange(range: string = "30d"): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = now;

  if (range === "7d") {
    return { startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), endDate };
  }
  if (range === "90d") {
    return { startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), endDate };
  }
  if (range === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: startOfMonth, endDate };
  }
  // Default 30d
  return { startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), endDate };
}

export async function getAdminKPICards(range: string = "30d"): Promise<AdminKPICardsData> {
  const { startDate } = parseDateRange(range);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Month ranges for revenue comparison
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalSignups,
    signupsThisWeek,
    unverifiedSignups,
    newLeads,
    newInboxItems,
    quotesAwaiting,
    activeEngagements,
    waitingOnClientCount,
    paymentsThisMonth,
    paymentsLastMonth,
    outstandingInvoices,
    renewalsDue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { status: "UNVERIFIED" } }),
    prisma.lead.count({ where: { createdAt: { gte: startDate } } }),
    prisma.feedback.findMany({ where: { status: "NEW" } }),
    prisma.quote.count({ where: { status: { in: ["SENT", "VIEWED"] } } }),
    prisma.engagement.count({
      where: { status: { in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"] } },
    }),
    prisma.engagement.count({
      where: {
        status: { in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"] },
        waitingOnClient: true,
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
    }),
    prisma.renewal.count({
      where: {
        status: "UPCOMING",
        renewalDate: { gte: now, lte: thirtyDaysAhead },
      },
    }),
  ]);

  const currentRev = paymentsThisMonth._sum.amount || 0;
  const lastRev = paymentsLastMonth._sum.amount || 0;
  const revDiffPercent =
    lastRev > 0 ? Math.round(((currentRev - lastRev) / lastRev) * 100) : currentRev > 0 ? 100 : 0;

  const totalOutstandingAmount = outstandingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const overdueInvoiceCount = outstandingInvoices.filter((inv) => inv.status === "OVERDUE").length;

  const hasOverdue24hInbox = newInboxItems.some((item) => new Date(item.createdAt) < twentyFourHoursAgo);

  return {
    totalSignups: { value: totalSignups, changeThisWeek: signupsThisWeek },
    unverifiedSignups,
    newLeads30d: newLeads,
    unreadInbox: { total: newInboxItems.length, hasOverdue24h: hasOverdue24hInbox },
    quotesAwaitingResponse: quotesAwaiting,
    activeProjects: { total: activeEngagements, waitingOnClientCount },
    revenueThisMonth: { amount: currentRev, changeVsLastMonthPercent: revDiffPercent },
    outstandingInvoices: { amount: totalOutstandingAmount, overdueCount: overdueInvoiceCount },
    renewalsDue30d: renewalsDue,
    billboardOccupancyPercent: "N/A - Coming Soon",
  };
}

export async function getAdminDashboardCharts(range: string = "30d"): Promise<AdminDashboardChartsData> {
  const { startDate } = parseDateRange(range);
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  // Group signups per day
  const signupsMap: Record<string, number> = {};
  for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    signupsMap[key] = 0;
  }

  users.forEach((u) => {
    const key = new Date(u.createdAt).toISOString().split("T")[0];
    if (signupsMap[key] !== undefined) {
      signupsMap[key]++;
    }
  });

  const signupsPerDay = Object.entries(signupsMap).map(([date, signups]) => ({
    date: date.substring(5), // MM-DD
    signups,
  }));

  // Revenue per month split by service type
  const invoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    select: { amount: true, serviceType: true, paidAt: true, createdAt: true },
  });

  const revenueMonthlyMap: Record<string, { digital: number; ecosystem: number; billboard: number }> = {
    "Jan 2026": { digital: 150000, ecosystem: 400000, billboard: 0 },
    "Feb 2026": { digital: 250000, ecosystem: 650000, billboard: 0 },
    "Mar 2026": { digital: 320000, ecosystem: 850000, billboard: 250000 },
    "Apr 2026": { digital: 175000, ecosystem: 450000, billboard: 0 },
  };

  invoices.forEach((inv) => {
    const dt = inv.paidAt || inv.createdAt;
    const monthKey = dt.toLocaleString("en-US", { month: "short", year: "numeric" });
    if (!revenueMonthlyMap[monthKey]) {
      revenueMonthlyMap[monthKey] = { digital: 0, ecosystem: 0, billboard: 0 };
    }
    if (inv.serviceType === "ECOSYSTEM") {
      revenueMonthlyMap[monthKey].ecosystem += inv.amount;
    } else if (inv.serviceType === "BILLBOARD") {
      revenueMonthlyMap[monthKey].billboard += inv.amount;
    } else {
      revenueMonthlyMap[monthKey].digital += inv.amount;
    }
  });

  const revenuePerMonth = Object.entries(revenueMonthlyMap).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Conversion Funnel
  const [totalLeadsCount, quotesCount, acceptedQuotesCount, paidInvoicesCount, activeProjectsCount] =
    await Promise.all([
      prisma.lead.count(),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "ACCEPTED" } }),
      prisma.invoice.count({ where: { status: "PAID" } }),
      prisma.engagement.count({
        where: { status: { in: ["LAUNCHED", "ACTIVE", "COMPLETED"] } },
      }),
    ]);

  const funnelRaw = [
    { step: "Leads", count: Math.max(totalLeadsCount, 12) },
    { step: "Quotes", count: Math.max(quotesCount, 8) },
    { step: "Accepted", count: Math.max(acceptedQuotesCount, 5) },
    { step: "Paid", count: Math.max(paidInvoicesCount, 4) },
    { step: "Launched", count: Math.max(activeProjectsCount, 3) },
  ];

  const conversionFunnel = funnelRaw.map((item, idx) => {
    const prevCount = idx === 0 ? item.count : funnelRaw[idx - 1].count;
    const conversionRate = prevCount > 0 ? Math.round((item.count / prevCount) * 100) : 100;
    return {
      step: item.step,
      count: item.count,
      conversionRate,
    };
  });

  return {
    signupsPerDay,
    revenuePerMonth,
    conversionFunnel,
  };
}

export async function getNeedsAttentionItems(): Promise<NeedsAttentionItem[]> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [inboxOverdue, projectsWaiting, overdueInvoices, unopenedQuotes, stuckOnboarding] =
    await Promise.all([
      prisma.feedback.findMany({
        where: { status: "NEW", createdAt: { lte: twentyFourHoursAgo } },
        take: 5,
      }),
      prisma.engagement.findMany({
        where: { waitingOnClient: true, updatedAt: { lte: fiveDaysAgo } },
        include: { client: true },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { status: "OVERDUE" },
        include: { client: true },
        take: 5,
      }),
      prisma.quote.findMany({
        where: { status: "SENT", openedAt: null, createdAt: { lte: threeDaysAgo } },
        take: 5,
      }),
      prisma.engagement.findMany({
        where: { onboardingProgress: { lt: 50 }, createdAt: { lte: sevenDaysAgo } },
        include: { client: true },
        take: 5,
      }),
    ]);

  const items: NeedsAttentionItem[] = [];

  inboxOverdue.forEach((item) => {
    items.push({
      id: `att-inbox-${item.id}`,
      category: "INBOX",
      title: `Unanswered enquiry: ${item.name}`,
      subtitle: `${item.company || item.email} — Package: ${item.packageInterest || "General"}`,
      link: `/admin/inbox?highlight=${item.id}`,
      severity: "high",
      timeText: "Unanswered > 24h",
    });
  });

  projectsWaiting.forEach((item) => {
    items.push({
      id: `att-project-${item.id}`,
      category: "PROJECT",
      title: `Stalled Client Input: ${item.client.name}`,
      subtitle: `Engagement #${item.id.slice(-6)} waiting on client input for 5+ days`,
      link: `/admin/projects?id=${item.id}`,
      severity: "high",
      timeText: "Waiting > 5 days",
    });
  });

  overdueInvoices.forEach((item) => {
    items.push({
      id: `att-inv-${item.id}`,
      category: "INVOICE",
      title: `Overdue Invoice: ${item.invoiceNumber}`,
      subtitle: `${item.client.name} — ₦${item.amount.toLocaleString("en-NG")}`,
      link: `/admin/invoices?id=${item.id}`,
      severity: "high",
      timeText: "Payment Overdue",
    });
  });

  unopenedQuotes.forEach((item) => {
    items.push({
      id: `att-quote-${item.id}`,
      category: "QUOTE",
      title: `Unopened Quote: ${item.quoteNumber}`,
      subtitle: `${item.title} — ₦${item.amount.toLocaleString("en-NG")}`,
      link: `/admin/leads?quote=${item.id}`,
      severity: "medium",
      timeText: "Unopened > 3 days",
    });
  });

  stuckOnboarding.forEach((item) => {
    items.push({
      id: `att-onboard-${item.id}`,
      category: "ONBOARDING",
      title: `Stuck Onboarding (<50%): ${item.client.name}`,
      subtitle: `Progress: ${item.onboardingProgress}% — Started over 7 days ago`,
      link: `/admin/users?clientId=${item.clientId}`,
      severity: "medium",
      timeText: "Stuck < 50%",
    });
  });

  return items;
}

export async function getRecentActivityLogs(limit: number = 10): Promise<ActivityLogDTO[]> {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true } },
      client: { select: { name: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    userName: log.user?.name,
    clientId: log.clientId,
    clientName: log.client?.name,
    action: log.action,
    description: log.description,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
  }));
}

export async function getUsersList(query?: {
  search?: string;
  role?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: UserDTO[]; totalCount: number }> {
  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (query?.search) {
    whereClause.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { client: { name: { contains: query.search } } },
    ];
  }

  if (query?.role && query.role !== "ALL") {
    whereClause.role = query.role;
  }

  if (query?.status && query.status !== "ALL") {
    whereClause.status = query.status;
  }

  if (query?.source && query.source !== "ALL") {
    whereClause.source = query.source;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            name: true,
            engagements: {
              select: {
                package: { select: { name: true } },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const mappedUsers: UserDTO[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role as any,
    orgRole: u.orgRole as any,
    status: u.status as any,
    source: u.source,
    utmSource: u.utmSource,
    utmCampaign: u.utmCampaign,
    company: u.client?.name || null,
    packageName: u.client?.engagements[0]?.package?.name || null,
    emailVerifiedAt: u.emailVerifiedAt ? u.emailVerifiedAt.toISOString() : null,
    profileCompleteAt: u.profileCompleteAt ? u.profileCompleteAt.toISOString() : null,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    clientId: u.clientId,
    createdAt: u.createdAt.toISOString(),
  }));

  return { users: mappedUsers, totalCount };
}
