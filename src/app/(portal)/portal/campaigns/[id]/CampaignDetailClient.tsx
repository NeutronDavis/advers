"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  MapPin,
  Megaphone,
  Receipt,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  campaignStatusBadgeClass,
  campaignStatusLabel,
  normalizeCampaignStatus,
} from "@/lib/campaign-status";
import {
  approveQuoteAction,
  cancelCampaignAction,
  payCampaignInvoiceAction,
  rejectQuoteAction,
} from "@/server/actions/campaign-commerce";
import { submitCampaignDraftAction } from "@/server/actions/campaigns";
import type { CampaignDetailData } from "@/server/data/campaign-detail";

type ActionResult = { success: true } | { success: false; error: string };

export default function CampaignDetailClient({
  campaign,
}: {
  campaign: CampaignDetailData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const latestQuote = campaign.quotes[0];
  const latestInvoice = campaign.invoices[0];
  const normalizedStatus = normalizeCampaignStatus(campaign.status);

  const canApproveQuote = Boolean(
    latestQuote &&
      ["SENT", "VIEWED"].includes(latestQuote.status) &&
      ["QUOTE_REQUIRED", "AWAITING_APPROVAL"].includes(normalizedStatus)
  );
  const canPay = Boolean(
    latestInvoice && ["PENDING", "OVERDUE"].includes(latestInvoice.status)
  );
  const canSubmitDraft = normalizedStatus === "DRAFT";
  const canCancel = !["COMPLETED", "CANCELLED", "REJECTED"].includes(
    normalizedStatus
  );

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
      router.refresh();
    });
  };

  const quoteLines = latestQuote
    ? [
        { label: "Media placement", amount: latestQuote.mediaCost },
        { label: "Advers service fee", amount: latestQuote.adversFee },
        { label: "Production", amount: latestQuote.productionCost },
        { label: "Logistics", amount: latestQuote.logisticsCost },
        { label: "SMS delivery", amount: latestQuote.smsCost },
        { label: "Taxes / payment charges", amount: latestQuote.taxAmount },
      ].filter((line) => line.amount > 0)
    : [];

  const timeline =
    campaign.events.length > 0
      ? campaign.events
      : [
          {
            id: "created",
            fromStatus: null,
            toStatus: campaign.status,
            note: "Campaign created.",
            actorName: null,
            createdAt: campaign.createdAt,
          },
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/portal/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to campaigns</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-3 border-b border-[var(--portal-line)]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
                  {campaign.name}
                </h1>
                <span
                  className={`badge badge-sm font-bold ${campaignStatusBadgeClass(
                    campaign.status
                  )}`}
                >
                  {campaign.statusLabel}
                </span>
              </div>
              <div className="text-[11px] text-[var(--portal-muted)] font-mono mt-1">
                {campaign.campaignNumber} · Created {formatDate(campaign.createdAt)}
              </div>
              <div className="text-xs text-[var(--portal-body)] mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--portal-gold-ink)]" />
                  {campaign.channel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--portal-muted)]" />
                  {campaign.targetLocation}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--portal-muted)]" />
                  {campaign.duration}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
              Campaign budget
            </div>
            <div className="text-2xl font-black text-[var(--portal-ink)]">
              {formatNaira(campaign.budget)}
            </div>
            {campaign.businessProfileName && (
              <div className="text-[11px] text-[var(--portal-muted)] flex items-center lg:justify-end gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5" />
                {campaign.businessProfileName}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="alert bg-[var(--portal-success-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--portal-success)]" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Status timeline */}
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                  Campaign timeline
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Status history and review notes.
                </p>
              </div>
              <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                {timeline.length} events
              </span>
            </div>

            <ul className="timeline timeline-vertical timeline-compact">
              {timeline.map((event, index) => (
                <li key={event.id}>
                  {index > 0 && <hr className="bg-[var(--portal-line)]" />}
                  <div className="timeline-middle">
                    <span className="w-6 h-6 rounded-full bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="timeline-end timeline-box bg-[var(--portal-soft)] border-[var(--portal-line)] rounded-2xl p-3 my-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`badge badge-xs font-bold ${campaignStatusBadgeClass(
                          event.toStatus
                        )}`}
                      >
                        {campaignStatusLabel(event.toStatus)}
                      </span>
                      <span className="text-[10px] text-[var(--portal-muted)] font-mono">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                    {event.note && (
                      <div className="text-[11px] text-[var(--portal-body)] mt-1">
                        {event.note}
                      </div>
                    )}
                    {event.actorName && (
                      <div className="text-[10px] text-[var(--portal-muted)] mt-0.5">
                        by {event.actorName}
                      </div>
                    )}
                  </div>
                  {index < timeline.length - 1 && <hr className="bg-[var(--portal-line)]" />}
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                  Quote &amp; itemised costs
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Media, service, production and delivery costs are shown
                  separately from your subscription.
                </p>
              </div>
              {latestQuote && (
                <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                  {latestQuote.status}
                </span>
              )}
            </div>

            {!latestQuote ? (
              <div className="p-6 rounded-2xl bg-[var(--portal-soft)] text-center text-xs text-[var(--portal-muted)]">
                <ShieldCheck className="w-7 h-7 text-[var(--portal-gold-ink)] mx-auto mb-2" />
                No quote has been issued yet. Advers will review the campaign
                brief and send an itemised quote.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[var(--portal-ink)]">
                      {latestQuote.quoteNumber}
                    </div>
                    <div className="text-[10px] text-[var(--portal-muted)]">
                      Issued {formatDate(latestQuote.sentAt)} · Expires{" "}
                      {formatDate(latestQuote.expiresAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                      Total
                    </div>
                    <div className="text-xl font-black text-[var(--portal-ink)]">
                      {formatNaira(latestQuote.amount)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--portal-line)] overflow-hidden">
                  <div className="divide-y divide-[var(--portal-line-soft)]">
                    {quoteLines.map((line) => (
                      <div
                        key={line.label}
                        className="flex items-center justify-between px-3 py-2 text-[11px]"
                      >
                        <span className="text-[var(--portal-body)]">{line.label}</span>
                        <span className="font-bold text-[var(--portal-ink)]">
                          {formatNaira(line.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-3 py-2 bg-[var(--portal-soft)] text-xs">
                      <span className="font-black text-[var(--portal-ink)]">Total</span>
                      <span className="font-black text-[var(--portal-ink)]">
                        {formatNaira(latestQuote.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {latestQuote.notes && (
                  <div className="p-3 rounded-2xl bg-[var(--portal-soft)] text-[11px] text-[var(--portal-body)]">
                    {latestQuote.notes}
                  </div>
                )}

                {canApproveQuote && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[var(--portal-line-soft)]">
                    <button
                      type="button"
                      onClick={() => {
                        const reason = window.prompt(
                          "Tell Advers why you are rejecting this quote (optional):"
                        );
                        run(
                          () => rejectQuoteAction(latestQuote!.id, reason || undefined),
                          "Quote rejected."
                        );
                      }}
                      disabled={isPending}
                      className="btn btn-sm btn-ghost text-[var(--portal-muted)] hover:text-error rounded-xl text-xs font-bold gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject quote
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () => approveQuoteAction(latestQuote!.id),
                          "Quote approved. An invoice has been created."
                        )
                      }
                      disabled={isPending}
                      className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl text-xs font-black gap-1.5"
                    >
                      {isPending ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve quote
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Invoice / payment */}
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                  Campaign payment
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Media and service payments are separate from your subscription.
                </p>
              </div>
              {latestInvoice && (
                <span
                  className={`badge badge-sm font-bold ${
                    latestInvoice.status === "PAID"
                      ? "badge-success badge-soft"
                      : "badge-warning badge-soft"
                  }`}
                >
                  {latestInvoice.status}
                </span>
              )}
            </div>

            {!latestInvoice ? (
              <div className="p-6 rounded-2xl bg-[var(--portal-soft)] text-center text-xs text-[var(--portal-muted)]">
                <CreditCard className="w-7 h-7 text-[var(--portal-muted)] mx-auto mb-2" />
                An invoice will appear here after you approve a quote.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {latestInvoice.invoiceNumber}
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)]">
                    Due {formatDate(latestInvoice.dueDate)}
                    {latestInvoice.paidAt
                      ? ` · Paid ${formatDate(latestInvoice.paidAt)}`
                      : ""}
                  </div>
                  <div className="text-lg font-black text-[var(--portal-ink)] mt-1">
                    {formatNaira(latestInvoice.amount)}
                  </div>
                </div>

                {canPay && (
                  <button
                    type="button"
                    onClick={() =>
                      run(
                        () => payCampaignInvoiceAction(latestInvoice!.id),
                        "Payment received. Campaign confirmed."
                      )
                    }
                    disabled={isPending}
                    className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold gap-1.5"
                  >
                    {isPending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Pay now (mock)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Proofs */}
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[var(--portal-success)]" />
                  Proof of performance
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Verified execution evidence supplied by Advers or media partners.
                </p>
              </div>
              <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                {campaign.proofs.length} records
              </span>
            </div>

            {campaign.proofs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--portal-soft)] text-center text-xs text-[var(--portal-muted)]">
                No proof has been uploaded yet. Proof appears after execution begins.
              </div>
            ) : (
              <div className="divide-y divide-[var(--portal-line-soft)]">
                {campaign.proofs.map((proof) => (
                  <div key={proof.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[var(--portal-gold-ink)]">
                          {proof.proofCode}
                        </span>
                        <span className="badge badge-xs badge-success badge-soft font-bold">
                          {proof.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[var(--portal-ink)] mt-1">
                        {proof.caption || "Verified execution evidence"}
                      </div>
                      <div className="text-[10px] text-[var(--portal-muted)]">
                        {proof.verifiedBy} · {formatDate(proof.verifiedAt)}
                      </div>
                    </div>
                    <a
                      href={proof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-ghost border border-[var(--portal-line)] rounded-lg font-bold shrink-0"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[var(--portal-ink)]">Campaign brief</h2>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--portal-muted)]">Objective</span>
                <span className="font-bold text-[var(--portal-ink)] text-right">
                  {campaign.objective}
                </span>
              </div>
              {campaign.productService && (
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--portal-muted)]">Product / service</span>
                  <span className="font-bold text-[var(--portal-ink)] text-right">
                    {campaign.productService}
                  </span>
                </div>
              )}
              {campaign.targetAudience && (
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--portal-muted)]">Audience</span>
                  <span className="font-bold text-[var(--portal-ink)] text-right">
                    {campaign.targetAudience}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-[var(--portal-muted)]">Preferred dates</span>
                <span className="font-bold text-[var(--portal-ink)] text-right">
                  {campaign.startDate ? formatDate(campaign.startDate) : "Flexible"} –{" "}
                  {campaign.endDate ? formatDate(campaign.endDate) : "Flexible"}
                </span>
              </div>
              {campaign.inventoryName && (
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--portal-muted)]">Media slot</span>
                  <span className="font-bold text-[var(--portal-ink)] text-right">
                    {campaign.inventoryName}
                    {campaign.inventoryCity ? ` · ${campaign.inventoryCity}` : ""}
                  </span>
                </div>
              )}
            </div>

            {campaign.creativeAssetUrl && (
              <a
                href={campaign.creativeAssetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-xl text-xs font-bold w-full gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                View creative
              </a>
            )}
          </div>

          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[var(--portal-ink)]">Contact</h2>
            <div className="text-[11px] space-y-1.5">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--portal-muted)]">Name</span>
                <span className="font-bold text-[var(--portal-ink)] text-right">
                  {campaign.contactName || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--portal-muted)]">Email</span>
                <span className="font-bold text-[var(--portal-ink)] text-right break-all">
                  {campaign.contactEmail || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--portal-muted)]">Phone</span>
                <span className="font-bold text-[var(--portal-ink)] text-right">
                  {campaign.contactPhone || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {campaign.notes && (
            <div className="card bg-[var(--portal-gold-soft)] border border-[var(--portal-gold-border)] rounded-3xl p-5 shadow-xs space-y-2">
              <h2 className="text-sm font-bold text-[var(--portal-ink)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                Notes for the media team
              </h2>
              <p className="text-[11px] text-[var(--portal-body)] leading-relaxed">
                {campaign.notes}
              </p>
            </div>
          )}

          {canSubmitDraft && (
            <button
              type="button"
              onClick={() =>
                run(
                  () => submitCampaignDraftAction(campaign.id),
                  "Draft submitted for review."
                )
              }
              disabled={isPending}
              className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl text-xs font-black w-full gap-1.5"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Submit draft for review
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Cancel this campaign? Existing data is kept.")) return;
                run(
                  () => cancelCampaignAction(campaign.id),
                  "Campaign cancelled."
                );
              }}
              disabled={isPending}
              className="btn btn-sm btn-ghost text-[var(--portal-muted)] hover:text-error rounded-xl text-xs font-bold w-full gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel campaign
            </button>
          )}

          <Link
            href="/portal/support"
            className="btn btn-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-xl text-xs font-bold w-full gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Contact media desk
          </Link>
        </div>
      </div>
    </div>
  );
}
