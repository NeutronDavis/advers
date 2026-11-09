import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseDateRange } from "@/lib/date-range";
import {
  ActivityLogDTO,
  AdminDashboardChartsData,
  AdminKPICardsData,
  NeedsAttentionItem,
  UserDTO,
} from "@/lib/types/dto";

export { parseDateRange };

export async function getAdminKPICards(
  range: string = "30d"
): Promise<AdminKPICardsData> {
  const { startDate } = parseDateRange(range);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  const [
    totalSignups,
    signupsThisWeek,
    unverifiedSignups,
    newLeads,
    newInboxCount,
    overdueInboxCount,
    quotesAwaiting,
    activeEngagements,
    waitingOnClientCount,
    paymentsThisMonth,
    paymentsLastMonth,
    outstandingInvoices,
    overdueInvoiceCount,
    renewalsDue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { status: "UNVERIFIED" } }),
    prisma.lead.count({ where: { createdAt: { gte: startDate } } }),
    prisma.feedback.count({ where: { status: "NEW" } }),
    prisma.feedback.count({
      where: { status: "NEW", createdAt: { lte: twentyFourHoursAgo } },
    }),
    prisma.quote.count({ where: { status: { in: ["SENT", "VIEWED"] } } }),
    prisma.engagement.count({
      where: {
        status: {
          in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"],
        },
      },
    }),
    prisma.engagement.count({
      where: {
        status: {
          in: ["ONBOARDING_IN_PROGRESS", "IN_PRODUCTION", "ACTIVE"],
        },
        waitingOnClient: true,
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["PENDING", "OVERDUE"] } },
    }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.subscription.count({
      where: {
        status: { in: ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD"] },
        renewalDate: { gte: now, lte: thirtyDaysAhead },
      },
    }),
  ]);

  const currentRev = paymentsThisMonth._sum.amount || 0;
  const lastRev = paymentsLastMonth._sum.amount || 0;
  const revDiffPercent =
    lastRev > 0
      ? Math.round(((currentRev - lastRev) / lastRev) * 100)
      : currentRev > 0
        ? 100
        : 0;

  return {
    totalSignups: { value: totalSignups, changeThisWeek: signupsThisWeek },
    unverifiedSignups,
    newLeads30d: newLeads,
    unreadInbox: {
      total: newInboxCount,
      hasOverdue24h: overdueInboxCount > 0,
    },
    quotesAwaitingResponse: quotesAwaiting,
    activeProjects: {
      total: activeEngagements,
      waitingOnClientCount,
    },
    revenueThisMonth: {
      amount: currentRev,
      changeVsLastMonthPercent: revDiffPercent,
    },
    outstandingInvoices: {
      amount: outstandingInvoices._sum.amount || 0,
      overdueCount: overdueInvoiceCount,
    },
    renewalsDue30d: renewalsDue,
    billboardOccupancyPercent: "N/A",
  };
}

export async function getAdminDashboardCharts(
  range: string = "30d"
): Promise<AdminDashboardChartsData> {
  const { startDate } = parseDateRange(range);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  const signupsMap: Record<string, number> = {};
  const cursor = new Date(startDate);
  while (cursor <= new Date()) {
    const key = cursor.toISOString().split("T")[0];
    signupsMap[key] = 0;
    cursor.setDate(cursor.getDate() + 1);
  }

  users.forEach((user) => {
    const key = new Date(user.createdAt).toISOString().split("T")[0];
    if (signupsMap[key] !== undefined) signupsMap[key]++;
  });

  const signupsPerDay = Object.entries(signupsMap).map(([date, signups]) => ({
    date: date.substring(5),
    signups,
  }));

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      OR: [
        { paidAt: { gte: sixMonthsAgo } },
        { paidAt: null, createdAt: { gte: sixMonthsAgo } },
      ],
    },
    select: { amount: true, serviceType: true, paidAt: true, createdAt: true },
  });

  const revenueMonthlyMap: Record<
    string,
    { digital: number; ecosystem: number; billboard: number; subscription: number }
  > = {};

  for (let index = 0; index < 6; index++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = monthDate.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    revenueMonthlyMap[key] = {
      digital: 0,
      ecosystem: 0,
      billboard: 0,
      subscription: 0,
    };
  }

  paidInvoices.forEach((invoice) => {
    const date = invoice.paidAt || invoice.createdAt;
    const key = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!revenueMonthlyMap[key]) {
      revenueMonthlyMap[key] = {
        digital: 0,
        ecosystem: 0,
        billboard: 0,
        subscription: 0,
      };
    }
    if (invoice.serviceType === "SUBSCRIPTION") {
      revenueMonthlyMap[key].subscription += invoice.amount;
    } else if (invoice.serviceType === "ECOSYSTEM") {
      revenueMonthlyMap[key].ecosystem += invoice.amount;
    } else if (invoice.serviceType === "BILLBOARD") {
      revenueMonthlyMap[key].billboard += invoice.amount;
    } else {
      revenueMonthlyMap[key].digital += invoice.amount;
    }
  });

  const revenuePerMonth = Object.entries(revenueMonthlyMap).map(
    ([month, data]) => ({ month, ...data })
  );

  const [
    totalLeadsCount,
    quotesCount,
    acceptedQuotesCount,
    paidInvoicesCount,
    activeProjectsCount,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "ACCEPTED" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.engagement.count({
      where: { status: { in: ["LAUNCHED", "ACTIVE", "COMPLETED"] } },
    }),
  ]);

  const funnelRaw = [
    { step: "Leads", count: totalLeadsCount },
    { step: "Quotes", count: quotesCount },
    { step: "Accepted", count: acceptedQuotesCount },
    { step: "Paid", count: paidInvoicesCount },
    { step: "Launched", count: activeProjectsCount },
  ];

  const conversionFunnel = funnelRaw.map((item, index) => {
    const previous = index === 0 ? item.count : funnelRaw[index - 1].count;
    return {
      step: item.step,
      count: item.count,
      conversionRate: previous > 0 ? Math.round((item.count / previous) * 100) : 0,
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

  const [
    inboxOverdue,
    projectsWaiting,
    overdueInvoices,
    unopenedQuotes,
    stuckOnboarding,
  ] = await Promise.all([
    prisma.feedback.findMany({
      where: { status: "NEW", createdAt: { lte: twentyFourHoursAgo } },
      orderBy: { createdAt: "asc" },
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
      subtitle: `${item.company || item.email} — ${item.packageInterest || "General enquiry"}`,
      link: `/admin/inbox?highlight=${item.id}`,
      severity: "high",
      timeText: "Unanswered > 24h",
    });
  });

  projectsWaiting.forEach((item) => {
    items.push({
      id: `att-project-${item.id}`,
      category: "PROJECT",
      title: `Stalled client input: ${item.client?.name || "Client"}`,
      subtitle: `Engagement #${item.id.slice(-6)} waiting on client input for 5+ days`,
      link: `/admin/users?clientId=${item.clientId}`,
      severity: "high",
      timeText: "Waiting > 5 days",
    });
  });

  overdueInvoices.forEach((item) => {
    items.push({
      id: `att-inv-${item.id}`,
      category: "INVOICE",
      title: `Overdue invoice: ${item.invoiceNumber}`,
      subtitle: `${item.client?.name || "Client"} — ₦${item.amount.toLocaleString("en-NG")}`,
      link: `/admin/finance`,
      severity: "high",
      timeText: "Payment overdue",
    });
  });

  unopenedQuotes.forEach((item) => {
    items.push({
      id: `att-quote-${item.id}`,
      category: "QUOTE",
      title: `Unopened quote: ${item.quoteNumber}`,
      subtitle: `${item.title} — ₦${item.amount.toLocaleString("en-NG")}`,
      link: `/admin/users`,
      severity: "medium",
      timeText: "Unopened > 3 days",
    });
  });

  stuckOnboarding.forEach((item) => {
    items.push({
      id: `att-onboard-${item.id}`,
      category: "ONBOARDING",
      title: `Stuck onboarding (<50%): ${item.client?.name || "Client"}`,
      subtitle: `Progress: ${item.onboardingProgress}% — started over 7 days ago`,
      link: `/admin/users?clientId=${item.clientId}`,
      severity: "medium",
      timeText: "Stuck < 50%",
    });
  });

  return items;
}

export async function getRecentActivityLogs(
  limit: number = 10
): Promise<ActivityLogDTO[]> {
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

  const whereClause: Prisma.UserWhereInput = {};

  if (query?.search) {
    whereClause.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { client: { name: { contains: query.search } } },
    ];
  }
  if (query?.role && query.role !== "ALL") {
    whereClause.role = query.role as Prisma.UserWhereInput["role"];
  }
  if (query?.status && query.status !== "ALL") {
    whereClause.status = query.status as Prisma.UserWhereInput["status"];
  }
  if (query?.source && query.source !== "ALL") whereClause.source = query.source;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            name: true,
            engagements: {
              select: { package: { select: { name: true } } },
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

  const mappedUsers: UserDTO[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    orgRole: user.orgRole,
    status: user.status,
    source: user.source || "ORGANIC",
    utmSource: user.utmSource || null,
    utmCampaign: user.utmCampaign || null,
    company: user.client?.name || null,
    packageName: user.client?.engagements?.[0]?.package?.name || null,
    emailVerifiedAt: user.emailVerifiedAt
      ? user.emailVerifiedAt.toISOString()
      : null,
    profileCompleteAt: user.profileCompleteAt
      ? user.profileCompleteAt.toISOString()
      : null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    clientId: user.clientId,
    createdAt: user.createdAt.toISOString(),
  }));

  return { users: mappedUsers, totalCount };
}
