"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatNaira } from "@/lib/format";

export default function ReportsClient({
  consolidated,
  planName,
  profiles,
  selectedProfileId,
  totals,
  statusCounts,
  channels,
  profileBreakdown,
}: {
  consolidated: boolean;
  planName: string;
  profiles: { id: string; name: string; isPrimary: boolean }[];
  selectedProfileId: string;
  totals: {
    campaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalBudget: number;
    totalPaid: number;
    totalOutstanding: number;
    totalQuoted: number;
  };
  statusCounts: Record<string, number>;
  channels: { label: string; count: number; budget: number }[];
  profileBreakdown: {
    id: string;
    name: string;
    isPrimary: boolean;
    campaigns: number;
    budget: number;
    paid: number;
  }[];
}) {
  const router = useRouter();
  const maxChannelBudget = Math.max(1, ...channels.map((channel) => channel.budget));

  const kpis = [
    {
      label: "Campaigns",
      value: totals.campaigns.toString(),
      subtext: `${totals.activeCampaigns} active · ${totals.completedCampaigns} completed`,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "Planned budget",
      value: formatNaira(totals.totalBudget),
      subtext: "Across visible campaigns",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "Paid",
      value: formatNaira(totals.totalPaid),
      subtext: "Campaign invoices paid",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: "Outstanding",
      value: formatNaira(totals.totalOutstanding),
      subtext: "Pending or overdue invoices",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: "Quoted",
      value: formatNaira(totals.totalQuoted),
      subtext: "Issued campaign quotes",
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Business Pro reporting
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Campaign Reports
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Consolidated campaign, spend and channel reporting across your
            business profiles and branches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
            {planName}
          </span>
          <select
            value={selectedProfileId}
            onChange={(event) =>
              router.push(
                event.target.value === "ALL"
                  ? "/portal/reports"
                  : `/portal/reports?profile=${event.target.value}`
              )
            }
            disabled={!consolidated}
            className="select select-bordered select-sm text-xs rounded-xl bg-[var(--portal-surface)] border-[var(--portal-line)] disabled:opacity-70"
          >
            {consolidated && <option value="ALL">All profiles</option>}
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
                {profile.isPrimary ? " (Primary)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!consolidated && (
        <div className="alert bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)] text-[var(--portal-body)] rounded-2xl text-xs">
          <BarChart3 className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>
            Consolidated multi-location reporting is a Business Pro feature.
            You are viewing your primary business profile.
          </span>
          <Link
            href="/portal/billing"
            className="btn btn-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none rounded-lg font-bold ml-auto gap-1"
          >
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 shadow-xs"
          >
            <div className="flex items-center justify-between text-[var(--portal-muted)] text-[10px] font-bold uppercase">
              <span>{kpi.label}</span>
              <div className="w-7 h-7 rounded-lg bg-[var(--portal-soft)] flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--portal-ink)] mt-2">
              {kpi.value}
            </div>
            <div className="text-[10px] text-[var(--portal-muted)] mt-0.5">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Channel breakdown
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Campaign count and planned budget by advertising channel.
            </p>
          </div>

          {channels.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--portal-muted)]">
              No campaigns to report yet.
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel) => (
                <div key={channel.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--portal-body)]">
                      {channel.label}
                    </span>
                    <span className="text-[var(--portal-muted)]">
                      {channel.count} · {formatNaira(channel.budget)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--portal-line-soft)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--portal-gold)]"
                      style={{
                        width: `${Math.max(
                          4,
                          Math.round((channel.budget / maxChannelBudget) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Campaign status
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Distribution of campaigns across the workflow.
            </p>
          </div>

          {Object.keys(statusCounts).length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--portal-muted)]">
              No campaign status data yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="p-3 rounded-2xl bg-[var(--portal-soft)] flex items-center justify-between"
                >
                  <span className="text-[10px] font-bold text-[var(--portal-body)]">
                    {status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-black text-[var(--portal-ink)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--portal-gold-ink)]" />
            Profile &amp; branch performance
          </h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            Consolidated view across business profiles and branches.
          </p>
        </div>

        {profileBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--portal-muted)]">
            No business profiles yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-[var(--portal-muted)] border-b border-[var(--portal-line)]">
                  <th>Profile</th>
                  <th>Campaigns</th>
                  <th>Planned budget</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--portal-line-soft)] text-xs">
                {profileBreakdown.map((profile) => (
                  <tr key={profile.id}>
                    <td className="font-bold text-[var(--portal-ink)]">
                      {profile.name}
                      {profile.isPrimary && (
                        <span className="badge badge-xs ml-1 bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none font-bold">
                          Primary
                        </span>
                      )}
                    </td>
                    <td>{profile.campaigns}</td>
                    <td className="font-mono">{formatNaira(profile.budget)}</td>
                    <td className="font-mono font-bold">{formatNaira(profile.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-3 rounded-2xl bg-[var(--portal-soft)] text-[10px] text-[var(--portal-muted)]">
        Reports reflect recorded campaign data, invoices and available media
        partner information. They do not promise audience reach, sales or campaign
        outcomes.
      </div>
    </div>
  );
}
