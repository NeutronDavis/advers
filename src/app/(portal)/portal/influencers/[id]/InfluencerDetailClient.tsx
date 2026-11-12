"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Send,
  Star,
  Users,
} from "lucide-react";
import { formatNaira } from "@/lib/format";
import { requestInfluencerCollaborationAction } from "@/server/actions/influencers";
import type { InfluencerProfileView } from "@/server/data/influencers";

export default function InfluencerDetailClient({
  profile,
  campaigns,
}: {
  profile: InfluencerProfileView;
  campaigns: { id: string; name: string; campaignNumber: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState(profile.rateCard ? String(profile.rateCard) : "");
  const [campaignId, setCampaignId] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await requestInfluencerCollaborationAction({
        influencerId: profile.id,
        brief,
        budget: Number(budget || 0),
        campaignId: campaignId || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setBrief("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/portal/influencers"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Influencer Hub
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center font-black text-xl shrink-0">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-[var(--portal-ink)] tracking-tight">
                    {profile.displayName}
                  </h1>
                  {profile.verified && (
                    <BadgeCheck className="w-5 h-5 text-[var(--portal-success)]" />
                  )}
                </div>
                <div className="text-xs text-[var(--portal-muted)]">
                  {profile.handle} · {profile.platform}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] font-bold">
                    {profile.niche}
                  </span>
                  <span className="badge badge-sm badge-success badge-soft font-bold">
                    {profile.followers.toLocaleString("en-NG")} followers
                  </span>
                  {profile.engagementRate && (
                    <span className="badge badge-sm badge-info badge-soft font-bold">
                      {profile.engagementRate}% engagement
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--portal-body)] leading-relaxed">
              {profile.bio || "Creator profile available on request."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Rate card
                </div>
                <div className="text-sm font-black text-[var(--portal-ink)] mt-1">
                  {profile.rateCard ? formatNaira(profile.rateCard) : "Quote on request"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Audience age
                </div>
                <div className="text-sm font-black text-[var(--portal-ink)] mt-1">
                  {profile.audience?.ageRange || "On request"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Audience locations
                </div>
                <div className="text-sm font-black text-[var(--portal-ink)] mt-1">
                  {profile.audience?.locations?.join(", ") || "On request"}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--portal-gold-soft)] border border-[var(--portal-gold-border)] text-[11px] text-[var(--portal-body)] flex items-start gap-2">
              <Star className="w-4 h-4 text-[var(--portal-gold-ink)] shrink-0" />
              <span>
                Audience and performance information is provided by the creator
                and reviewed by Advers. It is not a guarantee of reach or sales.
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={submit}
            className="card bg-[var(--portal-obsidian)] text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 sticky top-24"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-gold)]">
                Request collaboration
              </div>
              <h2 className="text-lg font-black mt-1">Work with {profile.displayName}</h2>
              <p className="text-[11px] text-[var(--portal-obsidian-muted-2)] mt-1">
                Send a brief and budget. Advers will coordinate the request with
                the creator.
              </p>
            </div>

            {error && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success text-xs rounded-xl py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Request sent. Advers will follow up.</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="influencer-brief" className="text-[11px] font-bold text-[var(--portal-gold)]">
                Brief *
              </label>
              <textarea
                id="influencer-brief"
                rows={4}
                required
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="Campaign goal, deliverables, timeline and key messages."
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-[var(--portal-obsidian-2)] border-[var(--portal-obsidian-line)] text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="influencer-budget" className="text-[11px] font-bold text-[var(--portal-gold)]">
                Budget (₦) *
              </label>
              <input
                id="influencer-budget"
                type="number"
                min="1"
                required
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="input input-bordered w-full text-xs rounded-xl bg-[var(--portal-obsidian-2)] border-[var(--portal-obsidian-line)] text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="influencer-campaign" className="text-[11px] font-bold text-[var(--portal-gold)]">
                Link to campaign (optional)
              </label>
              <select
                id="influencer-campaign"
                value={campaignId}
                onChange={(event) => setCampaignId(event.target.value)}
                className="select select-bordered w-full text-xs rounded-xl bg-[var(--portal-obsidian-2)] border-[var(--portal-obsidian-line)] text-white"
              >
                <option value="">Standalone request</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.campaignNumber} · {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn w-full bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none font-black text-xs rounded-xl gap-2"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send request
            </button>
          </form>

          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 shadow-xs space-y-2">
            <h2 className="text-sm font-bold text-[var(--portal-ink)] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--portal-gold-ink)]" />
              Managed by Advers
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Advers Talent Desk coordinates rates, contracts and campaign
              delivery. You will not pay the creator directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
