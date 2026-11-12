"use client";

import React, { useState, useEffect } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  X,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  CalendarDays,
  User,
  Image as ImageIcon,
  Layers,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  channel: "",
  location: "",
  budget: "",
  duration: "1 week",
  goal: "Brand awareness",
  businessProfileId: "",
  productService: "",
  targetAudience: "",
  startDate: "",
  endDate: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  creativeAssetUrl: "",
  creativeAssetType: "",
  notes: "",
};

export default function CampaignCreateModal() {
  const {
    isModalOpen,
    selectedChannel,
    selectedInventoryId,
    selectedMediaSlotId,
    businessProfiles,
    closeCreateModal,
    addCampaign,
    saveDraft,
  } = useCampaign();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    setStep(1);
    setError(null);
    setForm(() => {
      const next = { ...EMPTY_FORM };
      if (selectedChannel?.startsWith("Influencer:")) {
        next.channel = "Influencer Hub";
        next.notes = `Requested creator: ${selectedChannel.replace("Influencer: ", "")}`;
      } else if (selectedChannel) {
        next.channel = selectedChannel;
      }
      if (!next.businessProfileId && businessProfiles.length > 0) {
        next.businessProfileId =
          businessProfiles.find((profile) => profile.isPrimary)?.id ||
          businessProfiles[0].id;
      }
      return next;
    });
  }, [isModalOpen, selectedChannel, businessProfiles]);

  if (!isModalOpen) return null;

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateStepOne = (): boolean => {
    if (!form.name.trim() || !form.channel || !form.location || !form.budget) {
      setError("Campaign name, channel, location and budget are required.");
      return false;
    }
    if (Number(form.budget) <= 0) {
      setError("Budget must be greater than zero.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && !validateStepOne()) return;
    setStep((current) => Math.min(3, current + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !validateStepOne()) return;

    setSubmitting(true);
    setError(null);

    const created = await addCampaign({
      name: form.name,
      channel: form.channel,
      location: form.location,
      budget: Number(form.budget),
      duration: form.duration,
      goal: form.goal,
      businessProfileId: form.businessProfileId || undefined,
      inventoryId: selectedInventoryId || undefined,
      mediaSlotId: selectedMediaSlotId || undefined,
      productService: form.productService || undefined,
      targetAudience: form.targetAudience || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      creativeAssetUrl: form.creativeAssetUrl || undefined,
      creativeAssetType: form.creativeAssetType || undefined,
      notes: form.notes || undefined,
    });

    setSubmitting(false);
    if (created) {
      setForm(EMPTY_FORM);
      setStep(1);
    }
  };

  const handleSaveDraft = async () => {
    if (savingDraft || submitting) return;
    if (!form.name.trim()) {
      setError("Give the draft a name before saving.");
      return;
    }

    setSavingDraft(true);
    setError(null);

    const created = await saveDraft({
      name: form.name,
      channel: form.channel,
      location: form.location,
      budget: Number(form.budget || 0),
      duration: form.duration,
      goal: form.goal,
      businessProfileId: form.businessProfileId || undefined,
      inventoryId: selectedInventoryId || undefined,
      mediaSlotId: selectedMediaSlotId || undefined,
      productService: form.productService || undefined,
      targetAudience: form.targetAudience || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      creativeAssetUrl: form.creativeAssetUrl || undefined,
      creativeAssetType: form.creativeAssetType || undefined,
      notes: form.notes || undefined,
    });

    setSavingDraft(false);
    if (created) {
      setForm(EMPTY_FORM);
      setStep(1);
    }
  };

  const selectedProfile = businessProfiles.find(
    (profile) => profile.id === form.businessProfileId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={closeCreateModal} />

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[var(--portal-surface)] text-[var(--portal-ink)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[var(--portal-line)] z-10 p-5 sm:p-7 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--portal-line)]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[var(--portal-gold-ink)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch campaign</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--portal-ink)] mt-0.5">
              Create advertising campaign
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCreateModal}
            className="btn btn-sm btn-circle btn-ghost text-[var(--portal-muted)] hover:bg-[var(--portal-soft)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <ul className="steps steps-horizontal w-full text-[11px] font-bold">
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Basics</li>
          <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Audience &amp; dates</li>
          <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Contact &amp; creative</li>
        </ul>

        {error && (
          <div className="alert alert-error text-xs py-2.5 rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {selectedInventoryId && (
          <div className="p-3 rounded-2xl bg-[var(--portal-gold-soft)] border border-[var(--portal-gold-border)] text-[11px] text-[var(--portal-body)] flex items-start gap-2">
            <Layers className="w-4 h-4 text-[var(--portal-gold-ink)] shrink-0" />
            <span>
              A media inventory slot is attached to this request. Availability
              will be confirmed during review.
            </span>
          </div>
        )}

        {selectedMediaSlotId && (
          <div className="p-3 rounded-2xl bg-[var(--portal-soft)] border border-[var(--portal-line)] text-[11px] text-[var(--portal-body)] flex items-start gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--portal-gold-ink)] shrink-0" />
            <span>
              Your selected time slot is attached. The media partner will confirm
              the booking during review.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label htmlFor="campName" className="text-xs font-bold text-[var(--portal-ink)]">
                  Campaign name *
                </label>
                <input
                  id="campName"
                  type="text"
                  required
                  placeholder="e.g. Q4 Festive Mega Promo / Lekki Toll Display"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campChannel" className="text-xs font-bold text-[var(--portal-ink)]">
                    Advertising channel *
                  </label>
                  <select
                    id="campChannel"
                    required
                    value={form.channel}
                    onChange={(event) => update("channel", event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  >
                    <option value="">Choose a channel</option>
                    <option value="Digital billboards">Digital billboards (DOOH)</option>
                    <option value="Static billboards">Static billboards (OOH)</option>
                    <option value="FM radio">FM radio advertising</option>
                    <option value="Television">Television advertising</option>
                    <option value="Newspapers">Newspapers &amp; Press</option>
                    <option value="Podcast advertising">Podcast advertising</option>
                    <option value="AdBoosters">AdBoosters network</option>
                    <option value="Influencer Hub">Influencer Hub</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campLocation" className="text-xs font-bold text-[var(--portal-ink)]">
                    Target location *
                  </label>
                  <select
                    id="campLocation"
                    required
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  >
                    <option value="">Select location</option>
                    <option value="Lagos (Lekki / Victoria Island / Ikeja)">
                      Lagos (Lekki / VI / Ikeja)
                    </option>
                    <option value="Port Harcourt (GRA / Aba Road)">
                      Port Harcourt (GRA / Aba Rd)
                    </option>
                    <option value="Abuja (Central Business District)">
                      Abuja (CBD / Maitama)
                    </option>
                    <option value="Enugu / East Arterials">Enugu / East Arterials</option>
                    <option value="Kano / Northern Hub">Kano / Northern Hub</option>
                    <option value="Nationwide / Online Digital">
                      Nationwide / Online Digital
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campProfile" className="text-xs font-bold text-[var(--portal-ink)]">
                    Business profile
                  </label>
                  <select
                    id="campProfile"
                    value={form.businessProfileId}
                    onChange={(event) => update("businessProfileId", event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  >
                    <option value="">Account default</option>
                    {businessProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                        {profile.isPrimary ? " (Primary)" : ""}
                      </option>
                    ))}
                  </select>
                  {selectedProfile && (
                    <p className="text-[10px] text-[var(--portal-muted)]">
                      Campaign will be linked to {selectedProfile.name}.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="campBudget" className="text-xs font-bold text-[var(--portal-ink)]">
                    Estimated budget (₦) *
                  </label>
                  <input
                    id="campBudget"
                    type="number"
                    min="10000"
                    step="5000"
                    required
                    placeholder="e.g. 150000"
                    value={form.budget}
                    onChange={(event) => update("budget", event.target.value)}
                    className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campDuration" className="text-xs font-bold text-[var(--portal-ink)]">
                    Campaign duration
                  </label>
                  <select
                    id="campDuration"
                    value={form.duration}
                    onChange={(event) => update("duration", event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  >
                    <option value="1-3 days">1–3 days (Hype flight)</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="Custom dates">Custom duration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campGoal" className="text-xs font-bold text-[var(--portal-ink)]">
                    Primary objective
                  </label>
                  <select
                    id="campGoal"
                    value={form.goal}
                    onChange={(event) => update("goal", event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  >
                    <option value="Brand awareness">Brand awareness &amp; visibility</option>
                    <option value="Promote a product or service">
                      Promote product or service
                    </option>
                    <option value="Drive sales or enquiries">
                      Drive foot-traffic &amp; phone enquiries
                    </option>
                    <option value="Promote an event">
                      Promote an event / concert / webinar
                    </option>
                    <option value="Public announcement">
                      Public announcement &amp; press release
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience & dates */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campProduct" className="text-xs font-bold text-[var(--portal-ink)]">
                    Product / service
                  </label>
                  <input
                    id="campProduct"
                    type="text"
                    value={form.productService}
                    onChange={(event) => update("productService", event.target.value)}
                    placeholder="e.g. Solar inverter installation"
                    className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="campAudience" className="text-xs font-bold text-[var(--portal-ink)]">
                    Target audience
                  </label>
                  <input
                    id="campAudience"
                    type="text"
                    value={form.targetAudience}
                    onChange={(event) => update("targetAudience", event.target.value)}
                    placeholder="e.g. Homeowners and SMEs in Lagos"
                    className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campStart" className="text-xs font-bold text-[var(--portal-ink)]">
                    Preferred start date
                  </label>
                  <div className="relative">
                    <input
                      id="campStart"
                      type="date"
                      value={form.startDate}
                      onChange={(event) => update("startDate", event.target.value)}
                      className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)] pl-10"
                    />
                    <CalendarDays className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campEnd" className="text-xs font-bold text-[var(--portal-ink)]">
                    Preferred end date
                  </label>
                  <div className="relative">
                    <input
                      id="campEnd"
                      type="date"
                      value={form.endDate}
                      onChange={(event) => update("endDate", event.target.value)}
                      className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)] pl-10"
                    />
                    <CalendarDays className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--portal-soft)] text-[11px] text-[var(--portal-muted)] flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--portal-gold-ink)] shrink-0" />
                <span>
                  Dates are preferences, not guaranteed bookings. Advers confirms
                  availability with the media partner before a campaign is
                  confirmed.
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Contact & creative */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campContactName" className="text-xs font-bold text-[var(--portal-ink)]">
                    Contact name
                  </label>
                  <div className="relative">
                    <input
                      id="campContactName"
                      type="text"
                      value={form.contactName}
                      onChange={(event) => update("contactName", event.target.value)}
                      placeholder="Campaign contact"
                      className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)] pl-10"
                    />
                    <User className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campContactPhone" className="text-xs font-bold text-[var(--portal-ink)]">
                    Contact phone
                  </label>
                  <input
                    id="campContactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={(event) => update("contactPhone", event.target.value)}
                    placeholder="+234 800 000 0000"
                    className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="campContactEmail" className="text-xs font-bold text-[var(--portal-ink)]">
                  Contact email
                </label>
                <input
                  id="campContactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => update("contactEmail", event.target.value)}
                  placeholder="campaigns@company.ng"
                  className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="campCreativeUrl" className="text-xs font-bold text-[var(--portal-ink)]">
                    Creative asset link
                  </label>
                  <div className="relative">
                    <input
                      id="campCreativeUrl"
                      type="url"
                      value={form.creativeAssetUrl}
                      onChange={(event) => update("creativeAssetUrl", event.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)] pl-10"
                    />
                    <ImageIcon className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campCreativeType" className="text-xs font-bold text-[var(--portal-ink)]">
                    Creative format
                  </label>
                  <input
                    id="campCreativeType"
                    type="text"
                    value={form.creativeAssetType}
                    onChange={(event) => update("creativeAssetType", event.target.value)}
                    placeholder="e.g. MP4 1080x1920, 15s"
                    className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="campNotes" className="text-xs font-bold text-[var(--portal-ink)]">
                  Notes for the media team
                </label>
                <textarea
                  id="campNotes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  placeholder="Any special instructions, preferred slots, or creative notes."
                  className="textarea textarea-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--portal-gold-soft)] border border-[var(--portal-gold-border)] text-[11px] text-[var(--portal-body)] space-y-1">
                <div className="font-bold text-[var(--portal-ink)] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[var(--portal-success)]" />
                  Review summary
                </div>
                <div>
                  {form.name || "Campaign"} · {form.channel || "Channel"} ·{" "}
                  {form.location || "Location"} · ₦
                  {Number(form.budget || 0).toLocaleString("en-NG")}
                </div>
                <div>
                  {selectedProfile?.name || "Account default profile"} ·{" "}
                  {form.startDate || "Flexible start"} to {form.endDate || "Flexible end"}
                </div>
              </div>

              <div className="p-3 bg-[var(--portal-soft)] rounded-xl flex items-start gap-2.5 text-xs text-[var(--portal-muted)]">
                <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)] shrink-0 mt-0.5" />
                <span>
                  Advers will review the creative and secure partner rate
                  confirmation. No charge is finalized until a quote is approved
                  and payment is confirmed.
                </span>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[var(--portal-line)]">
            <button
              type="button"
              onClick={step === 1 ? closeCreateModal : goBack}
              className="btn btn-ghost btn-sm text-xs font-bold rounded-xl gap-1"
            >
              {step === 1 ? (
                <span>Cancel</span>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || submitting}
                className="btn btn-ghost btn-sm text-xs font-bold rounded-xl gap-1"
              >
                {savingDraft ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <span>Save draft</span>
                )}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn btn-sm text-xs font-black bg-[var(--portal-obsidian)] hover:bg-black text-white rounded-xl px-5 shadow-md flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-sm text-xs font-black bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] rounded-xl px-5 shadow-md flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{submitting ? "Submitting..." : "Submit for review"}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
