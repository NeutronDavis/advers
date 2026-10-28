"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  Compass,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Tv,
  Radio,
  Newspaper,
  Mic,
  Share2,
  Users,
  Eye,
} from "lucide-react";

export default function ExploreAdvertisingPage() {
  const { openCreateModal } = useCampaign();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const channelCards = [
    {
      id: "dooh",
      title: "Digital Billboards (DOOH)",
      category: "OUTDOOR",
      icon: "▣",
      locations: ["Lagos (Lekki, Ikeja)", "Abuja (CBD)", "Port Harcourt (GRA)"],
      minBudget: "₦150,000",
      typicalDuration: "1–4 weeks",
      reach: "350k+ daily impressions per screen",
      description:
        "High-brightness commercial LED screens placed along premier transit hubs. 15-second high-resolution video or animated loops.",
      featuredCorridor: "Lekki Toll Plaza & Victoria Island Ahmadu Bello Way",
    },
    {
      id: "ooh",
      title: "Static Billboards (OOH)",
      category: "OUTDOOR",
      icon: "▧",
      locations: ["Third Mainland Bridge", "Abuja Express", "Peter Odili Road"],
      minBudget: "₦250,000",
      typicalDuration: "1 month minimum",
      reach: "500k+ weekly vehicular views",
      description:
        "Large-format cantilever unipoles, overhead bridge structures, and landmark hoardings with 24/7 brand presence.",
      featuredCorridor: "Third Mainland Bridge Toll Outbound",
    },
    {
      id: "radio",
      title: "FM Radio Advertising",
      category: "BROADCAST",
      icon: "♫",
      locations: ["Lagos", "Port Harcourt", "Abuja", "Kano", "Ibadan"],
      minBudget: "₦50,000",
      typicalDuration: "1–2 weeks",
      reach: "2.5M+ daily listeners",
      description:
        "High-impact 30-second commercial jingles, live On-Air-Personality (OAP) endorsements, and peak morning drive-time sponsorships.",
      featuredCorridor: "Cool FM, Nigeria Info & Wazobia FM Networks",
    },
    {
      id: "tv",
      title: "Television Advertising",
      category: "BROADCAST",
      icon: "▣",
      locations: ["Nationwide Direct-to-Home & Terrestrial"],
      minBudget: "₦200,000",
      typicalDuration: "1 week flight",
      reach: "10M+ national viewers",
      description:
        "Promote your story across leading terrestrial channels and news broadcasts during prime evening belts and news hours.",
      featuredCorridor: "Channels TV, Silverbird, TVC News & Arise TV",
    },
    {
      id: "print",
      title: "Newspaper & Print Advertising",
      category: "PRINT",
      icon: "▤",
      locations: ["Nationwide Daily Circulation"],
      minBudget: "₦85,000",
      typicalDuration: "Single day or Multi-issue",
      reach: "National business leaders & corporate decision makers",
      description:
        "Official public notices, front-page bottom strips, half-page corporate features, and full-color glossy brand showcases.",
      featuredCorridor: "The Punch, BusinessDay, ThisDay & The Guardian",
    },
    {
      id: "podcasts",
      title: "Podcast Sponsorships",
      category: "DIGITAL",
      icon: "🎙",
      locations: ["Global Online & Nigerian Diaspora"],
      minBudget: "₦35,000",
      typicalDuration: "Per episode sponsor slot",
      reach: "50k–200k high-intent listeners",
      description:
        "Engage dedicated, trust-rich audiences with host-read personal recommendations and custom episode sponsor credits.",
      featuredCorridor: "Top Business, Pop Culture & Tech Creator Shows",
    },
    {
      id: "adboosters",
      title: "AdBoosters Referral Network",
      category: "CROWD",
      icon: "✦",
      locations: ["All States & Online Communities"],
      minBudget: "₦25,000",
      typicalDuration: "Performance based",
      reach: "Viral crowd distribution",
      description:
        "Reward verified community promoters and affiliates who share your campaign materials across WhatsApp, X, and Instagram.",
      featuredCorridor: "Active nationwide crowd promoter pool",
    },
    {
      id: "influencers",
      title: "Influencer Marketplace",
      category: "DIGITAL",
      icon: "◎",
      locations: ["TikTok, Instagram, YouTube, X"],
      minBudget: "₦75,000",
      typicalDuration: "Per campaign package",
      reach: "100k–1M+ social impressions",
      description:
        "Hand-picked and verified content creators matching your exact customer persona for unboxings, reviews, and hype campaigns.",
      featuredCorridor: "Verified Lifestyle, Tech, Fashion & Food Creators",
    },
  ];

  const filteredChannels = channelCards.filter(
    (c) => selectedCategory === "ALL" || c.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Multi-Channel Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            Explore Advertising Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Discover rates, audience reach, and guaranteed slots across Nigerian media.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="btn bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] border-none font-bold rounded-xl text-xs px-5 shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Quick campaign launcher</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Media (8)" },
          { id: "OUTDOOR", label: "Billboards & OOH" },
          { id: "BROADCAST", label: "Radio & TV" },
          { id: "PRINT", label: "Newspapers" },
          { id: "DIGITAL", label: "Podcasts & Influencers" },
          { id: "CROWD", label: "AdBoosters" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-[#101113] text-white shadow-xs"
                : "bg-white text-[#7c818b] border-[#e8e9ed] hover:bg-base-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            className="card bg-white border border-[#e8e9ed] hover:border-[#d6b65f] rounded-3xl p-6 shadow-xs transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f8f1df] flex items-center justify-center text-xl font-bold text-[#101113]">
                    {channel.icon}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#15171b]">
                      {channel.title}
                    </h2>
                    <div className="text-[11px] text-[#7c818b] font-medium">
                      {channel.featuredCorridor}
                    </div>
                  </div>
                </div>

                <span className="badge badge-sm badge-neutral badge-soft text-[10px] font-bold">
                  {channel.category}
                </span>
              </div>

              <p className="text-xs text-[#4d5159] leading-relaxed">
                {channel.description}
              </p>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#f8f9fa] rounded-2xl text-[11px]">
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Starts from
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5">
                    {channel.minBudget}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Duration
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5">
                    {channel.typicalDuration}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Estimated Reach
                  </div>
                  <div className="text-xs font-bold text-[#16845b] mt-0.5 truncate">
                    {channel.reach}
                  </div>
                </div>
              </div>

              {/* Available Cities */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#7c818b] mr-1">
                  Key Hubs:
                </span>
                {channel.locations.map((loc) => (
                  <span
                    key={loc}
                    className="badge badge-xs bg-white border-[#e8e9ed] text-[10px] text-[#4d5159] font-medium"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0f0f2] flex items-center justify-between">
              <span className="text-[11px] text-[#7c818b]">
                Verified Advers Media Partner Slot
              </span>
              <button
                type="button"
                onClick={() => openCreateModal(channel.title)}
                className="btn btn-sm bg-[#101113] hover:bg-black text-white border-none rounded-xl text-xs font-bold px-4"
              >
                Book channel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

