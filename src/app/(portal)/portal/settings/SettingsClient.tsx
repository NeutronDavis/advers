"use client";

import React, { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  User,
  Building,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import {
  updateAccountSettingsAction,
  type AccountSettingsState,
} from "@/server/actions/account";
import { updateNotificationPreferencesAction } from "@/server/actions/notifications";

export default function SettingsClient({
  initial,
  isOwner,
  notificationPreferences,
}: {
  initial: { name: string; email: string; phone: string; company: string };
  isOwner: boolean;
  notificationPreferences: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [company, setCompany] = useState(initial.company);
  const [state, formAction, isPending] = useActionState<
    AccountSettingsState,
    FormData
  >(updateAccountSettingsAction, undefined);
  const [prefs, setPrefs] = useState(notificationPreferences);
  const [prefsPending, startPrefsTransition] = useTransition();
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const savePreferences = () => {
    setPrefsSaved(false);
    setPrefsError(null);
    startPrefsTransition(async () => {
      const result = await updateNotificationPreferencesAction(prefs);
      if (!result.success) {
        setPrefsError(result.error);
        return;
      }
      setPrefsSaved(true);
    });
  };

  return (
    <div className="w-full space-y-6 animate-entrance">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Account preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Account &amp; Organisation Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Manage your contact profile, business name and account credentials.
          </p>
        </div>
        <Link
          href="/portal/billing"
          className="btn btn-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Plan &amp; billing</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="bg-[var(--portal-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--portal-line)] shadow-xs space-y-5">
        {state?.success && (
          <div className="alert alert-success text-xs py-3 rounded-2xl text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        {state?.error && (
          <div className="alert alert-error text-xs py-3 rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="settings-name"
                className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] block mb-1"
              >
                Contact Name
              </label>
              <div className="relative">
                <input
                  id="settings-name"
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input input-bordered w-full pl-10 bg-[var(--portal-soft)] border-[var(--portal-line)] text-sm h-11 rounded-xl"
                />
                <User className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label
                htmlFor="settings-company"
                className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] block mb-1"
              >
                Company Name
              </label>
              <div className="relative">
                <input
                  id="settings-company"
                  type="text"
                  name="company"
                  value={company}
                  disabled={!isOwner}
                  onChange={(event) => setCompany(event.target.value)}
                  className="input input-bordered w-full pl-10 bg-[var(--portal-soft)] border-[var(--portal-line)] text-sm h-11 rounded-xl disabled:opacity-70"
                />
                <Building className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
              </div>
              {!isOwner && (
                <p className="text-[10px] text-[var(--portal-muted)] mt-1">
                  Only the account owner can change the company name.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="settings-email"
                className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] block mb-1"
              >
                Email Address
              </label>
              <input
                id="settings-email"
                type="email"
                value={initial.email}
                disabled
                className="input input-bordered w-full bg-[var(--portal-soft)] border-[var(--portal-line)] text-sm h-11 rounded-xl opacity-70"
              />
              <p className="text-[10px] text-[var(--portal-muted)] mt-1">
                Contact support to change your login email.
              </p>
            </div>

            <div>
              <label
                htmlFor="settings-phone"
                className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] block mb-1"
              >
                WhatsApp Phone Number
              </label>
              <div className="relative">
                <input
                  id="settings-phone"
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="input input-bordered w-full pl-10 bg-[var(--portal-soft)] border-[var(--portal-line)] text-sm h-11 rounded-xl"
                />
                <Phone className="w-4 h-4 text-[var(--portal-muted)] absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--portal-line-soft)]">
            <button
              type="submit"
              disabled={isPending}
              className="btn bg-[var(--portal-obsidian)] hover:bg-black text-white text-xs font-bold rounded-xl gap-2 shadow-md border-none px-6"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isPending ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--portal-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--portal-line)] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Notification preferences
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              In-app notifications are always on. Email, SMS and WhatsApp are
              simulated until provider adapters are connected.
            </p>
          </div>
        </div>

        {prefsError && (
          <div className="alert alert-error text-xs py-2.5 rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <span>{prefsError}</span>
          </div>
        )}
        {prefsSaved && (
          <div className="alert alert-success text-xs py-2.5 rounded-2xl text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span>Notification preferences saved.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: "inApp" as const,
              label: "In-app",
              desc: "Bell and notifications page",
              icon: <Bell className="w-4 h-4" />,
            },
            {
              key: "email" as const,
              label: "Email",
              desc: "Email notifications",
              icon: <Mail className="w-4 h-4" />,
            },
            {
              key: "sms" as const,
              label: "SMS",
              desc: "SMS alerts (delivery charged separately)",
              icon: <Smartphone className="w-4 h-4" />,
            },
            {
              key: "whatsapp" as const,
              label: "WhatsApp",
              desc: "WhatsApp alerts",
              icon: <MessageSquare className="w-4 h-4" />,
            },
          ].map((item) => (
            <label
              key={item.key}
              className="p-3 rounded-2xl border border-[var(--portal-line)] flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--portal-soft)] flex items-center justify-center text-[var(--portal-gold-ink)]">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)]">
                    {item.desc}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs[item.key]}
                onChange={(event) =>
                  setPrefs((current) => ({
                    ...current,
                    [item.key]: event.target.checked,
                  }))
                }
                className="toggle toggle-primary toggle-sm"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={savePreferences}
            disabled={prefsPending}
            className="btn bg-[var(--portal-obsidian)] hover:bg-black text-white text-xs font-bold rounded-xl gap-2 border-none px-6"
          >
            {prefsPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
