import React, { Suspense } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Tv,
  FileCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Inbox,
  UserPlus,
  UserX,
  FileText,
  Briefcase,
  Wallet,
  Receipt,
  CalendarClock,
  CreditCard,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import {
  getAdminDashboardCharts,
  getAdminKPICards,
  getNeedsAttentionItems,
  getRecentActivityLogs,
} from "@/lib/kpi";
import {
  DATE_RANGE_OPTIONS,
  normalizeDateRange,
  type DateRangeKey,
} from "@/lib/date-range";
import { formatDate, formatNaira, formatNumber } from "@/lib/format";
import AdminCharts from "./AdminCharts";

export const dynamic = "force-dynamic";

type Tone = "positive" | "warning" | "danger" | "muted";

function toneClass(tone: Tone): string {
  switch (tone) {
    case "positive":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-error";
    default:
      return "text-base-content/60";
  }
}

function KpiCard({
  title,
  value,
  change,
  subtext,
  icon,
  href,
  tone = "muted",
}: {
  title: string;
  value: string;
  change: string;
  subtext: string;
  icon: React.ReactNode;
  href: string;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between text-base-content/60 text-[11px] font-bold">
        <span>{title}</span>
        <div className="w-7 h-7 rounded-lg bg-base-200 text-base-content flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-2.5">
        {value}
      </div>
      <div className={`text-[11px] font-bold mt-1 ${toneClass(tone)}`}>{change}</div>
      <div className="text-[10px] text-base-content/50 mt-0.5">{subtext}</div>
    </Link>
  );
}

async function KpiSection({
  range,
  isAdmin,
}: {
  range: DateRangeKey;
  isAdmin: boolean;
}) {
  const kpis = await getAdminKPICards(range);
  const revenueTone: Tone =
    kpis.revenueThisMonth.changeVsLastMonthPercent >= 0 ? "positive" : "danger";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <KpiCard
        title="Total signups"
        value={formatNumber(kpis.totalSignups.value)}
        change={`+${formatNumber(kpis.totalSignups.changeThisWeek)} this week`}
        subtext="All registered accounts"
        icon={<Users className="w-4 h-4" />}
        href="/admin/users"
        tone="positive"
      />
      <KpiCard
        title="Unverified signups"
        value={formatNumber(kpis.unverifiedSignups)}
        change={kpis.unverifiedSignups > 0 ? "Needs verification" : "All verified"}
        subtext="Pending email / identity checks"
        icon={<UserX className="w-4 h-4" />}
        href="/admin/users?status=UNVERIFIED"
        tone={kpis.unverifiedSignups > 0 ? "warning" : "positive"}
      />
      <KpiCard
        title="New leads (30d)"
        value={formatNumber(kpis.newLeads30d)}
        change="Last 30 days"
        subtext="Inbound lead records"
        icon={<UserPlus className="w-4 h-4" />}
        href="/admin/inbox"
      />
      <KpiCard
        title="Unread inbox"
        value={formatNumber(kpis.unreadInbox.total)}
        change={
          kpis.unreadInbox.hasOverdue24h
            ? "Overdue > 24h"
            : "All within 24h SLA"
        }
        subtext="New enquiries awaiting reply"
        icon={<Inbox className="w-4 h-4" />}
        href="/admin/inbox"
        tone={kpis.unreadInbox.hasOverdue24h ? "danger" : "positive"}
      />
      <KpiCard
        title="Quotes awaiting response"
        value={formatNumber(kpis.quotesAwaitingResponse)}
        change="Sent or viewed"
        subtext="Advertiser decision pending"
        icon={<FileText className="w-4 h-4" />}
        href="/admin/users"
        tone={kpis.quotesAwaitingResponse > 0 ? "warning" : "muted"}
      />
      <KpiCard
        title="Active projects"
        value={formatNumber(kpis.activeProjects.total)}
        change={`${formatNumber(kpis.activeProjects.waitingOnClientCount)} waiting on client`}
        subtext="Onboarding, production and live"
        icon={<Briefcase className="w-4 h-4" />}
        href="/admin/users"
        tone={kpis.activeProjects.waitingOnClientCount > 0 ? "warning" : "positive"}
      />
      <KpiCard
        title="Revenue this month"
        value={isAdmin ? formatNaira(kpis.revenueThisMonth.amount) : "Restricted"}
        change={
          isAdmin
            ? `${kpis.revenueThisMonth.changeVsLastMonthPercent >= 0 ? "+" : ""}${kpis.revenueThisMonth.changeVsLastMonthPercent}% vs last month`
            : "Admin only"
        }
        subtext="Successful payments recorded"
        icon={<Wallet className="w-4 h-4" />}
        href="/admin/finance"
        tone={isAdmin ? revenueTone : "muted"}
      />
      <KpiCard
        title="Outstanding invoices"
        value={isAdmin ? formatNaira(kpis.outstandingInvoices.amount) : "Restricted"}
        change={`${formatNumber(kpis.outstandingInvoices.overdueCount)} overdue`}
        subtext="Pending and overdue balances"
        icon={<Receipt className="w-4 h-4" />}
        href="/admin/finance"
        tone={
          isAdmin && kpis.outstandingInvoices.overdueCount > 0 ? "danger" : "muted"
        }
      />
      <KpiCard
        title="Renewals due in 30d"
        value={formatNumber(kpis.renewalsDue30d)}
        change="Next 30 days"
        subtext="Upcoming subscription renewals"
        icon={<CalendarClock className="w-4 h-4" />}
        href="/admin/users"
        tone={kpis.renewalsDue30d > 0 ? "warning" : "muted"}
      />
      <KpiCard
        title="Billboard occupancy"
        value={kpis.billboardOccupancyPercent}
        change="Module coming soon"
        subtext="Inventory occupancy tracking"
        icon={<Tv className="w-4 h-4" />}
        href="/admin/inventory"
        tone="muted"
      />
    </div>
  );
}

async function ChartsSection({
  range,
  isStaff,
}: {
  range: DateRangeKey;
  isStaff: boolean;
}) {
  const charts = await getAdminDashboardCharts(range);
  return <AdminCharts chartsData={charts} isStaff={isStaff} />;
}

async function AttentionSection() {
  const items = await getNeedsAttentionItems();

  return (
    <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-base-200">
        <div>
          <h2 className="text-base sm:text-lg font-black text-base-content flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Needs attention</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Items that have breached a service-level or waiting threshold.
          </p>
        </div>
        <span className="badge badge-warning badge-sm font-bold">
          {items.length} open
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center bg-base-200/40 rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
          <p className="text-sm font-bold text-base-content mt-2">
            Nothing needs attention right now
          </p>
          <p className="text-xs text-base-content/60">
            Inbox, projects, invoices and onboarding are all within SLA.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-base-200">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="py-3 flex items-center justify-between gap-3 hover:bg-base-200/50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`badge badge-xs mt-1 shrink-0 ${
                    item.severity === "high" ? "badge-error" : "badge-warning"
                  }`}
                >
                  {item.category}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-base-content/60 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-base-content/50 hidden sm:inline">
                  {item.timeText}
                </span>
                <ArrowRight className="w-4 h-4 text-base-content/40" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function ActivitySection() {
  const logs = await getRecentActivityLogs(8);

  return (
    <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-base-200">
        <div>
          <h2 className="text-base sm:text-lg font-black text-base-content flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Recent activity</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Latest signups, payments, approvals and uploads.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-xs font-bold text-primary hover:underline"
        >
          View directory →
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-xs text-base-content/60">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-base-200/50 rounded-2xl flex items-start gap-3 text-xs"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge-xs badge-primary badge-soft font-bold">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-base-content/50 font-mono">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="text-base-content font-medium leading-relaxed mt-1">
                  {log.description}
                </div>
                <div className="text-[10px] text-base-content/50 mt-0.5">
                  {log.userName || "System"}
                  {log.clientName ? ` · ${log.clientName}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="skeleton h-32 rounded-2xl" />
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="skeleton h-80 rounded-3xl" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return <div className="skeleton h-64 rounded-3xl" />;
}

export default async function AdminOperationsCockpitPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await requireStaff();
  const params = await searchParams;
  const range = normalizeDateRange(params?.range);
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            ADVERS Staff Operations Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mt-0.5">
            Media Flight Operations
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Live view of subscriptions, campaign moderation, inbox SLAs and
            revenue health.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="join">
            {DATE_RANGE_OPTIONS.map((option) => (
              <Link
                key={option.key}
                href={`/admin?range=${option.key}`}
                className={`btn btn-xs sm:btn-sm join-item rounded-none first:rounded-l-xl last:rounded-r-xl font-bold ${
                  range === option.key ? "btn-primary" : "btn-ghost border-base-300"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>

          <Link
            href="/admin/moderation"
            className="btn btn-sm bg-primary text-primary-content font-bold rounded-xl text-xs px-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Moderation queue</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold"
          >
            Inventory desk
          </Link>
        </div>
      </div>

      <Suspense fallback={<KpiSkeleton />}>
        <KpiSection range={range} isAdmin={isAdmin} />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection range={range} isStaff={!isAdmin} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Suspense fallback={<ListSkeleton />}>
          <AttentionSection />
        </Suspense>
        <Suspense fallback={<ListSkeleton />}>
          <ActivitySection />
        </Suspense>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link
          href="/admin/moderation"
          className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-base-content">Campaign moderation</div>
            <div className="text-[11px] text-base-content/60">Review creative and dispatch orders</div>
          </div>
        </Link>
        <Link
          href="/admin/pop"
          className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-base-content">Proof of performance</div>
            <div className="text-[11px] text-base-content/60">Verify field and broadcast evidence</div>
          </div>
        </Link>
        <Link
          href="/admin/adboosters"
          className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-base-content">AdBoosters network</div>
            <div className="text-[11px] text-base-content/60">Audit promoters and commissions</div>
          </div>
        </Link>
        <Link
          href="/admin/subscriptions"
          className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-base-content">Subscriptions</div>
            <div className="text-[11px] text-base-content/60">Plans, renewals and entitlements</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
