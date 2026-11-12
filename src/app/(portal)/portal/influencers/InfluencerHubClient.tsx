"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Search,
  Star,
  Users,
} from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { InfluencerProfileView } from "@/server/data/influencers";

interface InfluencerRequestView {
  id: string;
  influencerName: string;
  influencerHandle: string;
  campaignName: string | null;
  campaignNumber: string | null;
  brief: string;
  budget: number;
  status: string;
  createdAt: string;
}

export default function InfluencerHubClient({
  profiles,
  requests,
}: {
  profiles: InfluencerProfileView[];
  requests: InfluencerRequestView[];
}) {
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const niches = Array.from(new Set(profiles.map((profile) => profile.niche))).sort();

  const filtered = profiles.filter((profile) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      profile.displayName.toLowerCase().includes(query) ||
      profile.handle.toLowerCase().includes(query) ||
      profile.platform.toLowerCase().includes(query);
    const matchesNiche = niche === "ALL" || profile.niche === niche;
    const matchesVerified = !verifiedOnly || profile.verified;
    return matchesSearch && matchesNiche && matchesVerified;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Creator marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Influencer Hub
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Discover vetted creators, review audience and rates, and request
            collaborations for your campaigns.
          </p>
        </div>
        <span className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold self-start sm:self-auto">
          {profiles.length} creators
        </span>
      </div>

      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search creators, handles or platforms..."
              className="input input-bordered w-full pl-10 bg-[var(--portal-soft)] border-[var(--portal-line)] text-xs h-10 rounded-xl"
            />
            <Search className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3" />
          </div>
          <select
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            className="select select-bordered w-full bg-[var(--portal-soft)] border-[var(--portal-line)] text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All niches</option>
            {niches.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-[var(--portal-body)]">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
            className="checkbox checkbox-primary checkbox-xs"
          />
          Verified creators only
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-[var(--portal-muted)] mx-auto" />
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            No creators match your filters
          </h2>
          <p className="text-xs text-[var(--portal-muted)]">
            Try a different niche or clear the verified filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((profile) => (
            <Link
              key={profile.id}
              href={`/portal/influencers/${profile.id}`}
              className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] hover:border-[var(--portal-gold)] rounded-3xl p-5 shadow-xs transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center font-black text-base shrink-0">
                    {profile.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-black text-[var(--portal-ink)] group-hover:text-[var(--portal-gold-ink)] transition-colors">
                        {profile.displayName}
                      </h2>
                      {profile.verified && (
                        <BadgeCheck className="w-4 h-4 text-[var(--portal-success)]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--portal-muted)]">
                      {profile.handle} · {profile.platform}
                    </div>
                  </div>
                </div>
                <span className="badge badge-xs bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                  {profile.niche}
                </span>
              </div>

              <p className="text-xs text-[var(--portal-body)] leading-relaxed line-clamp-2">
                {profile.bio || "Creator profile available on request."}
              </p>

              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--portal-soft)] rounded-2xl text-[11px]">
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Followers
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {profile.followers.toLocaleString("en-NG")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Engagement
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {profile.engagementRate
                      ? `${profile.engagementRate}%`
                      : "On request"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-bold uppercase">
                    Rate card
                  </div>
                  <div className="text-xs font-black text-[var(--portal-ink)] mt-0.5">
                    {profile.rateCard ? formatNaira(profile.rateCard) : "Quote"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--portal-line-soft)]">
                <span className="text-[10px] text-[var(--portal-muted)] flex items-center gap-1">
                  <Star className="w-3 h-3 text-[var(--portal-gold-ink)]" />
                  Managed by Advers Talent Desk
                </span>
                <span className="text-xs font-bold text-[var(--portal-gold-ink)] flex items-center gap-1">
                  View profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Collaboration requests
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Requests you have sent to creators.
            </p>
          </div>
          <div className="divide-y divide-[var(--portal-line-soft)]">
            {requests.map((request) => (
              <div
                key={request.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {request.influencerName}{" "}
                    <span className="text-[var(--portal-muted)] font-normal">
                      {request.influencerHandle}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)]">
                    {request.campaignName
                      ? `${request.campaignNumber} · ${request.campaignName}`
                      : "Standalone collaboration request"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold">
                    {formatNaira(request.budget)}
                  </span>
                  <span
                    className={`badge badge-xs font-bold ${
                      request.status === "ACCEPTED"
                        ? "badge-success badge-soft"
                        : request.status === "REJECTED"
                          ? "badge-error badge-soft"
                          : "badge-warning badge-soft"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
