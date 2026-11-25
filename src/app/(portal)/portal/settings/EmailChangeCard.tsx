"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Copy, Loader2, Mail } from "lucide-react";
import { requestEmailChangeAction } from "@/server/actions/account";

export default function EmailChangeCard({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setVerificationUrl(null);
    startTransition(async () => {
      const result = await requestEmailChangeAction({
        newEmail,
        currentPassword: password,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Verification link generated.");
      setVerificationUrl(result.verificationUrl ?? null);
      setPassword("");
    });
  };

  const copyLink = async () => {
    if (!verificationUrl) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${verificationUrl}`
    );
  };

  return (
    <section className="rounded-3xl border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-soft)] text-[var(--portal-gold-ink)]">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Email address
          </h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            Current: <span className="font-bold">{email}</span>. Changes require
            password confirmation and a verification link.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text text-xs font-bold">New email address</span>
          <input
            type="email"
            className="input input-bordered"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs font-bold">Current password</span>
          <input
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Request email change
          </button>
        </div>
      </form>

      {message && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}
      {verificationUrl && (
        <div className="rounded-xl bg-[var(--portal-soft)] p-3 text-xs">
          <div className="font-bold">Development verification link</div>
          <div className="mt-1 flex items-center gap-2">
            <a className="link break-all" href={verificationUrl}>
              {verificationUrl}
            </a>
            <button type="button" className="btn btn-ghost btn-xs" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {error && <div className="alert alert-error text-xs">{error}</div>}
    </section>
  );
}
