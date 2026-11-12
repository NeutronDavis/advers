"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import { useCampaign } from "@/context/CampaignContext";
import type { ChannelCatalogItem } from "@/lib/channels";
import type {
  MediaPartnerDetailView,
  MediaSlotView,
} from "@/server/data/channels";

function slotTime(slot: MediaSlotView): string {
  if (slot.date) return formatDate(slot.date);
  if (slot.startTime && slot.endTime) return `${slot.startTime}–${slot.endTime}`;
  return slot.label;
}

function channelRequirements(channel: ChannelCatalogItem): string[] {
  switch (channel.channelType) {
    case "FM_RADIO":
      return [
        "Broadcast audio WAV or MP3, 30 seconds",
        "ARCON clearance where applicable",
        "Station affidavit or broadcast log after airing",
      ];
    case "TELEVISION":
      return [
        "MP4 or ProRes master, 30 seconds",
        "ARCON clearance where applicable",
        "Broadcast transmission log or affidavit",
      ];
    case "NEWSPAPER":
      return [
        "Print-ready PDF, CMYK, 300 DPI",
        "Correct dimensions for the selected placement",
        "Published tearsheet after the edition",
      ];
    case "PODCAST":
      return [
        "Host-read script or approved audio file",
        "Episode publish date and show notes",
        "Episode link or download report",
      ];
    case "DIGITAL_BILLBOARD":
    case "STATIC_BILLBOARD":
      return [
        "MP4 video or high-resolution JPEG/PNG",
        "15s or 30s loop-compatible creative",
        "Day and night proof photos after going live",
      ];
    default:
      return [
        "Creative assets in the agreed format",
        "Any required regulatory clearance",
        "Proof of execution after the campaign",
      ];
  }
}

export default function PartnerDetailClient({
  channel,
  partner,
}: {
  channel: ChannelCatalogItem;
  partner: MediaPartnerDetailView;
}) {
  const { openCreateModal } = useCampaign();
  const availableSlots = partner.slots.filter(
    (slot) =>
      slot.remaining > 0 && ["AVAILABLE", "LIMITED"].includes(slot.status)
  );
  const [selectedSlotId, setSelectedSlotId] = useState(
    availableSlots[0]?.id || ""
  );
  const selectedSlot = partner.slots.find((slot) => slot.id === selectedSlotId);
  const requirements = channelRequirements(channel);

  const book = () => {
    if (!selectedSlot) return;
    openCreateModal(channel.label, partner.id, selectedSlot.id);
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/portal/channels/${channel.slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {channel.label}
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-3 border-b border-[var(--portal-line)]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center text-xl shrink-0">
            {channel.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
                {partner.name}
              </h1>
              <span className="badge badge-sm badge-success badge-soft font-bold">
                Verified partner
              </span>
            </div>
            <div className="text-[11px] text-[var(--portal-muted)] font-mono mt-1">
              {partner.inventoryCode} · {channel.label} · {partner.vendorName}
            </div>
            <div className="text-xs text-[var(--portal-body)] mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--portal-muted)]" />
                {partner.locationDetails} · {partner.city}, {partner.state}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left lg:text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
            Starting rate
          </div>
          <div className="text-2xl font-black text-[var(--portal-ink)] font-mono">
            {formatNaira(partner.ratePerUnit)}
          </div>
          <div className="text-[10px] text-[var(--portal-muted)]">
            {partner.unitType.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                Partner details
              </h2>
              <p className="text-[11px] text-[var(--portal-muted)]">
                Review the media partner information before selecting a time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Format / specs
                </div>
                <div className="font-bold text-[var(--portal-ink)] mt-1">
                  {partner.screenSpecs || "Details available on request"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Loop / capacity
                </div>
                <div className="font-bold text-[var(--portal-ink)] mt-1">
                  {partner.loopCapacity || "Confirmed on review"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Media owner
                </div>
                <div className="font-bold text-[var(--portal-ink)] mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--portal-muted)]" />
                  {partner.vendorName}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--portal-soft)]">
                <div className="text-[10px] font-bold uppercase text-[var(--portal-muted)]">
                  Availability
                </div>
                <div className="font-bold text-[var(--portal-ink)] mt-1 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--portal-muted)]" />
                  {availableSlots.length} bookable time
                  {availableSlots.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--portal-gold-soft)] border border-[var(--portal-gold-border)] text-[11px] text-[var(--portal-body)]">
              Audience reach and performance data are shown only where verified
              data is supplied by the media partner. Advers does not guarantee
              reach, sales or campaign outcomes.
            </div>
          </div>

          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--portal-gold-ink)]" />
                  Availability &amp; time slots
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Select one available time to continue.
                </p>
              </div>
              <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                {partner.slots.length} slots
              </span>
            </div>

            {partner.slots.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--portal-soft)] text-center text-xs text-[var(--portal-muted)]">
                No time slots are published for this partner yet. Request
                assistance and the media desk will confirm availability.
              </div>
            ) : (
              <div className="space-y-2">
                {partner.slots.map((slot) => {
                  const disabled =
                    slot.remaining <= 0 ||
                    !["AVAILABLE", "LIMITED"].includes(slot.status);
                  const selected = selectedSlotId === slot.id;
                  return (
                    <label
                      key={slot.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        selected
                          ? "border-[var(--portal-gold)] bg-[var(--portal-gold-soft)]"
                          : disabled
                            ? "border-[var(--portal-line)] bg-[var(--portal-soft)] opacity-60 cursor-not-allowed"
                            : "border-[var(--portal-line)] hover:border-[var(--portal-gold-border)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="media-slot"
                          value={slot.id}
                          checked={selected}
                          disabled={disabled}
                          onChange={() => setSelectedSlotId(slot.id)}
                          className="radio radio-primary radio-sm mt-0.5"
                        />
                        <div>
                          <div className="text-xs font-bold text-[var(--portal-ink)]">
                            {slot.label}
                          </div>
                          <div className="text-[10px] text-[var(--portal-muted)] flex flex-wrap items-center gap-2 mt-0.5">
                            <span>{slotTime(slot)}</span>
                            {slot.daysOfWeek && <span>{slot.daysOfWeek}</span>}
                            <span>
                              {slot.remaining} of {slot.capacity} remaining
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black font-mono text-[var(--portal-ink)]">
                          {formatNaira(slot.rate)}
                        </div>
                        <span
                          className={`badge badge-xs font-bold ${
                            disabled
                              ? "badge-error badge-soft"
                              : slot.status === "LIMITED"
                                ? "badge-warning badge-soft"
                                : "badge-success badge-soft"
                          }`}
                        >
                          {disabled ? "Unavailable" : slot.status}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[var(--portal-success)]" />
              Requirements
            </h2>
            <div className="space-y-1.5">
              {requirements.map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-start gap-2 text-[11px] text-[var(--portal-body)]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--portal-success)] shrink-0 mt-0.5" />
                  {requirement}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-[var(--portal-obsidian)] text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 sticky top-24">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-gold)]">
                Selected time
              </div>
              <div className="text-lg font-black mt-1">
                {selectedSlot ? selectedSlot.label : "Choose a time slot"}
              </div>
              {selectedSlot && (
                <div className="text-[11px] text-[var(--portal-obsidian-muted-2)] mt-1">
                  {slotTime(selectedSlot)} · {formatNaira(selectedSlot.rate)}
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] text-[10px] text-[var(--portal-obsidian-muted)] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--portal-success)] shrink-0" />
              <span>
                Booking is confirmed only after Advers reviews the campaign,
                confirms partner availability and payment is received.
              </span>
            </div>

            {selectedSlot ? (
              <button
                type="button"
                onClick={book}
                className="btn w-full bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none font-black text-xs rounded-xl shadow-md gap-2"
              >
                Book this time
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/portal/support"
                className="btn w-full bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none font-black text-xs rounded-xl"
              >
                Request assistance
              </Link>
            )}

            <Link
              href="/portal/support"
              className="btn btn-ghost btn-sm w-full text-[var(--portal-obsidian-muted-2)] hover:text-white border-[var(--portal-obsidian-line)] rounded-xl text-[11px] font-bold"
            >
              Ask the media desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
