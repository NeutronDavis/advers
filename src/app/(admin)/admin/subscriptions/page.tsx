import React from "react";
import Link from "next/link";
import {
  CreditCard,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  Users,
  ArrowRight,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD"] as const;

export default async function AdminSubscriptionsPage() {
  await requireStaff();

  const now = new Date();
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const subscriptions = await prisma.subscription.findMany({
    include: {
      client: { select: { id: true, name: true } },
      plan: { select: { key: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const activeSubscriptions = subscriptions.filter((subscription) =>
    (ACTIVE_STATUSES as readonly string[]).includes(subscription.status)
  );

  const monthlyRecurringRevenue = activeSubscriptions.reduce(
    (total, subscription) => {
      const monthly =
        subscription.billingPeriod === "ANNUAL"
          ? Math.round(subscription.price / 12)
          : subscription.price;
      return total + monthly;
    },
    0
  );

  const renewalsDue = activeSubscriptions.filter(
    (subscription) =>
      subscription.renewalDate >= now && subscription.renewalDate <= thirtyDaysAhead
  ).length;

  const pastDue = subscriptions.filter((subscription) =>
    ["PAYMENT_FAILED", "EXPIRED"].includes(subscription.status)
  ).length;

  const kpis = [
    {
      label: "Active subscriptions",
      value: activeSubscriptions.length.toString(),
      subtext: "Active, renewal due or grace period",
      icon: <CreditCard className="w-4 h-4" />,
      href: "#subscriptions",
    },
    {
      label: "Monthly recurring revenue",
      value: formatNaira(monthlyRecurringRevenue),
      subtext: "Annual plans normalised to monthly",
      icon: <TrendingUp className="w-4 h-4" />,
      href: "#subscriptions",
    },
    {
      label: "Renewals due in 30 days",
      value: renewalsDue.toString(),
      subtext: "Upcoming renewal dates",
      icon: <CalendarClock className="w-4 h-4" />,
      href: "#subscriptions",
    },
    {
      label: "Past due / expired",
      value: pastDue.toString(),
      subtext: "Requires finance follow-up",
      icon: <AlertTriangle className="w-4 h-4" />,
      href: "#subscriptions",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Marketing Access Plans
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Subscriptions &amp; Plan Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Track plan status, billing periods, renewals and entitlement limits
            across advertiser accounts.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold self-start sm:self-auto"
        >
          <Users className="w-4 h-4" />
          <span>User directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between text-base-content/60 text-[11px] font-bold">
              <span>{kpi.label}</span>
              <div className="w-7 h-7 rounded-lg bg-base-200 text-base-content flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-base-content tracking-tight mt-2.5">
              {kpi.value}
            </div>
            <div className="text-[10px] text-base-content/50 mt-0.5">
              {kpi.subtext}
            </div>
          </Link>
        ))}
      </div>

      <div
        id="subscriptions"
        className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-base-200">
          <div>
            <h2 className="text-base font-bold text-base-content">
              Subscription ledger
            </h2>
            <p className="text-xs text-base-content/60">
              Latest {subscriptions.length} subscription records across all
              accounts.
            </p>
          </div>
          <span className="badge badge-primary badge-sm font-bold">
            {activeSubscriptions.length} active
          </span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="py-12 text-center text-xs text-base-content/60">
            No subscriptions yet. Seed the plans and subscriptions, or subscribe
            from a client account.
          </div>
        ) : (
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                <th>Account</th>
                <th>Plan</th>
                <th>Billing</th>
                <th>Status</th>
                <th>Price</th>
                <th>Start</th>
                <th>Renewal</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs">
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="hover:bg-base-200/50 transition-colors"
                >
                  <td>
                    <div className="font-black text-base-content">
                      {subscription.client.name}
                    </div>
                    <div className="text-[10px] font-mono text-base-content/50">
                      {subscription.client.id.slice(-8)}
                    </div>
                  </td>
                  <td className="font-bold text-base-content">
                    {subscription.plan.name}
                  </td>
                  <td className="text-base-content/70">
                    {subscription.billingPeriod.toLowerCase()}
                  </td>
                  <td>
                    <span
                      className={`badge badge-xs font-bold ${
                        (ACTIVE_STATUSES as readonly string[]).includes(
                          subscription.status
                        )
                          ? "badge-success badge-soft"
                          : ["PAYMENT_FAILED", "EXPIRED"].includes(
                                subscription.status
                              )
                            ? "badge-error badge-soft"
                            : "badge-warning badge-soft"
                      }`}
                    >
                      {subscription.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="font-mono font-bold text-base-content">
                    {formatNaira(subscription.price)}
                  </td>
                  <td className="text-base-content/70">
                    {formatDate(subscription.startDate)}
                  </td>
                  <td className="text-base-content/70">
                    {formatDate(subscription.renewalDate)}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/users?search=${encodeURIComponent(
                        subscription.client.name
                      )}`}
                      className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold gap-1"
                    >
                      <span>View account</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
