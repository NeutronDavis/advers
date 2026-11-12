"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { ChannelCatalogItem } from "@/lib/channels";
import type { MediaPartnerView } from "@/server/data/channels";

export default function ChannelPartnersClient({
  channel,
  partners,
}: {
  channel: ChannelCatalogItem;
  partners: MediaPartnerView[];
}) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("ALL");

  const cities = Array.from(new Set(partners.map((partner) => partner.city))).sort();

  const filtered = partners.filter((partner) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      partner.name.toLowerCase().includes(query) ||
      partner.vendorName.toLowerCase().includes(query) ||
      partner.locationDetails.toLowerCase().includes(query);
    const matchesCity = city === "ALL" || partner.city === city;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center text-xl shrink-0">
            {channel.icon}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
              Advertising channel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
              {channel.label}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5 max-w-2xl">
              {channel.description} Select a partner to see availability, time
              slots and full details.
            </p>
          </div>
        </div>
        <span className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold self-start sm:self-auto">
          {partners.length} partner{partners.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${channel.shortLabel.toLowerCase()} partners, stations or locations...`}
              className="input input-bordered w-full pl-10 bg-[var(--portal-soft)] border-[var(--portal-line)] text-xs h-10 rounded-xl"
            />
            <Search className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3" />
          </div>
          <div className="relative">
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="select select-bordered w-full bg-[var(--portal-soft)] border-[var(--portal-line)] text-xs h-10 min-h-0 rounded-xl pl-9"
            >
              <option value="ALL">All locations</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-[var(--portal-muted)] absolute left-3 top-3.5" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-12 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-[var(--portal-muted)] mx-auto" />
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            No verified partners available
          </h2>
          <p className="text-xs text-[var(--portal-muted)] max-w-sm mx-auto">
            We are onboarding more {channel.shortLabel.toLowerCase()} partners.
            Contact the media desk and we will source options for your campaign.
          </p>
          <Link
            href="/portal/support"
            className="btn btn-sm bg-[var(--portal-obsidian)] text-white border-none rounded-xl text-xs font-bold"
          >
            Request assistance
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((partner) => (
            <Link
              key={partner.id}
              href={`/portal/channels/${channel.slug}/${partner.id}`}
              className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] hover:border-[var(--portal-gold)] rounded-3xl p-5 shadow-xs transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--portal-gold-soft-3)] text-[var(--portal-gold-ink)] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[var(--portal-ink)] group-hover:text-[var(--portal-gold-ink)] transition-colors">
                      {partner.name}
                    </h2>
                    <div className="text-[10px] text-[var(--portal-muted)] font-mono">
                      {partner.inventoryCode} · {partner.vendorName}
                    </div>
                  </div>
                </div>
                <span className="badge badge-xs badge-success badge-soft font-bold">
                  Verified
                </span>
              </div>

              <div className="flex items-start gap-1.5 text-[11px] text-[var(--portal-body)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--portal-muted)] shrink-0 mt-0.5" />
                <span>
                  {partner.locationDetails} · {partner.city}, {partner.state}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--portal-soft)] rounded-2xl text-[11px]">
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Starting rate
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {formatNaira(partner.ratePerUnit)}
                  </div>
                  <div className="text-[9px] text-[var(--portal-muted)]">
                    {partner.unitType.replace(/_/g, " ")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Next availability
                  </div>
                  <div className="text-[11px] font-bold text-[var(--portal-ink)] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--portal-muted)]" />
                    <span className="truncate">
                      {partner.nextSlotLabel || "Contact media desk"}
                    </span>
                  </div>
                  <div className="text-[9px] text-[var(--portal-muted)]">
                    {partner.slotsCount} time slot
                    {partner.slotsCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {partner.screenSpecs && (
                <div className="text-[10px] text-[var(--portal-muted)] line-clamp-2">
                  {partner.screenSpecs}
                  {partner.loopCapacity ? ` · ${partner.loopCapacity}` : ""}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[var(--portal-line-soft)]">
                <span className="text-[10px] text-[var(--portal-muted)]">
                  Availability confirmed on review
                </span>
                <span className="text-xs font-bold text-[var(--portal-gold-ink)] flex items-center gap-1">
                  View availability
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
