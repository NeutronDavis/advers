import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Tv,
  Radio,
  FileCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Users,
} from "lucide-react";

export default function AdminOperationsCockpitPage() {
  const kpis = [
    {
      title: "Total Media Billings",
      value: "₦18,450,000",
      change: "+24.5%",
      subtext: "vs. previous month",
      color: "text-emerald-600",
      icon: "₦",
    },
    {
      title: "Active Live Flights",
      value: "16",
      change: "● On Air / On Screen",
      subtext: "Across 8 states",
      color: "text-primary",
      icon: "◉",
    },
    {
      title: "Pending Moderation Queue",
      value: "3",
      change: "Action Required",
      subtext: "Average SLA: 42 mins",
      color: "text-warning",
      icon: "◷",
    },
    {
      title: "Active AdBoosters",
      value: "340",
      change: "2,400+ shares logged",
      subtext: "Crowd reach active",
      color: "text-info",
      icon: "✦",
    },
  ];

  const pendingModeration = [
    {
      id: "CAMP-8841",
      client: "Adebayo Holdings Ltd",
      name: "Q4 Festive Clearance Hype",
      channel: "Digital billboards",
      location: "Lagos (Lekki Toll Plaza)",
      budget: "₦350,000",
      submitted: "28 mins ago",
      complianceStatus: "Creative check passed",
    },
    {
      id: "CAMP-8840",
      client: "Zinox Retail Store",
      name: "Drive-Time Flash Sale",
      channel: "FM radio",
      location: "Rivers (Cool FM & Nigeria Info)",
      budget: "₦120,000",
      submitted: "1 hour ago",
      complianceStatus: "Awaiting audio loudness clearance",
    },
    {
      id: "CAMP-8839",
      client: "GreenEnergy NG",
      name: "Solar Inverter Product Showcase",
      channel: "Television",
      location: "Nationwide (Channels TV)",
      budget: "₦750,000",
      submitted: "2 hours ago",
      complianceStatus: "ARCON disclaimer verified",
    },
  ];

  const channelDistribution = [
    { channel: "Digital Billboards (DOOH)", active: 6, volume: "₦6.2M", percentage: "35%" },
    { channel: "Static Billboards (OOH)", active: 3, volume: "₦4.8M", percentage: "26%" },
    { channel: "FM Radio Advertising", active: 4, volume: "₦3.1M", percentage: "18%" },
    { channel: "Television Advertising", active: 2, volume: "₦2.9M", percentage: "15%" },
    { channel: "Newspapers & Press", active: 1, volume: "₦850K", percentage: "4%" },
    { channel: "Podcast & Influencer Hub", active: 2, volume: "₦600K", percentage: "2%" },
  ];

  return (
    <div className="space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            ADVERS Staff Operations Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mt-0.5">
            Media Flight Operations
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Real-time campaign moderation queue, slot allocation, and proof of performance dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/moderation"
            className="btn btn-sm bg-primary text-primary-content font-bold rounded-xl text-xs px-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Moderation Queue (3)</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold"
          >
            Inventory Desk
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-base-content/60 text-[11px] font-bold">
              <span>{kpi.title}</span>
              <div className="w-7 h-7 rounded-lg bg-base-200 text-base-content flex items-center justify-center font-bold text-xs">
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-2.5">
              {kpi.value}
            </div>
            <div className={`text-[11px] font-bold mt-1 ${kpi.color}`}>
              {kpi.change}
            </div>
            <div className="text-[10px] text-base-content/50 mt-0.5">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Priority Moderation Queue Table */}
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-base-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-base-content">
                Urgent Campaign Moderation Queue
              </h2>
              <span className="badge badge-warning badge-sm font-bold">
                3 Pending Review
              </span>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Review creative assets, verify ARCON compliance, and dispatch booking orders to media house traffic departments.
            </p>
          </div>

          <Link
            href="/admin/moderation"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all in moderation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                <th>Campaign & ID</th>
                <th>Advertiser</th>
                <th>Channel & Location</th>
                <th>Budget (₦)</th>
                <th>Compliance Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs">
              {pendingModeration.map((camp) => (
                <tr key={camp.id} className="hover:bg-base-200/50 transition-colors">
                  <td className="font-bold">
                    <div className="text-base-content font-black">
                      {camp.name}
                    </div>
                    <div className="text-[10px] font-mono text-base-content/50">
                      {camp.id} · {camp.submitted}
                    </div>
                  </td>
                  <td className="text-base-content font-medium">
                    {camp.client}
                  </td>
                  <td>
                    <div className="font-bold text-base-content">
                      {camp.channel}
                    </div>
                    <div className="text-[10px] text-base-content/60">
                      {camp.location}
                    </div>
                  </td>
                  <td className="font-mono font-bold text-base-content">
                    {camp.budget}
                  </td>
                  <td>
                    <span className="badge badge-xs badge-success badge-soft font-bold text-[10px]">
                      {camp.complianceStatus}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href="/admin/moderation"
                      className="btn btn-xs bg-primary text-primary-content rounded-lg font-bold"
                    >
                      Review & Dispatch
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Channel Volume & Operations Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Channel Allocation */}
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-base-content">
              Active Channel Inventory Allocation
            </h3>
            <p className="text-xs text-base-content/60">
              Distribution of deployed advertiser funds across participating media owners.
            </p>
          </div>

          <div className="space-y-3">
            {channelDistribution.map((ch) => (
              <div key={ch.channel} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-base-content">
                  <span>{ch.channel}</span>
                  <span className="font-mono text-base-content/80">
                    {ch.volume} ({ch.active} flights)
                  </span>
                </div>
                <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: ch.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Broadcast Proof Activity */}
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-base-content">
                Live Proof of Performance Logs
              </h3>
              <p className="text-xs text-base-content/60">
                Recent station affidavits and field inspection photo submissions.
              </p>
            </div>
            <Link
              href="/admin/pop"
              className="text-xs font-bold text-primary hover:underline"
            >
              Upload Proof →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                time: "10 mins ago",
                desc: "Lekki Toll DOOH Screen #2: Day-time loop photo uploaded by Field Agent Samuel.",
                tag: "Verified",
              },
              {
                time: "45 mins ago",
                desc: "Cool FM 96.9 Lagos: Morning drive-time transmission certificate ingested.",
                tag: "Affidavit Signed",
              },
              {
                time: "2 hours ago",
                desc: "Punch Newspaper (Oct 27 issue): Page 8 quarter-strip tearsheet verified.",
                tag: "Tearsheet Ready",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3 bg-base-200/50 rounded-2xl flex items-start gap-3 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-base-content font-medium leading-relaxed">
                    {item.desc}
                  </div>
                  <div className="text-[10px] text-base-content/50 font-mono mt-1">
                    {item.time} · {item.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
