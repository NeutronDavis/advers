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
  Layers,
  Building2,
} from "lucide-react";
import { formatNaira } from "@/lib/format";

export interface ExploreInventoryItem {
  id: string;
  inventoryCode: string;
  name: string;
  channel: string;
  city: string;
  state: string;
  locationDetails: string;
  screenSpecs: string | null;
  loopCapacity: string | null;
  availableSlots: number;
  ratePerUnit: number;
  unitType: string;
  vendorName: string;
}

export default function ExploreClient({
  inventory,
}: {
  inventory: ExploreInventoryItem[];
}) {
  const { openCreateModal } = useCampaign();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [inventoryChannel, setInventoryChannel] = useState("ALL");

  const channelCards = [
    {
      id: "dooh", bookChannel: "Digital billboards",
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
      id: "ooh", bookChannel: "Static billboards",
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
      id: "radio", bookChannel: "FM radio",
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
      id: "tv", bookChannel: "Television",
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
      id: "print", bookChannel: "Newspapers",
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
      id: "podcasts", bookChannel: "Podcast advertising",
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
      id: "adboosters", bookChannel: "AdBoosters",
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
      id: "influencers", bookChannel: "Influencer marketplace",
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

  const inventoryChannels = [
    "ALL",
    ...Array.from(new Set(inventory.map((item) => item.channel))),
  ];
  const filteredInventory = inventory.filter(
    (item) => inventoryChannel === "ALL" || item.channel === inventoryChannel
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Multi-Channel Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Explore Advertising Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Discover rates, audience reach, and guaranteed slots across Nigerian media.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="btn bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none font-bold rounded-xl text-xs px-5 shadow-md flex items-center gap-1.5 self-start sm:self-auto"
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
                ? "bg-[var(--portal-obsidian)] text-white shadow-xs"
                : "bg-[var(--portal-surface)] text-[var(--portal-muted)] border-[var(--portal-line)] hover:bg-base-200"
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
            className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] hover:border-[var(--portal-gold)] rounded-3xl p-6 shadow-xs transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-3)] flex items-center justify-center text-xl font-bold text-[var(--portal-obsidian)]">
                    {channel.icon}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[var(--portal-ink)]">
                      {channel.title}
                    </h2>
                    <div className="text-[11px] text-[var(--portal-muted)] font-medium">
                      {channel.featuredCorridor}
                    </div>
                  </div>
                </div>

                <span className="badge badge-sm badge-neutral badge-soft text-[10px] font-bold">
                  {channel.category}
                </span>
              </div>

              <p className="text-xs text-[var(--portal-body)] leading-relaxed">
                {channel.description}
              </p>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[var(--portal-soft)] rounded-2xl text-[11px]">
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Starts from
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {channel.minBudget}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Duration
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {channel.typicalDuration}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Estimated Reach
                  </div>
                  <div className="text-xs font-bold text-[var(--portal-success)] mt-0.5 truncate">
                    {channel.reach}
                  </div>
                </div>
              </div>

              {/* Available Cities */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-[var(--portal-muted)] mr-1">
                  Key Hubs:
                </span>
                {channel.locations.map((loc) => (
                  <span
                    key={loc}
                    className="badge badge-xs bg-[var(--portal-surface)] border-[var(--portal-line)] text-[10px] text-[var(--portal-body)] font-medium"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--portal-line-soft)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--portal-muted)]">
                Verified Advers Media Partner Slot
              </span>
              <button
                type="button"
                onClick={() => openCreateModal(channel.bookChannel)}
                className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold px-4"
              >
                Book channel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Verified media inventory */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
              Live inventory
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--portal-ink)]">
              Verified media slots
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Rates and availability are supplied by participating media partners.
              Availability is confirmed during review.
            </p>
          </div>
          <div className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
            {filteredInventory.length} slots
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {inventoryChannels.map((channel) => (
            <button
              key={channel}
              onClick={() => setInventoryChannel(channel)}
              className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
                inventoryChannel === channel
                  ? "bg-[var(--portal-obsidian)] text-white border-[var(--portal-obsidian)]"
                  : "bg-[var(--portal-surface)] text-[var(--portal-muted)] border-[var(--portal-line)]"
              }`}
            >
              {channel === "ALL" ? "All inventory" : channel}
            </button>
          ))}
        </div>

        {filteredInventory.length === 0 ? (
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-10 text-center text-xs text-[var(--portal-muted)]">
            No media inventory is available for this channel right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] hover:border-[var(--portal-gold)] rounded-3xl p-5 shadow-xs space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--portal-gold-soft-3)] text-[var(--portal-gold-ink)] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[var(--portal-ink)]">
                        {item.name}
                      </h3>
                      <div className="text-[10px] text-[var(--portal-muted)] font-mono">
                        {item.inventoryCode} · {item.channel}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`badge badge-xs font-bold ${
                      item.availableSlots > 0
                        ? "badge-success badge-soft"
                        : "badge-warning badge-soft"
                    }`}
                  >
                    {item.availableSlots > 0
                      ? `${item.availableSlots} open`
                      : "Waitlist"}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-[var(--portal-body)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--portal-muted)] shrink-0 mt-0.5" />
                  <span>
                    {item.locationDetails} · {item.city}, {item.state}
                  </span>
                </div>

                {item.screenSpecs && (
                  <div className="text-[10px] text-[var(--portal-muted)]">
                    {item.screenSpecs}
                    {item.loopCapacity ? ` · ${item.loopCapacity}` : ""}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--portal-soft)] rounded-2xl text-[11px]">
                  <div>
                    <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                      Rate
                    </div>
                    <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                      {formatNaira(item.ratePerUnit)}
                    </div>
                    <div className="text-[9px] text-[var(--portal-muted)]">
                      {item.unitType.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                      Media partner
                    </div>
                    <div className="text-[11px] font-bold text-[var(--portal-ink)] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[var(--portal-muted)]" />
                      <span className="truncate">{item.vendorName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--portal-line-soft)]">
                  <span className="text-[10px] text-[var(--portal-muted)]">
                    Availability confirmed on review
                  </span>
                  <button
                    type="button"
                    onClick={() => openCreateModal(item.channel, item.id)}
                    className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl text-xs font-bold px-4"
                  >
                    Book this slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

