"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  beginTwoFactorAction,
  confirmTwoFactorAction,
  disableTwoFactorAction,
  recoverTwoFactorAction,
  regenerateRecoveryCodesAction,
} from "@/server/actions/two-factor";

interface TwoFactorState {
  enabled: boolean;
  confirmedAt: string | null;
  recoveryCodesRemaining: number;
}

export default function SecurityClient({ initial }: { initial: TwoFactorState }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [enrolment, setEnrolment] = useState<{
    secret: string;
    otpauthUri: string;
    recoveryCodes: string[];
  } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [regenCode, setRegenCode] = useState("");
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryCode, setRecoveryCode] = useState("");

  const begin = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await beginTwoFactorAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEnrolment({
        secret: result.secret,
        otpauthUri: result.otpauthUri,
        recoveryCodes: result.recoveryCodes,
      });
    });
  };

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmTwoFactorAction(confirmCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice("Two-factor authentication is now enabled.");
      setEnrolment(null);
      setConfirmCode("");
      router.refresh();
    });
  };

  const disable = () => {
    setError(null);
    startTransition(async () => {
      const result = await disableTwoFactorAction(disableCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice("Two-factor authentication disabled.");
      setDisableCode("");
      router.refresh();
    });
  };

  const regenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await regenerateRecoveryCodesAction(regenCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNewRecoveryCodes(result.recoveryCodes);
      setRegenCode("");
      router.refresh();
    });
  };

  const recover = () => {
    setError(null);
    startTransition(async () => {
      const result = await recoverTwoFactorAction(recoveryCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice("2FA disabled with a recovery code. Set up your authenticator again.");
      setRecoveryCode("");
      router.refresh();
    });
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
    } catch {
      setError("Could not copy. Select the value manually.");
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      <Link
        href="/portal/settings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to settings
      </Link>

      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
          Account security
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-ink)] sm:text-3xl">
          Two-factor authentication
        </h1>
        <p className="mt-0.5 text-xs text-[var(--portal-muted)] sm:text-sm">
          Protect withdrawals and sensitive account changes with an authenticator app.
        </p>
      </div>

      {notice && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error text-xs">
          <span>{error}</span>
        </div>
      )}

      <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                initial.enabled
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {initial.enabled ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <ShieldOff className="h-5 w-5" />
              )}
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--portal-ink)]">
                {initial.enabled ? "Enabled" : "Not enabled"}
              </div>
              <div className="text-[11px] text-[var(--portal-muted)]">
                {initial.enabled
                  ? `${initial.recoveryCodesRemaining} recovery codes remaining`
                  : "Withdrawals are blocked until 2FA is enabled"}
              </div>
            </div>
          </div>
          {!initial.enabled && !enrolment && (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl"
              onClick={begin}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Set up authenticator
            </button>
          )}
        </div>
      </section>

      {enrolment && (
        <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Scan this key in Google Authenticator, 1Password, or Authy
          </h2>
          <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
            Use the manual key if you cannot scan a QR code. This key is shown once.
          </p>

          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[var(--portal-soft)] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Manual key
            </div>
            <div className="flex items-center gap-2">
              <code className="break-all font-mono text-sm font-bold text-[var(--portal-ink)]">
                {enrolment.secret}
              </code>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => copy(enrolment.secret)}
                aria-label="Copy secret"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <a
              className="break-all font-mono text-[10px] text-[var(--portal-gold-ink)] underline"
              href={enrolment.otpauthUri}
            >
              {enrolment.otpauthUri}
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <KeyRound className="h-4 w-4" />
              Recovery codes — save these now
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
              {enrolment.recoveryCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs mt-2"
              onClick={() => copy(enrolment.recoveryCodes.join("\n"))}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy all codes
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="form-control w-full">
              <span className="label-text text-xs font-bold">
                Enter the 6-digit code to confirm
              </span>
              <input
                className="input input-bordered w-full font-mono"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={confirm}
              disabled={isPending || confirmCode.trim().length < 6}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm
            </button>
          </div>
        </section>
      )}

      {initial.enabled && (
        <>
          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Regenerate recovery codes
            </h2>
            <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
              This replaces all unused recovery codes. Existing codes stop working.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Authenticator code</span>
                <input
                  className="input input-bordered w-full font-mono"
                  inputMode="numeric"
                  placeholder="123456"
                  value={regenCode}
                  onChange={(event) => setRegenCode(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-sm"
                onClick={regenerate}
                disabled={isPending || regenCode.trim().length < 6}
              >
                Regenerate
              </button>
            </div>
            {newRecoveryCodes && (
              <div className="mt-3 rounded-xl bg-[var(--portal-soft)] p-4">
                <div className="text-xs font-bold">New recovery codes</div>
                <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
                  {newRecoveryCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="card border border-warning/40 bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Lost your authenticator?
            </h2>
            <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
              Use one of your saved recovery codes to disable 2FA, then enrol a new
              device. Each code works once.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Recovery code</span>
                <input
                  className="input input-bordered w-full font-mono uppercase"
                  placeholder="XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={recover}
                disabled={isPending || recoveryCode.trim().length < 8}
              >
                Use recovery code
              </button>
            </div>
          </section>

          <section className="card border border-error/30 bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Disable two-factor authentication
            </h2>
            <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
              This removes withdrawal protection. You will need to set it up again.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Authenticator code</span>
                <input
                  className="input input-bordered w-full font-mono"
                  inputMode="numeric"
                  placeholder="123456"
                  value={disableCode}
                  onChange={(event) => setDisableCode(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={disable}
                disabled={isPending || disableCode.trim().length < 6}
              >
                Disable 2FA
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
