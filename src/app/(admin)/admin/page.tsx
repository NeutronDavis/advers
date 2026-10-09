import React, { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  UserX,
  Inbox,
  FileSpreadsheet,
  Briefcase,
  Wallet,
  AlertTriangle,
  RefreshCw,
  Tv,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import {
  getAdminKPICards,
  getAdminDashboardCharts,
  getNeedsAttentionItems,
  getRecentActivityLogs,
} from "@/lib/kpi";
import AdminCharts from "./AdminCharts";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await requireStaff();
  const isStaff = session.role === "STAFF";

  const resolvedParams = await searchParams;
  const currentRange = resolvedParams?.range || "30d";

  const [kpis, chartsData, attentionItems, activityLogs] = await Promise.all([
    getAdminKPICards(currentRange),
    getAdminDashboardCharts(currentRange),
    getNeedsAttentionItems(),
    getRecentActivityLogs(10),
  ]);

  const formatNaira = (val: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Dashboard Top Header & Mobile Swipeable Date-Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Executive Dashboard
            </h1>
            <span className="badge badge-primary text-[10px] sm:text-xs font-bold">Live OS</span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-0.5">
            Welcome back, <span className="font-bold text-base-content">{session.name}</span>.
          </p>
        </div>

        {/* Date-Range Selector (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 bg-base-200/80 p-1.5 rounded-2xl border border-base-200 overflow-x-auto max-w-full w-full sm:w-auto no-scrollbar shrink-0">
          <Calendar className="w-4 h-4 text-base-content/50 ml-1 shrink-0 hidden sm:block" />
          {[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
            { label: "This Month", value: "this_month" },
          ].map((item) => (
            <Link
              key={item.value}
              href={`/admin?range=${item.value}`}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                currentRange === item.value
                  ? "bg-primary text-primary-content shadow-xs"
                  : "text-base-content/70 hover:bg-base-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Row 1: Mobile App Vibe 2-Column Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Signups */}
        <Link
          href="/admin/users"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 font-bold">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-ghost text-[9px] sm:text-[10px] font-bold">
              +{kpis.totalSignups.changeThisWeek} 7d
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.totalSignups.value}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-primary transition-colors flex items-center justify-between mt-0.5">
              <span>Signups</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 2. Unverified Signups */}
        <Link
          href="/admin/users?status=UNVERIFIED"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-warning/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 font-bold">
              <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            {kpis.unverifiedSignups > 0 && (
              <span className="badge badge-warning text-[9px] sm:text-[10px] font-bold">Alert</span>
            )}
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.unverifiedSignups}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-warning transition-colors flex items-center justify-between mt-0.5">
              <span>Unverified</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 3. New Leads */}
        <Link
          href="/admin/leads"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 font-bold">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-ghost text-[9px] sm:text-[10px] font-bold">30d</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.newLeads30d}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-primary transition-colors flex items-center justify-between mt-0.5">
              <span>New Leads</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 4. Unread Inbox */}
        <Link
          href="/admin/inbox"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-rose-500/10 text-rose-600 font-bold">
              <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            {kpis.unreadInbox.hasOverdue24h && (
              <span className="badge badge-error text-[9px] sm:text-[10px] font-bold animate-pulse text-white">
                &gt;24h
              </span>
            )}
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.unreadInbox.total}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-primary transition-colors flex items-center justify-between mt-0.5">
              <span>Unread Inbox</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 5. Quotes Awaiting Response */}
        <Link
          href="/admin/leads?status=QUOTE"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-600 font-bold">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-ghost text-[9px] sm:text-[10px] font-bold">Pending</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.quotesAwaitingResponse}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-primary transition-colors flex items-center justify-between mt-0.5">
              <span>Quotes</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 6. Active Projects */}
        <Link
          href="/admin/projects"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-outline text-[9px] sm:text-[10px] font-bold">
              {kpis.activeProjects.waitingOnClientCount} wait client
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.activeProjects.total}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-emerald-600 transition-colors flex items-center justify-between mt-0.5">
              <span>Active Builds</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 7. Revenue Collected */}
        <Link
          href="/admin/invoices"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            {!isStaff && (
              <span
                className={`badge text-[9px] sm:text-[10px] font-bold gap-0.5 ${
                  kpis.revenueThisMonth.changeVsLastMonthPercent >= 0
                    ? "badge-success text-white"
                    : "badge-error text-white"
                }`}
              >
                {kpis.revenueThisMonth.changeVsLastMonthPercent >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(kpis.revenueThisMonth.changeVsLastMonthPercent)}%
              </span>
            )}
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-base sm:text-xl font-extrabold text-base-content tracking-tight truncate">
              {isStaff ? "🔒 Hidden" : formatNaira(kpis.revenueThisMonth.amount)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-emerald-600 transition-colors flex items-center justify-between mt-0.5">
              <span>Revenue</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 8. Outstanding Invoices */}
        <Link
          href="/admin/invoices?status=OVERDUE"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-error/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-error/10 text-error font-bold">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            {kpis.outstandingInvoices.overdueCount > 0 && (
              <span className="badge badge-error text-[9px] sm:text-[10px] font-bold text-white">
                {kpis.outstandingInvoices.overdueCount} Overdue
              </span>
            )}
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-base sm:text-xl font-extrabold text-base-content tracking-tight truncate">
              {isStaff ? "🔒 Hidden" : formatNaira(kpis.outstandingInvoices.amount)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-error transition-colors flex items-center justify-between mt-0.5">
              <span>Outstanding</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 9. Renewals Due */}
        <Link
          href="/admin/renewals"
          className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-cyan-500/10 text-cyan-600 font-bold">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-ghost text-[9px] sm:text-[10px] font-bold">30d</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {kpis.renewalsDue30d}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/60 group-hover:text-cyan-600 transition-colors flex items-center justify-between mt-0.5">
              <span>Renewals</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 10. Billboard Occupancy */}
        <div className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-3d opacity-75 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-base-200 text-base-content/60 font-bold">
              <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="badge badge-ghost text-[9px] sm:text-[10px] font-bold">Soon</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-base sm:text-xl font-extrabold text-base-content/60 tracking-tight">
              {kpis.billboardOccupancyPercent}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-base-content/50 mt-0.5">
              Occupancy
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Recharts) */}
      <Suspense fallback={<div className="h-64 bg-base-200/50 rounded-3xl animate-pulse" />}>
        <AdminCharts chartsData={chartsData} isStaff={isStaff} />
      </Suspense>

      {/* Row 3 & Row 4: Needs Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 3: Needs Attention List */}
        <div className="bg-base-100 p-5 sm:p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-extrabold text-base-content flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Needs Attention</span>
              <span className="badge badge-warning text-[10px] sm:text-xs font-bold">
                {attentionItems.length} Items
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {attentionItems.length === 0 ? (
              <div className="p-8 text-center bg-base-200/30 rounded-2xl text-xs text-base-content/60">
                🎉 No critical items requiring immediate staff action!
              </div>
            ) : (
              attentionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="flex items-start justify-between p-3.5 sm:p-4 rounded-2xl bg-base-200/40 border border-base-200 hover:border-primary/50 transition-all group"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge text-[9px] sm:text-[10px] font-extrabold ${
                          item.severity === "high" ? "badge-error text-white" : "badge-warning"
                        }`}
                      >
                        {item.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-base-content group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-base-content/70 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      {item.timeText}
                    </span>
                    <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Row 4: Recent Activity Feed */}
        <div className="bg-base-100 p-5 sm:p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-extrabold text-base-content flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Recent Activity Feed</span>
            </h2>
            <span className="text-xs font-bold text-base-content/50">Audit Trail</span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center bg-base-200/30 rounded-2xl text-xs text-base-content/60">
                No activity records recorded yet.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 sm:p-3.5 rounded-2xl bg-base-200/30 border border-base-200/60"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-base-content">
                        {log.description}
                      </div>
                      <div className="text-[10px] text-base-content/60 font-medium mt-0.5">
                        {log.userName && <span>User: {log.userName} • </span>}
                        {log.clientName && <span>Client: {log.clientName} • </span>}
                        <span>Action: {log.action}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-base-content/50 shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
