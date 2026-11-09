"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  User,
  Phone,
  Building2,
  Globe2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { completeWelcomeProfileAction } from "@/server/actions/onboarding";

export default function ProfileWelcomePage() {
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [notificationPref, setNotificationPref] = useState("both");
  const [state, formAction, isPending] = useActionState(
    completeWelcomeProfileAction,
    undefined
  );

  return (
    <div className="w-full space-y-6 pt-4 sm:pt-8 animate-entrance">
      <div className="text-center space-y-2">
        <span className="badge badge-primary badge-lg gap-1.5 font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Step 2 of 2: Business Profile
        </span>
        <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
          Welcome to Advers! 👋
        </h1>
        <p className="text-sm text-base-content/75 max-w-md mx-auto">
          Tell us about your business so we can set up your first profile and
          tailor your campaign workspace.
        </p>
      </div>

      <div className="bg-base-100/90 backdrop-blur-xl border border-base-200 rounded-3xl p-6 sm:p-8 shadow-3d space-y-5">
        {state?.error && (
          <div className="alert alert-error text-xs py-2.5 rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="welcome-name"
              className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1"
            >
              Your Full Name
            </label>
            <div className="relative">
              <input
                id="welcome-name"
                type="text"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Olumide Adebayo"
                className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
              />
              <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label
              htmlFor="welcome-phone"
              className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1"
            >
              WhatsApp Phone Number (For Project Updates)
            </label>
            <div className="relative">
              <input
                id="welcome-phone"
                type="tel"
                name="whatsappNumber"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+234 803 123 4567"
                className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
              />
              <Phone className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="welcome-company"
                className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1"
              >
                Company / Brand Name
              </label>
              <div className="relative">
                <input
                  id="welcome-company"
                  type="text"
                  name="companyName"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Adebayo Holdings"
                  className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
                />
                <Building2 className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label
                htmlFor="welcome-industry"
                className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1"
              >
                Industry
              </label>
              <div className="relative">
                <input
                  id="welcome-industry"
                  type="text"
                  name="industry"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Real Estate / E-commerce"
                  className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
                />
                <Globe2 className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-2">
              Preferred Channel for Milestone Approvals
            </span>
            <input
              type="hidden"
              name="notificationPref"
              value={notificationPref}
            />
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "email", label: "Email Only" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "both", label: "Both" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setNotificationPref(item.id)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    notificationPref === item.id
                      ? "bg-primary text-primary-content border-primary shadow-sm"
                      : "bg-base-200/50 border-base-300 text-base-content/80 hover:bg-base-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white w-full rounded-xl font-bold py-3 text-base shadow-md border-none flex items-center justify-center gap-2 mt-4"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving profile...</span>
              </>
            ) : (
              <>
                <span>Complete profile &amp; open dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-base-content/60">
          Need a different plan?{" "}
          <Link href="/portal/billing" className="font-bold text-primary hover:underline">
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  );
}
