"use client";

import React, { useState, useTransition } from "react";
import { Flag, Loader2 } from "lucide-react";
import { reportMarketplaceContentAction } from "@/server/actions/marketplace";

type TargetType = "PROFILE" | "COMMENT" | "REVIEW" | "RECOMMENDATION";

export default function ReportButton({
  boosterId,
  targetType,
  targetId,
  label = "Report",
}: {
  boosterId: string;
  targetType: TargetType;
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await reportMarketplaceContentAction({
        boosterId,
        targetType,
        targetId,
        reason,
        details: details || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDone(true);
      setReason("");
      setDetails("");
    });
  };

  const close = () => {
    setOpen(false);
    setDone(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <Flag className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <h3 className="text-base font-bold">Report content</h3>
            <p className="mt-1 text-[11px] text-base-content/60">
              Reports go to ADVERS moderation. False reports may be rate-limited.
            </p>
            {done ? (
              <div className="alert alert-success mt-4 text-xs">
                Report received. Our team will review it.
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <label className="form-control">
                  <span className="label-text text-xs font-bold">Reason</span>
                  <textarea
                    className="textarea textarea-bordered text-sm"
                    rows={3}
                    maxLength={1000}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Spam, abuse, misleading claims, impersonation…"
                    required
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-xs font-bold">
                    Additional details (optional)
                  </span>
                  <textarea
                    className="textarea textarea-bordered text-sm"
                    rows={2}
                    maxLength={2000}
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                  />
                </label>
                {error && <div className="alert alert-error text-xs">{error}</div>}
                <div className="modal-action">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-error btn-sm" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit report
                  </button>
                </div>
              </form>
            )}
            {done && (
              <div className="modal-action">
                <button type="button" className="btn btn-sm" onClick={close}>
                  Close
                </button>
              </div>
            )}
          </div>
          <button className="modal-backdrop" onClick={close} aria-label="Close" />
        </div>
      )}
    </>
  );
}
