"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  Sparkles,
  Share2,
  Copy,
  CheckCircle2,
  TrendingUp,
  Users,
  Coins,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function AdBoostersPage() {
  const { showToast, openCreateModal } = useCampaign();
  const [copied, setCopied] = useState(false);
  const referralLink = "https://advers.ng/boost/ref-olumide92";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast("AdBooster campaign link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Crowd Promotional Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            AdBoosters Network
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Extend campaign reach through verified community promoters and referral commissions.
          </p>
        </div>

        <button
          onClick={() => openCreateModal("AdBoosters")}
          className="btn bg-[#101113] hover:bg-black text-white border-none rounded-xl px-5 text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Launch booster campaign</span>
        </button>
      </div>

      {/* Program Highlight Card */}
      <div className="bg-[#101113] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/5 space-y-4">
        <div className="max-w-xl space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#f7d98a]">
            Turn Sharing Into Opportunity
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Amplify your reach with 2,400+ active Nigerian promoters.
          </h2>
          <p className="text-xs sm:text-sm text-[#bfc0c5] leading-relaxed">
            AdBoosters distributes your approved campaign collateral across active WhatsApp broadcast lists, telegram groups, and social feeds. Promoters earn transparent commission only on verified results.
          </p>
        </div>

        {/* Share Link Generator Box */}
        <div className="bg-[#1c1d20] border border-[#303136] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-2xl">
          <div className="min-w-0">
            <div className="text-[10px] text-[#a6a8af] font-bold uppercase tracking-wider">
              Your Unique Promoter Tracking Link
            </div>
            <div className="text-xs sm:text-sm font-mono text-[#f7d98a] truncate mt-1">
              {referralLink}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="btn btn-sm bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] font-bold border-none rounded-xl text-xs flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Total Boost Shares</span>
            <Share2 className="w-4 h-4 text-[#986d16]" />
          </div>
          <div className="text-2xl font-black text-[#15171b] tracking-tight mt-2">
            1,482
          </div>
          <div className="text-[11px] text-[#16845b] font-bold mt-1">
            ↗ 14% reach surge this week
          </div>
        </div>

        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Active Promoters</span>
            <Users className="w-4 h-4 text-[#19764b]" />
          </div>
          <div className="text-2xl font-black text-[#15171b] tracking-tight mt-2">
            340
          </div>
          <div className="text-[11px] text-[#7c818b] font-medium mt-1">
            Verified Nigerian accounts
          </div>
        </div>

        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Commissions Accrued</span>
            <Coins className="w-4 h-4 text-[#8b6416]" />
          </div>
          <div className="text-2xl font-black text-[#15171b] tracking-tight mt-2">
            ₦58,400
          </div>
          <div className="text-[11px] text-[#8b6416] font-bold mt-1">
            Performance verified
          </div>
        </div>
      </div>

      {/* How it works info */}
      <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#15171b]">
          How the AdBoosters Programme Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#f8f9fa] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#fff4d9] text-[#986d16] font-black text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-[#15171b]">
              Attach Booster to Campaign
            </div>
            <p className="text-[11px] text-[#7c818b] leading-relaxed">
              When creating any billboard, radio, or digital campaign, allocate a booster commission pool.
            </p>
          </div>

          <div className="p-4 bg-[#f8f9fa] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#fff4d9] text-[#986d16] font-black text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-[#15171b]">
              Promoters Share Everywhere
            </div>
            <p className="text-[11px] text-[#7c818b] leading-relaxed">
              Vetted promoters receive approved flyers, jingles, and trackable links to share with their audiences.
            </p>
          </div>

          <div className="p-4 bg-[#f8f9fa] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#fff4d9] text-[#986d16] font-black text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-[#15171b]">
              Verified Results & Payouts
            </div>
            <p className="text-[11px] text-[#7c818b] leading-relaxed">
              Advers anti-fraud engines verify genuine clicks and actions before distributing commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

