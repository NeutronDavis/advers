"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, LogOut, Trash2 } from "lucide-react";
import {
  deactivateAccountAction,
  requestAccountDeletionAction,
} from "@/server/actions/account";

export default function DangerZoneCard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deactivate = () => {
    setError(null);
    startTransition(async () => {
      const result = await deactivateAccountAction(password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/login?deactivated=1");
      router.refresh();
    });
  };

  const requestDeletion = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestAccountDeletionAction({
        currentPassword: password,
        reason: reason || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/login?deletionRequested=1");
      router.refresh();
    });
  };

  return (
    <section className="rounded-3xl border border-error/30 bg-[var(--portal-surface)] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Danger zone
          </h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            Deactivation signs you out immediately. Deletion is irreversible and
            handled by support.
          </p>
        </div>
      </div>

      <label className="form-control max-w-md">
        <span className="label-text text-xs font-bold">Current password</span>
        <input
          type="password"
          className="input input-bordered"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <label className="flex items-start gap-2 text-[11px] text-[var(--portal-muted)]">
        <input
          type="checkbox"
          className="checkbox checkbox-error checkbox-sm mt-0.5"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          I understand that deactivation signs me out and that deletion removes my
          access permanently.
        </span>
      </label>

      <label className="form-control max-w-md">
        <span className="label-text text-xs font-bold">
          Reason for deletion (optional)
        </span>
        <textarea
          className="textarea textarea-bordered text-sm"
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={1000}
        />
      </label>

      {error && <div className="alert alert-error text-xs">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-warning btn-sm"
          onClick={deactivate}
          disabled={isPending || !confirmed || password.length < 1}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Deactivate account
        </button>
        <button
          type="button"
          className="btn btn-error btn-sm"
          onClick={requestDeletion}
          disabled={isPending || !confirmed || password.length < 1}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Request deletion
        </button>
      </div>
    </section>
  );
}
