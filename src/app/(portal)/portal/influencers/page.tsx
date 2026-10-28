"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  Users,
  Search,
  CheckCircle2,
  Star,
  ExternalLink,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function InfluencerHubPage() {
  const { openCreateModal, showToast } = useCampaign();
  const [selectedNiche, setSelectedNiche] = useState("ALL");

  const influencers = [
    {
      id: "inf-1",
      name: "Tunde Ednut Network",
      handle: "@mufasatundeednut",
      niche: "ENTERTAINMENT",
      platform: "Instagram (5.2M)",
      rating: 4.9,
      completedAds: 84,
      rate: "₦350,000",
      avatarBg: "bg-amber-100 text-amber-800",
      description:
        "High-engagement viral meme reposts, brand video hype, and massive reach across Nigerian youth and pop-culture demographics.",
    },
    {
      id: "inf-2",
      name: "Fisayo Fosudo",
      handle: "@fisayofosudo",
      niche: "TECH",
      platform: "YouTube / X (750k)",
      rating: 5.0,
      completedAds: 42,
      rate: "₦400,000",
      avatarBg: "bg-blue-100 text-blue-800",
      description:
        "Premium tech unboxings, fintech walkthroughs, and credible brand reviews trusted by professionals and tech enthusiasts.",
    },
    {
      id: "inf-3",
      name: "KieKie (Bukunmi Adeaga)",
      handle: "@kie_kie__",
      niche: "COMEDY",
      platform: "TikTok / Instagram (2.8M)",
      rating: 4.95,
      completedAds: 65,
      rate: "₦500,000",
      avatarBg: "bg-pink-100 text-pink-800",
      description:
        "Relatable comedic skits seamlessly integrating product benefits with high retention and viewer comment interactions.",
    },
    {
      id: "inf-4",
      name: "Hilda Baci Cooking Hub",
      handle: "@hildabacicooking",
      niche: "FOOD",
      platform: "Instagram (1.9M)",
      rating: 4.85,
      completedAds: 29,
      rate: "₦450,000",
      avatarBg: "bg-emerald-100 text-emerald-800",
      description:
        "World-record culinary showcase, recipe integrations, and FMCG food product showcases with premium aesthetics.",
    },
  ];

  const filtered = influencers.filter(
    (inf) => selectedNiche === "ALL" || inf.niche === selectedNiche
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Creator Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            Influencer Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Partner with vetted Nigerian digital creators for authentic product endorsements.
          </p>
        </div>

        <button
          onClick={() => openCreateModal("Influencer marketplace")}
          className="btn bg-[#101113] hover:bg-black text-white border-none rounded-xl px-5 text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Book creator campaign</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Creators" },
          { id: "TECH", label: "Tech & Gadgets" },
          { id: "COMEDY", label: "Comedy & Skits" },
          { id: "ENTERTAINMENT", label: "Entertainment" },
          { id: "FOOD", label: "Food & Lifestyle" },
        ].map((niche) => (
          <button
            key={niche.id}
            onClick={() => setSelectedNiche(niche.id)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
              selectedNiche === niche.id
                ? "bg-[#101113] text-white shadow-xs"
                : "bg-white text-[#7c818b] border-[#e8e9ed] hover:bg-base-200"
            }`}
          >
            {niche.label}
          </button>
        ))}
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((creator) => (
          <div
            key={creator.id}
            className="card bg-white border border-[#e8e9ed] hover:border-[#d6b65f] rounded-3xl p-6 shadow-xs transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${creator.avatarBg} flex items-center justify-center font-black text-base shadow-xs`}
                  >
                    {creator.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-black text-[#15171b]">
                        {creator.name}
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                    </div>
                    <div className="text-[11px] text-[#7c818b] font-medium">
                      {creator.handle} · {creator.platform}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#fff4d9] px-2.5 py-1 rounded-xl text-[#986d16] text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#e8b64b]" />
                  <span>{creator.rating}</span>
                </div>
              </div>

              <p className="text-xs text-[#4d5159] leading-relaxed">
                {creator.description}
              </p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-[#f8f9fa] rounded-2xl text-[11px]">
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Rate Card
                  </div>
                  <div className="text-xs font-black text-[#15171b] mt-0.5">
                    {creator.rate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7c818b] font-bold uppercase">
                    Verified Deliveries
                  </div>
                  <div className="text-xs font-black text-[#16845b] mt-0.5">
                    {creator.completedAds} live campaigns
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0f0f2] flex items-center justify-between">
              <span className="text-[11px] text-[#7c818b]">
                Managed by Advers Talent Desk
              </span>
              <button
                type="button"
                onClick={() => openCreateModal(`Influencer: ${creator.name}`)}
                className="btn btn-sm bg-[#101113] hover:bg-black text-white border-none rounded-xl text-xs font-bold px-4"
              >
                Hire creator
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

