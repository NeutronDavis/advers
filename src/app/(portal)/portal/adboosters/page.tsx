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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Crowd Promotional Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            AdBoosters Network
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Extend campaign reach through verified community promoters and referral commissions.
          </p>
        </div>

        <button
          onClick={() => openCreateModal("AdBoosters")}
          className="btn bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl px-5 text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Launch booster campaign</span>
        </button>
      </div>

      {/* Program Highlight Card */}
      <div className="bg-[var(--portal-obsidian)] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/5 space-y-4">
        <div className="max-w-xl space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-gold-ink)]">
            Turn Sharing Into Opportunity
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Amplify your reach with 2,400+ active Nigerian promoters.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--portal-obsidian-muted-2)] leading-relaxed">
            AdBoosters distributes your approved campaign collateral across active WhatsApp broadcast lists, telegram groups, and social feeds. Promoters earn transparent commission only on verified results.
          </p>
        </div>

        {/* Share Link Generator Box */}
        <div className="bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-2xl">
          <div className="min-w-0">
            <div className="text-[10px] text-[var(--portal-obsidian-muted)] font-bold uppercase tracking-wider">
              Your Unique Promoter Tracking Link
            </div>
            <div className="text-xs sm:text-sm font-mono text-[var(--portal-gold-ink)] truncate mt-1">
              {referralLink}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] font-bold border-none rounded-xl text-xs flex items-center gap-1.5 shrink-0"
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
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--portal-muted)] text-[11px] font-bold">
            <span>Total Boost Shares</span>
            <Share2 className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          </div>
          <div className="text-2xl font-black text-[var(--portal-ink)] tracking-tight mt-2">
            1,482
          </div>
          <div className="text-[11px] text-[var(--portal-success)] font-bold mt-1">
            ↗ 14% reach surge this week
          </div>
        </div>

        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--portal-muted)] text-[11px] font-bold">
            <span>Active Promoters</span>
            <Users className="w-4 h-4 text-[var(--portal-success-strong)]" />
          </div>
          <div className="text-2xl font-black text-[var(--portal-ink)] tracking-tight mt-2">
            340
          </div>
          <div className="text-[11px] text-[var(--portal-muted)] font-medium mt-1">
            Verified Nigerian accounts
          </div>
        </div>

        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--portal-muted)] text-[11px] font-bold">
            <span>Commissions Accrued</span>
            <Coins className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          </div>
          <div className="text-2xl font-black text-[var(--portal-ink)] tracking-tight mt-2">
            ₦58,400
          </div>
          <div className="text-[11px] text-[var(--portal-gold-ink)] font-bold mt-1">
            Performance verified
          </div>
        </div>
      </div>

      {/* How it works info */}
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[var(--portal-ink)]">
          How the AdBoosters Programme Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--portal-soft)] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] font-black text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Attach Booster to Campaign
            </div>
            <p className="text-[11px] text-[var(--portal-muted)] leading-relaxed">
              When creating any billboard, radio, or digital campaign, allocate a booster commission pool.
            </p>
          </div>

          <div className="p-4 bg-[var(--portal-soft)] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] font-black text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Promoters Share Everywhere
            </div>
            <p className="text-[11px] text-[var(--portal-muted)] leading-relaxed">
              Vetted promoters receive approved flyers, jingles, and trackable links to share with their audiences.
            </p>
          </div>

          <div className="p-4 bg-[var(--portal-soft)] rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] font-black text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Verified Results & Payouts
            </div>
            <p className="text-[11px] text-[var(--portal-muted)] leading-relaxed">
              Advers anti-fraud engines verify genuine clicks and actions before distributing commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

