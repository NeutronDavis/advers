"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  campaignStatusBadgeClass,
  normalizeCampaignStatus,
} from "@/lib/campaign-status";
import {
  createCampaignQuoteAction,
  rejectCampaignAction,
  requestCampaignRevisionAction,
  startCampaignReviewAction,
} from "@/server/actions/admin-campaigns";

export interface ModerationCampaign {
  id: string;
  campaignNumber: string;
  name: string;
  status: string;
  statusLabel: string;
  channel: string;
  clientName: string;
  businessProfileName: string | null;
  inventoryName: string | null;
  inventoryCity: string | null;
  location: string;
  budget: number;
  duration: string;
  objective: string;
  productService: string | null;
  targetAudience: string | null;
  creativeAssetUrl: string | null;
  creativeAssetType: string | null;
  notes: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  quote: {
    id: string;
    quoteNumber: string;
    amount: number;
    status: string;
    sentAt: string;
  } | null;
}

type TabKey = "PENDING" | "QUOTE" | "AWAITING" | "ALL";

type ActionResult = { success: true } | { success: false; error: string };

const EMPTY_QUOTE = {
  mediaCost: "",
  adversFee: "",
  productionCost: "",
  logisticsCost: "",
  smsCost: "",
  taxAmount: "",
  notes: "",
  expiresInDays: "7",
};

export default function ModerationClient({
  campaigns,
}: {
  campaigns: ModerationCampaign[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("PENDING");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState(EMPTY_QUOTE);

  const run = (action: () => Promise<ActionResult>, message: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(message);
      setQuoteFor(null);
      router.refresh();
    });
  };

  const openQuote = (campaign: ModerationCampaign) => {
    setQuoteFor(campaign.id);
    setError(null);
    setNotice(null);
    setQuoteForm({
      mediaCost: String(Math.round(campaign.budget * 0.8)),
      adversFee: String(Math.round(campaign.budget * 0.2)),
      productionCost: "0",
      logisticsCost: "0",
      smsCost: "0",
      taxAmount: "0",
      notes: "",
      expiresInDays: "7",
    });
  };

  const submitQuote = (campaign: ModerationCampaign) => {
    const payload = {
      campaignId: campaign.id,
      mediaCost: Number(quoteForm.mediaCost || 0),
      adversFee: Number(quoteForm.adversFee || 0),
      productionCost: Number(quoteForm.productionCost || 0),
      logisticsCost: Number(quoteForm.logisticsCost || 0),
      smsCost: Number(quoteForm.smsCost || 0),
      taxAmount: Number(quoteForm.taxAmount || 0),
      notes: quoteForm.notes,
      expiresInDays: Number(quoteForm.expiresInDays || 7),
    };
    run(
      () => createCampaignQuoteAction(payload),
      `Quote issued for ${campaign.name}.`
    );
  };

  const quoteTotal =
    Number(quoteForm.mediaCost || 0) +
    Number(quoteForm.adversFee || 0) +
    Number(quoteForm.productionCost || 0) +
    Number(quoteForm.logisticsCost || 0) +
    Number(quoteForm.smsCost || 0) +
    Number(quoteForm.taxAmount || 0);

  const tabs: { key: TabKey; label: string; statuses: string[] }[] = [
    {
      key: "PENDING",
      label: "Pending review",
      statuses: ["SUBMITTED", "UNDER_REVIEW", "PENDING_REVIEW", "REVISION_REQUESTED"],
    },
    {
      key: "QUOTE",
      label: "Quote required",
      statuses: ["QUOTE_REQUIRED"],
    },
    {
      key: "AWAITING",
      label: "Awaiting advertiser / payment",
      statuses: ["AWAITING_APPROVAL", "AWAITING_PAYMENT", "CONFIRMED", "IN_PROGRESS"],
    },
    { key: "ALL", label: "All campaigns", statuses: [] },
  ];

  const counts = Object.fromEntries(
    tabs.map((tab) => [
      tab.key,
      tab.key === "ALL"
        ? campaigns.length
        : campaigns.filter((campaign) =>
            tab.statuses.includes(campaign.status)
          ).length,
    ])
  ) as Record<TabKey, number>;

  const filtered =
    activeTab === "ALL"
      ? campaigns
      : campaigns.filter((campaign) =>
          tabs
            .find((tab) => tab.key === activeTab)
            ?.statuses.includes(campaign.status)
        );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Compliance &amp; Media Booking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Campaign Moderation Desk
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Review real campaign briefs, verify creative details, issue itemised
            quotes and dispatch confirmed bookings.
          </p>
        </div>
        <div className="badge badge-primary badge-lg font-bold self-start sm:self-auto">
          {counts.PENDING} pending review
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="alert alert-success text-xs rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "btn-primary shadow-xs"
                : "btn-ghost border border-base-300"
            }`}
          >
            {tab.label}
            <span
              className={`badge badge-xs ${
                activeTab === tab.key ? "bg-white text-primary" : "badge-ghost"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center text-xs text-base-content/60">
            No campaigns in this moderation stage.
          </div>
        ) : (
          filtered.map((campaign) => {
            const normalized = normalizeCampaignStatus(campaign.status);
            const canStartReview = normalized === "SUBMITTED";
            const canQuote = ["UNDER_REVIEW", "QUOTE_REQUIRED"].includes(
              normalized
            );
            const canDecide = ["SUBMITTED", "UNDER_REVIEW", "QUOTE_REQUIRED", "PENDING_REVIEW", "REVISION_REQUESTED"].includes(
              normalized
            );
            const isQuoteOpen = quoteFor === campaign.id;

            return (
              <div
                key={campaign.id}
                className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-base-200">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary">
                        {campaign.campaignNumber}
                      </span>
                      <span
                        className={`badge badge-sm font-bold ${campaignStatusBadgeClass(
                          campaign.status
                        )}`}
                      >
                        {campaign.statusLabel}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-base-content mt-1">
                      {campaign.name}
                    </h2>
                    <div className="text-xs text-base-content/60">
                      Advertiser: <span className="font-bold">{campaign.clientName}</span>
                      {campaign.businessProfileName
                        ? ` · ${campaign.businessProfileName}`
                        : ""}{" "}
                      · Submitted {formatDate(campaign.createdAt)}
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-sm font-black text-base-content font-mono">
                      {formatNaira(campaign.budget)}
                    </div>
                    <div className="text-[10px] text-base-content/60">
                      {campaign.duration} · {campaign.channel}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-base-200/50 rounded-2xl text-xs">
                  <div>
                    <div className="text-[10px] text-base-content/50 font-bold uppercase">
                      Channel &amp; location
                    </div>
                    <div className="font-bold text-base-content mt-0.5">
                      {campaign.channel}
                    </div>
                    <div className="text-[11px] text-base-content/60">
                      {campaign.location}
                    </div>
                    {campaign.inventoryName && (
                      <div className="text-[10px] text-primary mt-1">
                        Slot: {campaign.inventoryName}
                        {campaign.inventoryCity ? ` · ${campaign.inventoryCity}` : ""}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] text-base-content/50 font-bold uppercase">
                      Objective &amp; audience
                    </div>
                    <div className="font-bold text-base-content mt-0.5">
                      {campaign.objective}
                    </div>
                    <div className="text-[11px] text-base-content/60">
                      {campaign.targetAudience || campaign.productService || "No audience notes"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-base-content/50 font-bold uppercase">
                      Creative
                    </div>
                    <div className="font-bold text-base-content mt-0.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{campaign.creativeAssetType || "Not specified"}</span>
                    </div>
                    {campaign.creativeAssetUrl ? (
                      <a
                        href={campaign.creativeAssetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline mt-0.5 inline-block"
                      >
                        Inspect creative →
                      </a>
                    ) : (
                      <div className="text-[10px] text-base-content/50">
                        No creative link supplied
                      </div>
                    )}
                  </div>
                </div>

                {campaign.notes && (
                  <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20 text-[11px] text-base-content/80">
                    <span className="font-bold">Advertiser notes: </span>
                    {campaign.notes}
                  </div>
                )}

                {campaign.quote && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-base-200/50 text-xs">
                    <div>
                      <span className="font-mono font-bold text-primary">
                        {campaign.quote.quoteNumber}
                      </span>
                      <span className="text-base-content/60 ml-2">
                        Issued {formatDate(campaign.quote.sentAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base-content">
                        {formatNaira(campaign.quote.amount)}
                      </span>
                      <span className="badge badge-xs badge-info badge-soft font-bold">
                        {campaign.quote.status}
                      </span>
                    </div>
                  </div>
                )}

                {isQuoteOpen && (
                  <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-base-content flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Create itemised quote
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuoteFor(null)}
                        className="btn btn-xs btn-ghost rounded-lg"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: "mediaCost", label: "Media placement" },
                        { key: "adversFee", label: "Advers service fee" },
                        { key: "productionCost", label: "Production" },
                        { key: "logisticsCost", label: "Logistics" },
                        { key: "smsCost", label: "SMS delivery" },
                        { key: "taxAmount", label: "Taxes / charges" },
                      ].map((field) => (
                        <label key={field.key} className="space-y-1">
                          <span className="text-[10px] font-bold text-base-content/70">
                            {field.label}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={quoteForm[field.key as keyof typeof EMPTY_QUOTE]}
                            onChange={(event) =>
                              setQuoteForm((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full text-xs rounded-lg"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-base-content/70">
                          Expires in days
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={quoteForm.expiresInDays}
                          onChange={(event) =>
                            setQuoteForm((current) => ({
                              ...current,
                              expiresInDays: event.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full text-xs rounded-lg"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-base-content/70">
                          Quote notes
                        </span>
                        <input
                          type="text"
                          value={quoteForm.notes}
                          onChange={(event) =>
                            setQuoteForm((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          placeholder="Optional notes for the advertiser"
                          className="input input-bordered input-sm w-full text-xs rounded-lg"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                      <div className="text-xs font-bold text-base-content">
                        Total: <span className="font-mono">{formatNaira(quoteTotal)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => submitQuote(campaign)}
                        disabled={isPending || quoteTotal <= 0}
                        className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5"
                      >
                        {isPending ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Issue quote
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  {canStartReview && (
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () => startCampaignReviewAction(campaign.id),
                          `${campaign.name} moved into review.`
                        )
                      }
                      disabled={isPending}
                      className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      Start review
                    </button>
                  )}

                  {canQuote && !campaign.quote && (
                    <button
                      type="button"
                      onClick={() => openQuote(campaign)}
                      disabled={isPending}
                      className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      Approve &amp; create quote
                    </button>
                  )}

                  {canDecide && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const note = window.prompt(
                            "Describe the revision required:"
                          );
                          if (!note) return;
                          run(
                            () => requestCampaignRevisionAction(campaign.id, note),
                            `Revision requested for ${campaign.name}.`
                          );
                        }}
                        disabled={isPending}
                        className="btn btn-sm btn-ghost text-warning rounded-xl text-xs font-bold gap-1.5"
                      >
                        <ChevronDown className="w-4 h-4" />
                        Request revision
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const reason = window.prompt(
                            "Reason for rejecting this campaign:"
                          );
                          if (!reason) return;
                          run(
                            () => rejectCampaignAction(campaign.id, reason),
                            `${campaign.name} rejected.`
                          );
                        }}
                        disabled={isPending}
                        className="btn btn-sm btn-ghost text-error rounded-xl text-xs font-bold gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {!canStartReview && !canQuote && !canDecide && (
                    <span className="badge badge-sm badge-ghost font-bold gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {campaign.statusLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
