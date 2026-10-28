"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Users,
  ShieldAlert,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function AdminAdBoostersPage() {
  const [notice, setNotice] = useState<string | null>(null);

  const promoters = [
    {
      id: "BOOST-01",
      name: "Chukwudi Eze",
      handle: "@chuks_hype",
      network: "WhatsApp & Telegram (14k Reach)",
      sharesLogged: 420,
      verifiedClicks: 1840,
      earnedCommission: "₦32,500",
      fraudRisk: "LOW",
      status: "ACTIVE",
    },
    {
      id: "BOOST-02",
      name: "Blessing Johnson",
      handle: "@blessing_promo",
      network: "X & Instagram (22k Reach)",
      sharesLogged: 310,
      verifiedClicks: 1420,
      earnedCommission: "₦25,900",
      fraudRisk: "LOW",
      status: "ACTIVE",
    },
    {
      id: "BOOST-03",
      name: "Anonymous User (IP Cluster)",
      handle: "@bot_node_42",
      network: "Proxy Bot Ring",
      sharesLogged: 890,
      verifiedClicks: 42,
      earnedCommission: "₦0",
      fraudRisk: "CRITICAL_BOT",
      status: "FLAGGED_BLOCKED",
    },
  ];

  const handleDisburse = () => {
    setNotice("Batch commission payout initiated via Paystack Transfer API!");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="alert alert-success shadow-lg text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Crowd Referral Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            AdBoosters Network Administration
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Audit promoter sharing activity, detect bot click fraud, and disburse verified performance commissions.
          </p>
        </div>

        <button
          onClick={handleDisburse}
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Coins className="w-4 h-4" />
          <span>Disburse Batch Commissions (₦58,400)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Registered Promoters
          </div>
          <div className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-1.5">
            340 Promoters
          </div>
          <div className="text-[11px] text-success font-bold mt-1">
            Across 18 Nigerian states
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Total Verified Crowd Clicks
          </div>
          <div className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-1.5">
            48,290
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            Audited for human interaction
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Anti-Fraud Filter
          </div>
          <div className="text-2xl sm:text-3xl font-black text-error tracking-tight mt-1.5">
            3 Bot Clusters Blocked
          </div>
          <div className="text-[11px] text-error font-bold mt-1">
            ₦140k client budget saved
          </div>
        </div>
      </div>

      {/* Promoters Table */}
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-base-200">
          <h3 className="text-base font-bold text-base-content">
            Promoter Performance & Risk Audit
          </h3>
          <span className="badge badge-primary badge-sm font-bold">
            Live Traffic Inspection
          </span>
        </div>

        <table className="table table-sm w-full">
          <thead>
            <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
              <th>Promoter & ID</th>
              <th>Channel Network</th>
              <th>Shares Logged</th>
              <th>Verified Clicks</th>
              <th>Commission Accrued</th>
              <th>Fraud Risk</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {promoters.map((p) => (
              <tr key={p.id} className="hover:bg-base-200/50 transition-colors">
                <td>
                  <div className="font-black text-base-content">{p.name}</div>
                  <div className="text-[10px] font-mono text-base-content/50">
                    {p.id} · {p.handle}
                  </div>
                </td>
                <td className="text-base-content/80 font-medium">{p.network}</td>
                <td className="font-mono font-bold text-base-content">{p.sharesLogged}</td>
                <td className="font-mono font-bold text-success">{p.verifiedClicks}</td>
                <td className="font-mono font-black text-base-content">{p.earnedCommission}</td>
                <td>
                  <span
                    className={`badge badge-xs font-bold ${
                      p.fraudRisk === "LOW"
                        ? "badge-success badge-soft"
                        : "badge-error"
                    }`}
                  >
                    {p.fraudRisk}
                  </span>
                </td>
                <td className="text-right">
                  <button className="btn btn-xs btn-ghost border border-base-300 rounded-lg text-xs font-bold">
                    View Logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

