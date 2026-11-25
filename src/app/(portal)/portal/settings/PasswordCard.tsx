"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { changePasswordAction } from "@/server/actions/account";

export default function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword, newPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  return (
    <section className="rounded-3xl border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-soft)] text-[var(--portal-gold-ink)]">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">Password</h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            Changing your password signs out other sessions.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
        <label className="form-control">
          <span className="label-text text-xs font-bold">Current password</span>
          <input
            type="password"
            className="input input-bordered"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs font-bold">New password</span>
          <input
            type="password"
            className="input input-bordered"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs font-bold">Confirm new password</span>
          <input
            type="password"
            className="input input-bordered"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <div className="sm:col-span-3 flex justify-end">
          <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </div>
      </form>

      {message && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}
      {error && <div className="alert alert-error text-xs">{error}</div>}
    </section>
  );
}
