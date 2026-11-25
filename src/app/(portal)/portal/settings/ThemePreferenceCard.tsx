"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Loader2, SunMoon } from "lucide-react";
import { updateThemePreferenceAction } from "@/server/actions/account";

type Preference = "LIGHT" | "DARK" | "SYSTEM";

function applyTheme(preference: Preference) {
  const resolved =
    preference === "SYSTEM"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference.toLowerCase();
  document.documentElement.setAttribute("data-theme", resolved);
  localStorage.setItem("advers-theme", resolved);
}

export default function ThemePreferenceCard({
  initial,
}: {
  initial: Preference;
}) {
  const [preference, setPreference] = useState<Preference>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateThemePreferenceAction(preference);
      if (!result.success) {
        setError(result.error);
        return;
      }
      applyTheme(preference);
      setSaved(true);
    });
  };

  return (
    <section className="rounded-3xl border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-soft)] text-[var(--portal-gold-ink)]">
          <SunMoon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Appearance
          </h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            Your preference is saved to your account and follows you across devices.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="form-control w-full max-w-xs">
          <span className="label-text text-xs font-bold">Theme</span>
          <select
            className="select select-bordered"
            value={preference}
            onChange={(event) => setPreference(event.target.value as Preference)}
          >
            <option value="SYSTEM">Use device setting</option>
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save theme
        </button>
      </div>

      {saved && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>Theme preference saved.</span>
        </div>
      )}
      {error && <div className="alert alert-error text-xs">{error}</div>}
    </section>
  );
}
