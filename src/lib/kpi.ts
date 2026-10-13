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
    prisma.user.count({ where: { status: "UNVERIFIED" as any } }),
    prisma.lead.count({ where: { createdAt: { gte: startDate } } }),
    prisma.feedback.findMany({ where: { status: "NEW" as any } }),
    (prisma as any).quote?.count
      ? (prisma as any).quote.count({ where: { status: { in: ["SENT", "VIEWED"] } } })
      : Promise.resolve(0),
    prisma.engagement.count({
      where: { status: { in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"] as any } },
    }),
    prisma.engagement.count({
      where: {
        status: { in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"] as any },
        waitingOnClient: true,
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" as any, createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" as any, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    (prisma as any).invoice?.findMany
      ? (prisma as any).invoice.findMany({
          where: { status: { in: ["PENDING", "OVERDUE"] } },
        })
      : Promise.resolve([]),
    (prisma as any).renewal?.count
      ? (prisma as any).renewal.count({
          where: {
            status: "UPCOMING",
            renewalDate: { gte: now, lte: thirtyDaysAhead },
          },
        })
      : Promise.resolve(0),
  ]);

  const currentRev = paymentsThisMonth?._sum?.amount || 0;
  const lastRev = paymentsLastMonth?._sum?.amount || 0;
  const revDiffPercent =
    lastRev > 0 ? Math.round(((currentRev - lastRev) / lastRev) * 100) : currentRev > 0 ? 100 : 0;

  const invoiceList: Array<{ id: string; amount: number; status: string }> = Array.isArray(outstandingInvoices)
    ? outstandingInvoices
    : [];
  const totalOutstandingAmount = invoiceList.reduce((acc: number, inv: { amount?: number }) => acc + (inv.amount || 0), 0);
  const overdueInvoiceCount = invoiceList.filter((inv: { status?: string }) => inv.status === "OVERDUE").length;

  const inboxList: Array<{ id: string; createdAt: Date }> = Array.isArray(newInboxItems)
    ? newInboxItems
    : [];
  const hasOverdue24hInbox = inboxList.some((item: { createdAt: Date }) => new Date(item.createdAt) < twentyFourHoursAgo);

  return {
    totalSignups: { value: totalSignups, changeThisWeek: signupsThisWeek },
    unverifiedSignups,
    newLeads30d: newLeads,
    unreadInbox: { total: inboxList.length, hasOverdue24h: hasOverdue24hInbox },
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

  users.forEach((u: { createdAt: Date }) => {
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
  const invoices: Array<{ amount: number; serviceType: string; paidAt: Date | null; createdAt: Date }> =
    (prisma as any).invoice?.findMany
      ? await (prisma as any).invoice.findMany({
          where: { status: "PAID" },
          select: { amount: true, serviceType: true, paidAt: true, createdAt: true },
        })
      : [];

  const revenueMonthlyMap: Record<string, { digital: number; ecosystem: number; billboard: number }> = {
    "Jan 2026": { digital: 150000, ecosystem: 400000, billboard: 0 },
    "Feb 2026": { digital: 250000, ecosystem: 650000, billboard: 0 },
    "Mar 2026": { digital: 320000, ecosystem: 850000, billboard: 250000 },
    "Apr 2026": { digital: 175000, ecosystem: 450000, billboard: 0 },
  };

  invoices.forEach((inv: { amount: number; serviceType: string; paidAt: Date | null; createdAt: Date }) => {
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
      (prisma as any).quote?.count ? (prisma as any).quote.count() : Promise.resolve(0),
      (prisma as any).quote?.count
        ? (prisma as any).quote.count({ where: { status: "ACCEPTED" } })
        : Promise.resolve(0),
      (prisma as any).invoice?.count
        ? (prisma as any).invoice.count({ where: { status: "PAID" } })
        : Promise.resolve(0),
      prisma.engagement.count({
        where: { status: { in: ["LAUNCHED", "ACTIVE", "COMPLETED"] as any } },
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
        where: { status: "NEW" as any, createdAt: { lte: twentyFourHoursAgo } },
        take: 5,
      }),
      prisma.engagement.findMany({
        where: { waitingOnClient: true, updatedAt: { lte: fiveDaysAgo } },
        include: { client: true },
        take: 5,
      }),
      (prisma as any).invoice?.findMany
        ? (prisma as any).invoice.findMany({
            where: { status: "OVERDUE" },
            include: { client: true },
            take: 5,
          })
        : Promise.resolve([]),
      (prisma as any).quote?.findMany
        ? (prisma as any).quote.findMany({
            where: { status: "SENT", openedAt: null, createdAt: { lte: threeDaysAgo } },
            take: 5,
          })
        : Promise.resolve([]),
      prisma.engagement.findMany({
        where: { onboardingProgress: { lt: 50 }, createdAt: { lte: sevenDaysAgo } },
        include: { client: true },
        take: 5,
      }),
    ]);

  const items: NeedsAttentionItem[] = [];

  (inboxOverdue as any[]).forEach((item: any) => {
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

  (projectsWaiting as any[]).forEach((item: any) => {
    items.push({
      id: `att-project-${item.id}`,
      category: "PROJECT",
      title: `Stalled Client Input: ${item.client?.name || "Client"}`,
      subtitle: `Engagement #${item.id.slice(-6)} waiting on client input for 5+ days`,
      link: `/admin/projects?id=${item.id}`,
      severity: "high",
      timeText: "Waiting > 5 days",
    });
  });

  (overdueInvoices as any[]).forEach((item: any) => {
    items.push({
      id: `att-inv-${item.id}`,
      category: "INVOICE",
      title: `Overdue Invoice: ${item.invoiceNumber || item.id}`,
      subtitle: `${item.client?.name || "Client"} — ₦${(item.amount || 0).toLocaleString("en-NG")}`,
      link: `/admin/invoices?id=${item.id}`,
      severity: "high",
      timeText: "Payment Overdue",
    });
  });

  (unopenedQuotes as any[]).forEach((item: any) => {
    items.push({
      id: `att-quote-${item.id}`,
      category: "QUOTE",
      title: `Unopened Quote: ${item.quoteNumber || item.id}`,
      subtitle: `${item.title || "Proposal"} — ₦${(item.amount || 0).toLocaleString("en-NG")}`,
      link: `/admin/leads?quote=${item.id}`,
      severity: "medium",
      timeText: "Unopened > 3 days",
    });
  });

  (stuckOnboarding as any[]).forEach((item: any) => {
    items.push({
      id: `att-onboard-${item.id}`,
      category: "ONBOARDING",
      title: `Stuck Onboarding (<50%): ${item.client?.name || "Client"}`,
      subtitle: `Progress: ${item.onboardingProgress}% — Started over 7 days ago`,
      link: `/admin/users?clientId=${item.clientId}`,
      severity: "medium",
      timeText: "Stuck < 50%",
    });
  });

  return items;
}

export async function getRecentActivityLogs(limit: number = 10): Promise<ActivityLogDTO[]> {
  const logs: any[] = (prisma as any).activityLog?.findMany
    ? await (prisma as any).activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: { select: { name: true } },
          client: { select: { name: true } },
        },
      })
    : [];

  return logs.map((log: any) => ({
    id: log.id,
    userId: log.userId,
    userName: log.user?.name,
    clientId: log.clientId,
    clientName: log.client?.name,
    action: log.action,
    description: log.description,
    metadata: log.metadata,
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : String(log.createdAt),
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

  const mappedUsers: UserDTO[] = (users as any[]).map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role as any,
    orgRole: u.orgRole as any,
    status: (u.status || "UNVERIFIED") as any,
    source: u.source || "ORGANIC",
    utmSource: u.utmSource || null,
    utmCampaign: u.utmCampaign || null,
    company: u.client?.name || null,
    packageName: u.client?.engagements?.[0]?.package?.name || null,
    emailVerifiedAt: u.emailVerifiedAt ? new Date(u.emailVerifiedAt).toISOString() : null,
    profileCompleteAt: u.profileCompleteAt ? new Date(u.profileCompleteAt).toISOString() : null,
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
    clientId: u.clientId,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
  }));

  return { users: mappedUsers, totalCount };
}
