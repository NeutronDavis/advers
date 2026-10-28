"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Advertising Flights
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            My Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Monitor real-time approval status, live flights, and proof of performance.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="btn bg-[#101113] hover:bg-black text-white border-none rounded-xl px-5 text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
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
                  ? "bg-[#101113] text-white shadow-xs"
                  : "bg-white text-[#7c818b] border-[#e8e9ed] hover:bg-base-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#858993] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full bg-white border-[#e8e9ed] rounded-xl pl-8 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Campaigns Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-14 text-center bg-white rounded-3xl border border-[#e8e9ed] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fff4d9] text-[#986d16] mx-auto flex items-center justify-center text-xl font-bold">
              ▣
            </div>
            <div className="text-sm font-bold text-[#15171b]">
              No campaigns found
            </div>
            <p className="text-xs text-[#7c818b] max-w-sm mx-auto">
              There are no campaigns matching your filter. Start by exploring channels and launching a new advertising flight.
            </p>
            <button
              onClick={() => openCreateModal()}
              className="btn btn-sm bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] border-none font-bold rounded-xl text-xs"
            >
              Create first campaign
            </button>
          </div>
        ) : (
          filtered.map((camp) => (
            <div
              key={camp.id}
              className="card bg-white border border-[#e8e9ed] rounded-2xl p-5 shadow-xs hover:border-[#d6b65f] transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#f5f2ea] flex items-center justify-center text-lg font-bold text-[#101113] shrink-0">
                    {camp.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#15171b] leading-snug">
                      {camp.name}
                    </h3>
                    <div className="text-[11px] text-[#7c818b] mt-0.5">
                      {camp.channel} · {camp.location}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge badge-sm font-bold text-[10px] shrink-0 ${
                    camp.status === "ACTIVE"
                      ? "badge-success badge-soft text-[#19764b]"
                      : camp.status === "IN_REVIEW"
                      ? "badge-warning badge-soft text-[#8b6416]"
                      : "badge-neutral badge-soft text-[#666c77]"
                  }`}
                >
                  {camp.status === "ACTIVE"
                    ? "● Active"
                    : camp.status === "IN_REVIEW"
                    ? "In review"
                    : "Draft"}
                </span>
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#f8f9fa] rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Budget
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5">
                    ₦{camp.budget.toLocaleString("en-NG")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Duration
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5">
                    {camp.duration}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Goal
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5 truncate px-1">
                    {camp.goal}
                  </div>
                </div>
              </div>

              {/* Proof of Performance Status */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f2] text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7c818b]">
                  <FileCheck className="w-3.5 h-3.5 text-[#16845b]" />
                  <span>
                    {camp.status === "ACTIVE"
                      ? "Proof of performance verified"
                      : "Awaiting broadcast affidavit"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateModal(camp.channel)}
                  className="text-xs font-bold text-[#80601f] hover:underline flex items-center gap-1"
                >
                  <span>Rebook slot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

