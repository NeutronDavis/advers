"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Save,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { BOOSTER_CATEGORY_LABELS } from "@/lib/booster-status";
import { upsertBoosterProfileAction } from "@/server/actions/booster";
import type { BoosterProfileData } from "@/server/data/booster";

export default function BoosterProfileForm({
  userName,
  profile,
}: {
  userName: string;
  profile: BoosterProfileData | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.displayName || userName);
  const [businessName, setBusinessName] = useState(profile?.businessName || "");
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isBusiness, setIsBusiness] = useState(profile?.isBusiness || false);
  const [categories, setCategories] = useState<string[]>(profile?.categories || []);
  const [skills, setSkills] = useState(profile?.skills.join(", ") || "");
  const [coverage, setCoverage] = useState(profile?.coverage.join(", ") || "");
  const [portfolio, setPortfolio] = useState(
    profile?.portfolio
      .map(
        (item) =>
          `${item.title} | ${item.url}${item.description ? ` | ${item.description}` : ""}`
      )
      .join("\n") || ""
  );
  const [rates, setRates] = useState(
    profile?.rates.map((rate) => `${rate.label} | ${rate.amount}`).join("\n") || ""
  );
  const [availableHours, setAvailableHours] = useState(profile?.availableHours || "");
  const [paymentInfo, setPaymentInfo] = useState("");

  const toggleCategory = (category: string) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await upsertBoosterProfileAction({
        displayName,
        businessName,
        logoUrl,
        bio,
        isBusiness,
        categories,
        skills,
        coverage,
        portfolio,
        rates,
        availableHours,
        paymentInfo,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.push("/booster/profile");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <Link
            href="/booster/profile"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-base-content/60 hover:text-base-content mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to profile
          </Link>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile ? "Edit your Booster profile" : "Create your Booster profile"}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Show advertisers what you can do, where you work and how you price
            your services.
          </p>
        </div>
        {profile && (
          <span className="badge badge-lg badge-ghost border border-base-300 font-bold self-start sm:self-auto">
            {profile.verificationLabel}
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="alert alert-success text-xs rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>Booster profile saved.</span>
        </div>
      )}

      <form
        onSubmit={submit}
        className="card bg-base-100 border border-base-200 rounded-3xl p-6 shadow-3d space-y-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-base-200">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Identity &amp; profile</h2>
            <p className="text-[11px] text-base-content/60">
              This is what advertisers and Advers reviewers will see.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="booster-name" className="text-xs font-bold">
              Display name *
            </label>
            <input
              id="booster-name"
              type="text"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="booster-business" className="text-xs font-bold">
              Business name (optional)
            </label>
            <input
              id="booster-business"
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="booster-logo" className="text-xs font-bold">
              Logo / profile photo URL
            </label>
            <input
              id="booster-logo"
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://..."
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="booster-hours" className="text-xs font-bold">
              Available working hours
            </label>
            <input
              id="booster-hours"
              type="text"
              value={availableHours}
              onChange={(event) => setAvailableHours(event.target.value)}
              placeholder="e.g. Mon–Fri, 9am–6pm WAT"
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="booster-bio" className="text-xs font-bold">
            Bio / about you
          </label>
          <textarea
            id="booster-bio"
            rows={3}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Describe your skills, experience and the work you enjoy."
            className="textarea textarea-bordered w-full text-sm rounded-xl bg-base-200/50"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBusiness}
            onChange={(event) => setIsBusiness(event.target.checked)}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-xs font-bold">
            I am registering as a Booster business / agency
          </span>
        </label>

        <div className="pt-3 border-t border-base-200 space-y-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Booster categories *
            </h2>
            <p className="text-[11px] text-base-content/60">
              Select every category you can deliver work in.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(BOOSTER_CATEGORY_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  categories.includes(value)
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-base-200/40 border-base-300 text-base-content/70 hover:bg-base-200"
                }`}
              >
                {categories.includes(value) ? "✓ " : ""}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-base-200">
          <div className="space-y-1">
            <label htmlFor="booster-skills" className="text-xs font-bold">
              Skills (comma separated)
            </label>
            <input
              id="booster-skills"
              type="text"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="Graphic design, video editing, copywriting"
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="booster-coverage" className="text-xs font-bold">
              Service coverage (comma separated)
            </label>
            <input
              id="booster-coverage"
              type="text"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
              placeholder="Lagos, Port Harcourt, Abuja, Remote"
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="booster-portfolio" className="text-xs font-bold">
              Portfolio (one per line: Title | URL | Description)
            </label>
            <textarea
              id="booster-portfolio"
              rows={4}
              value={portfolio}
              onChange={(event) => setPortfolio(event.target.value)}
              placeholder={"Brand campaign | https://... | 3-week launch\nProduct photos | https://... | 40 edited images"}
              className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="booster-rates" className="text-xs font-bold">
              Rates (one per line: Service | Amount)
            </label>
            <textarea
              id="booster-rates"
              rows={4}
              value={rates}
              onChange={(event) => setRates(event.target.value)}
              placeholder={"Logo design | ₦80,000\nFlyer design | ₦25,000"}
              className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        <div className="space-y-1 pt-3 border-t border-base-200">
          <label htmlFor="booster-payment" className="text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            Payment details (private)
          </label>
          <textarea
            id="booster-payment"
            rows={2}
            value={paymentInfo}
            onChange={(event) => setPaymentInfo(event.target.value)}
            placeholder="Bank name, account name and account number. Only authorised Advers finance staff can see this."
            className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
          />
          <p className="text-[10px] text-base-content/50">
            Never share payment details publicly. This field is not shown on your
            marketplace profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-base-200">
          <p className="text-[11px] text-base-content/60">
            Identity, business and portfolio documents are handled on the{" "}
            <Link
              href="/booster/verification"
              className="font-bold text-primary hover:underline"
            >
              verification page
            </Link>
            .
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary rounded-xl font-bold gap-2 px-6"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isPending ? "Saving..." : "Save Booster profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
