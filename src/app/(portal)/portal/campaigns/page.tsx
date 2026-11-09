"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCampaign } from "@/context/CampaignContext";
import {
  campaignStatusClass,
  campaignStatusLabel,
} from "@/lib/types/campaign";
import {
  Layers,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function MyCampaignsPage() {
  const { campaigns, openCreateModal } = useCampaign();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = campaigns.filter((c) => {
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Advertising Flights
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            My Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Monitor real-time approval status, live flights, and proof of performance.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="btn bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl px-5 text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch new campaign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Campaigns" },
            { id: "ACTIVE", label: "● Active Flights" },
            { id: "IN_REVIEW", label: "◷ In Review" },
            { id: "DRAFT", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
                filterStatus === tab.id
                  ? "bg-[var(--portal-obsidian)] text-white shadow-xs"
                  : "bg-[var(--portal-surface)] text-[var(--portal-muted)] border-[var(--portal-line)] hover:bg-base-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[var(--portal-icon)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full bg-[var(--portal-surface)] border-[var(--portal-line)] rounded-xl pl-8 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Campaigns Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-14 text-center bg-[var(--portal-surface)] rounded-3xl border border-[var(--portal-line)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] mx-auto flex items-center justify-center text-xl font-bold">
              ▣
            </div>
            <div className="text-sm font-bold text-[var(--portal-ink)]">
              No campaigns found
            </div>
            <p className="text-xs text-[var(--portal-muted)] max-w-sm mx-auto">
              There are no campaigns matching your filter. Start by exploring channels and launching a new advertising flight.
            </p>
            <button
              onClick={() => openCreateModal()}
              className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none font-bold rounded-xl text-xs"
            >
              Create first campaign
            </button>
          </div>
        ) : (
          filtered.map((camp) => (
            <div
              key={camp.id}
              className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-5 shadow-xs hover:border-[var(--portal-gold)] transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[var(--portal-gold-soft-4)] flex items-center justify-center text-lg font-bold text-[var(--portal-obsidian)] shrink-0">
                    {camp.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--portal-ink)] leading-snug">
                      {camp.name}
                    </h3>
                    <div className="text-[11px] text-[var(--portal-muted)] mt-0.5">
                      {camp.channel} · {camp.location}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge badge-sm font-bold text-[10px] shrink-0 ${campaignStatusClass(
                    camp.status
                  )}`}
                >
                  {camp.statusLabel || campaignStatusLabel(camp.status)}
                </span>
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--portal-soft)] rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Budget
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    ₦{camp.budget.toLocaleString("en-NG")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Duration
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {camp.duration}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Goal
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5 truncate px-1">
                    {camp.goal}
                  </div>
                </div>
              </div>

              {/* Proof of Performance Status */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--portal-line-soft)] text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--portal-muted)]">
                  <FileCheck className="w-3.5 h-3.5 text-[var(--portal-success)]" />
                  <span>
                    {camp.status === "ACTIVE"
                      ? "Proof of performance verified"
                      : "Awaiting broadcast affidavit"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/campaigns/${camp.id}`}
                    className="text-xs font-bold text-[var(--portal-gold-ink)] hover:underline flex items-center gap-1"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openCreateModal(camp.channel)}
                    className="btn btn-xs btn-ghost border border-[var(--portal-line)] rounded-lg text-[10px] font-bold"
                  >
                    Rebook
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

