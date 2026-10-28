"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCampaign } from "@/context/CampaignContext";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Radio,
  Tv,
  Newspaper,
  Mic,
  Share2,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

export default function ClientDashboardPage() {
  const { campaigns, openCreateModal, showToast } = useCampaign();
  const [greeting, setGreeting] = useState("Good afternoon");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const totalCampaignsCount = campaigns.length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const inReviewCount = campaigns.filter((c) => c.status === "IN_REVIEW").length;
  const totalSpend = campaigns.reduce((acc, curr) => acc + curr.budget, 0);

  const channelsList = [
    {
      name: "Digital billboards",
      icon: "▣",
      desc: "Get noticed on digital screens in busy locations.",
      tag: "DOOH",
    },
    {
      name: "Static billboards",
      icon: "▧",
      desc: "Build awareness with high-impact outdoor displays.",
      tag: "OOH",
    },
    {
      name: "FM radio",
      icon: "♫",
      desc: "Reach listeners across participating radio stations.",
      tag: "Audio",
    },
    {
      name: "Television",
      icon: "▣",
      desc: "Bring your brand story to the TV audience.",
      tag: "Broadcast",
    },
    {
      name: "Newspapers",
      icon: "▤",
      desc: "Promote notices, offers and brand announcements.",
      tag: "Print",
    },
    {
      name: "Podcast advertising",
      icon: "🎙",
      desc: "Connect with listeners through trusted creators.",
      tag: "Audio",
    },
    {
      name: "AdBoosters",
      icon: "✦",
      desc: "Extend your reach with promotional partners.",
      tag: "Crowd",
    },
    {
      name: "Influencer marketplace",
      icon: "◎",
      desc: "Discover creators for your next brand campaign.",
      tag: "Creators",
    },
  ];

  const filteredCampaigns = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.channel.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Your marketing command centre
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15171b] mt-1">
            {greeting} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Let’s get your brand seen by the right people.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="btn bg-[#101113] hover:bg-black text-white border-none rounded-xl px-5 py-2.5 h-auto text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="text-base leading-none">＋</span>
          <span>Create campaign</span>
        </button>
      </section>

      {/* 2. STATS ROW (4 METRICS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Campaigns */}
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Total campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff4d9] text-[#986d16] flex items-center justify-center font-bold text-sm">
              ▣
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#15171b] tracking-tight mt-2.5">
            {totalCampaignsCount}
          </div>
          <div className="text-[11px] text-[#16845b] font-bold mt-1 flex items-center gap-1">
            <span>↗ 3 this month</span>
            <span className="text-[#7c818b] font-medium">· Active data</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Active campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-[#e4f6ec] text-[#19764b] flex items-center justify-center font-bold text-sm">
              ◉
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#15171b] tracking-tight mt-2.5">
            {activeCampaignsCount}
          </div>
          <div className="text-[11px] text-[#16845b] font-bold mt-1 flex items-center gap-1">
            <span>● Running smoothly</span>
          </div>
        </div>

        {/* Campaign Spend */}
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Campaign spend</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff4d9] text-[#986d16] flex items-center justify-center font-bold text-sm">
              ₦
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#15171b] tracking-tight mt-2.5">
            ₦{(totalSpend / 1000).toLocaleString("en-NG")}k
          </div>
          <div className="text-[11px] text-[#7c818b] font-medium mt-1">
            Total deployed media budget
          </div>
        </div>

        {/* Pending Review */}
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7c818b] text-[11px] font-bold">
            <span>Pending review</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff1d2] text-[#8b6416] flex items-center justify-center font-bold text-sm">
              ◷
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#15171b] tracking-tight mt-2.5">
            {inReviewCount}
          </div>
          <div className="text-[11px] text-[#8b6416] font-bold mt-1">
            Awaiting media partner approval
          </div>
        </div>
      </section>

      {/* 3. HERO OPPORTUNITY BANNER (OBSIDIAN & GOLD) */}
      <section className="bg-[#101113] rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/5">
        {/* Subtle decorative background rings */}
        <div className="absolute right-[-40px] top-[-60px] w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute right-[-80px] top-[-100px] w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3 max-w-xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#f7d98a]">
              Your next big opportunity
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Big ideas deserve <br className="hidden sm:inline" />
              to be seen.
            </h2>
            <p className="text-xs sm:text-sm text-[#bfc0c5] leading-relaxed">
              Radio, TV, billboards, newspapers, podcasts and more. Find your next advertising opportunity in one place.
            </p>
            <div className="pt-2">
              <Link
                href="/portal/explore"
                className="btn bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] border-none font-black text-xs px-5 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2"
              >
                <span>Explore advertising opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Orbital Logo Mark Visual */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-44 h-44 rounded-full border border-[#f1c75b]/30 flex items-center justify-center shadow-[0_0_50px_rgba(232,182,75,0.18)] animate-pulse">
              <div className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-[#e8b64b] shadow-[0_0_12px_#e8b64b]" />
              <div className="absolute bottom-4 left-3 w-1.5 h-1.5 rounded-full bg-[#f7d98a]" />
              <img
                src="/logo.png"
                alt="Advers Logo"
                className="w-24 h-24 object-contain filter drop-shadow-[0_0_18px_rgba(232,182,75,0.45)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE ADVERTISING CHANNELS (8 TILES) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#15171b]">
              Explore advertising channels
            </h3>
            <p className="text-[11px] text-[#7c818b]">
              Select a channel to launch a tailored campaign
            </p>
          </div>
          <Link
            href="/portal/explore"
            className="text-xs font-bold text-[#80601f] hover:underline flex items-center gap-1"
          >
            <span>View all channels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {channelsList.map((ch) => (
            <button
              key={ch.name}
              type="button"
              onClick={() => openCreateModal(ch.name)}
              className="card bg-white border border-[#e8e9ed] hover:border-[#d6b65f] hover:-translate-y-1 transition-all rounded-2xl p-4 text-left shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f8f1df] group-hover:bg-[#f4dfb1] text-lg flex items-center justify-center mb-3 transition-colors">
                {ch.icon}
              </div>
              <div className="text-xs font-black text-[#15171b] leading-tight">
                {ch.name}
              </div>
              <p className="text-[10px] text-[#7c818b] leading-relaxed mt-1 line-clamp-2">
                {ch.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 5. LOWER SPLIT PANELS (RECENT CAMPAIGNS + ADBOOSTERS) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Campaigns (2 cols on desktop) */}
        <div className="lg:col-span-2 card bg-white border border-[#e8e9ed] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#f0f0f2]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#15171b]">
                Recent campaigns
              </h3>
              <p className="text-[11px] text-[#7c818b]">
                Keep track of your advertising activity across Nigeria
              </p>
            </div>
            <Link
              href="/portal/campaigns"
              className="text-xs font-bold text-[#80601f] hover:underline self-start sm:self-auto"
            >
              See all campaigns →
            </Link>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#858993] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter recent campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm w-full bg-[#f8f9fa] border-[#e8e9ed] rounded-xl pl-8 text-xs focus:outline-none"
            />
          </div>

          {/* Campaigns List */}
          <div className="divide-y divide-[#f0f0f2]">
            {filteredCampaigns.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7c818b]">
                No matching campaigns found.
              </div>
            ) : (
              filteredCampaigns.slice(0, 5).map((camp) => (
                <div
                  key={camp.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafb] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f2ea] flex items-center justify-center text-base shrink-0">
                      {camp.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#15171b] truncate">
                        {camp.name}
                      </div>
                      <div className="text-[10px] text-[#7c818b] truncate mt-0.5">
                        {camp.channel} · {camp.location} · ₦{camp.budget.toLocaleString("en-NG")}
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
              ))
            )}
          </div>

          <div className="p-3 bg-[#f7f8fa] rounded-xl text-[10px] text-[#686e78] leading-relaxed">
            Note: Demo content shown. Real campaign availability, prices, payments and broadcast delivery require connected media partners and inventory clearance.
          </div>
        </div>

        {/* Right: Grow with AdBoosters Panel */}
        <div className="card bg-white border border-[#e8e9ed] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#15171b]">
                Grow with AdBoosters
              </h3>
              <p className="text-[11px] text-[#7c818b]">
                Let more people discover your campaigns
              </p>
            </div>

            {/* Gold Promotion Box */}
            <div className="bg-[#fbf4df] border border-[#f1e2b5] rounded-2xl p-4 text-[#70634a] space-y-2.5">
              <div className="text-xs font-black text-[#15171b] flex items-center gap-1.5">
                <span>Turn sharing into opportunity</span>
                <span className="text-[#8b6416]">✦</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Explore the AdBoosters programme and learn how eligible promotional partners share campaigns and earn commissions under published terms.
              </p>
              <Link
                href="/portal/adboosters"
                className="btn btn-sm bg-[#191a1c] hover:bg-black text-white border-none rounded-xl text-[10px] font-bold w-full"
              >
                Explore AdBoosters →
              </Link>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#e8b64b] ring-4 ring-[#fbf3dd] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#15171b]">
                    One platform. More possibilities.
                  </div>
                  <div className="text-[10px] text-[#7c818b]">
                    Discover multiple channels in one place.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#e8b64b] ring-4 ring-[#fbf3dd] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#15171b]">
                    Built for Nigerian businesses
                  </div>
                  <div className="text-[10px] text-[#7c818b]">
                    Clear steps, naira-friendly concepts and mobile-first design.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0f0f2] flex items-center justify-between text-[11px] text-[#7c818b]">
            <span>Need campaign advice?</span>
            <Link href="/portal/support" className="font-bold text-[#80601f] hover:underline">
              Contact media desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
