"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Play,
  Download,
  Send,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function CampaignModerationPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState([
    {
      id: "CAMP-8841",
      client: "Adebayo Holdings Ltd",
      name: "Q4 Festive Clearance Hype",
      channel: "Digital billboards",
      location: "Lagos (Lekki Toll Plaza)",
      budget: 350000,
      duration: "2 weeks",
      submitted: "2026-10-27 10:14",
      assetType: "MP4 Video (1080x1920, 15s)",
      arconNumber: "ARCON/LAG/2026/891",
      status: "PENDING",
    },
    {
      id: "CAMP-8840",
      client: "Zinox Retail Store",
      name: "Drive-Time Flash Sale",
      channel: "FM radio",
      location: "Rivers (Cool FM & Nigeria Info)",
      budget: 120000,
      duration: "1 week",
      submitted: "2026-10-27 09:30",
      assetType: "Audio WAV (44.1kHz, 30s)",
      arconNumber: "Pending Self-Reg",
      status: "PENDING",
    },
    {
      id: "CAMP-8839",
      client: "GreenEnergy NG",
      name: "Solar Inverter Product Showcase",
      channel: "Television",
      location: "Nationwide (Channels TV)",
      budget: 750000,
      duration: "1 week",
      submitted: "2026-10-27 08:45",
      assetType: "Broadcast ProRes Master (1080p, 45s)",
      arconNumber: "ARCON/NAT/2026/102",
      status: "PENDING",
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c))
    );
    setActionNotice(`Campaign ${name} approved and dispatched to media partner traffic desk.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleReject = (id: string, name: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "REVISION_REQUESTED" } : c))
    );
    setActionNotice(`Revision requested for ${name}. Notification sent to advertiser.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filtered = campaigns.filter((c) =>
    activeTab === "ALL" ? true : c.status === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="alert alert-success shadow-lg text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Compliance & Media Booking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Campaign Moderation Desk
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Inspect creative assets, verify regulatory clearances (ARCON), and dispatch transmission orders.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { id: "PENDING", label: "Pending Review" },
          { id: "APPROVED", label: "Dispatched & Approved" },
          { id: "REVISION_REQUESTED", label: "Revision Requested" },
          { id: "ALL", label: "All Campaigns" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "btn-primary shadow-xs"
                : "btn-ghost border border-base-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center text-xs text-base-content/60">
            No campaigns currently in this moderation stage.
          </div>
        ) : (
          filtered.map((camp) => (
            <div
              key={camp.id}
              className="card bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {camp.id}
                    </span>
                    <span className="badge badge-sm badge-warning badge-soft font-bold text-[10px]">
                      {camp.status}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-base-content mt-1">
                    {camp.name}
                  </h2>
                  <div className="text-xs text-base-content/60">
                    Advertiser: <span className="font-bold">{camp.client}</span> · Submitted: {camp.submitted}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-base-content font-mono">
                    ₦{camp.budget.toLocaleString("en-NG")}
                  </div>
                  <div className="text-[10px] text-base-content/60">
                    Duration: {camp.duration}
                  </div>
                </div>
              </div>

              {/* Asset & Specs Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-base-200/50 rounded-2xl text-xs">
                <div>
                  <div className="text-[10px] text-base-content/50 font-bold uppercase">
                    Channel & Target
                  </div>
                  <div className="font-bold text-base-content mt-0.5">
                    {camp.channel}
                  </div>
                  <div className="text-[11px] text-base-content/60">
                    {camp.location}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-base-content/50 font-bold uppercase">
                    Creative Asset
                  </div>
                  <div className="font-bold text-base-content mt-0.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{camp.assetType}</span>
                  </div>
                  <button
                    onClick={() => setActionNotice(`Previewing asset for ${camp.name}...`)}
                    className="text-[11px] font-bold text-primary hover:underline mt-0.5"
                  >
                    Inspect preview player →
                  </button>
                </div>

                <div>
                  <div className="text-[10px] text-base-content/50 font-bold uppercase">
                    ARCON Compliance Code
                  </div>
                  <div className="font-mono font-bold text-base-content mt-0.5">
                    {camp.arconNumber}
                  </div>
                  <div className="text-[10px] text-success font-medium">
                    Regulatory clearance verified
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleReject(camp.id, camp.name)}
                  className="btn btn-sm btn-ghost text-error rounded-xl text-xs font-bold"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Request Creative Revision</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(camp.id, camp.name)}
                  className="btn btn-sm btn-primary rounded-xl text-xs font-bold px-5 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Approve & Dispatch Media Order</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

