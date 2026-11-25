"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";
import { createBoosterEngagementRequestAction } from "@/server/actions/booster-engagement";

export default function EngagementRequestDialog({
  boosterId,
  boosterName,
  services,
  packages,
}: {
  boosterId: string;
  boosterName: string;
  services: Array<{ id: string; title: string; priceMin: number | null }>;
  packages: Array<{ id: string; name: string; price: number }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const close = () => {
    setOpen(false);
    setError(null);
    setSent(false);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBoosterEngagementRequestAction({
        boosterId,
        serviceId: serviceId || undefined,
        packageId: packageId || undefined,
        title,
        brief,
        budget: budget ? Number(budget) : undefined,
        timeline: timeline || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSent(true);
      setTitle("");
      setBrief("");
      setBudget("");
      setTimeline("");
    });
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-sm rounded-xl"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-4 w-4" />
        Request this Booster
      </button>

      {open && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-bold">
              Contact {boosterName}
            </h3>
            <p className="mt-1 text-[11px] text-base-content/60">
              Send a direct brief. The Booster can accept or decline; accepted
              requests can then be converted into a paid Booster job.
            </p>

            {sent ? (
              <div className="mt-5 space-y-4">
                <div className="alert alert-success text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Request sent. The Booster has been notified.</span>
                </div>
                <div className="modal-action">
                  <button type="button" className="btn btn-sm" onClick={close}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <label className="form-control">
                  <span className="label-text text-xs font-bold">Request title</span>
                  <input
                    className="input input-bordered"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Launch campaign creative"
                    required
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Service (optional)</span>
                    <select
                      className="select select-bordered"
                      value={serviceId}
                      onChange={(event) => setServiceId(event.target.value)}
                    >
                      <option value="">Not specified</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Package (optional)</span>
                    <select
                      className="select select-bordered"
                      value={packageId}
                      onChange={(event) => setPackageId(event.target.value)}
                    >
                      <option value="">Not specified</option>
                      {packages.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text text-xs font-bold">Brief</span>
                  <textarea
                    className="textarea textarea-bordered text-sm"
                    rows={4}
                    maxLength={5000}
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    placeholder="Describe the campaign, deliverables and timeline."
                    required
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Budget (₦, optional)</span>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered"
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Timeline</span>
                    <input
                      className="input input-bordered"
                      value={timeline}
                      onChange={(event) => setTimeline(event.target.value)}
                      placeholder="e.g. 2 weeks"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Contact email</span>
                    <input
                      type="email"
                      className="input input-bordered"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      placeholder="Defaults to your account email"
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-xs font-bold">Contact phone</span>
                    <input
                      type="tel"
                      className="input input-bordered"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                    />
                  </label>
                </div>

                {error && <div className="alert alert-error text-xs">{error}</div>}
                <div className="modal-action">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send request
                  </button>
                </div>
              </form>
            )}
          </div>
          <button className="modal-backdrop" onClick={close} aria-label="Close" />
        </div>
      )}
    </>
  );
}
