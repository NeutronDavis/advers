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
  const [handle, setHandle] = useState(profile?.handle || "");
  const [businessName, setBusinessName] = useState(profile?.businessName || "");
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || "");
  const [coverUrl, setCoverUrl] = useState(profile?.coverUrl || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [availabilityStatus, setAvailabilityStatus] = useState(
    profile?.availabilityStatus || "AVAILABLE"
  );
  const [responseTimeHours, setResponseTimeHours] = useState(
    profile?.responseTimeHours != null ? String(profile.responseTimeHours) : ""
  );
  const [startingPrice, setStartingPrice] = useState(
    profile?.startingPrice != null ? String(profile.startingPrice) : ""
  );
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
    profile?.services.length
      ? profile.services
          .map(
            (service) =>
              `${service.title} | ${service.priceMin ? `₦${service.priceMin.toLocaleString("en-NG")}` : ""}${
                service.description ? ` | ${service.description}` : ""
              }`
          )
          .join("\n")
      : profile?.rates.map((rate) => `${rate.label} | ${rate.amount}`).join("\n") || ""
  );
  const [packages, setPackages] = useState(
    profile?.packages
      .map(
        (item) =>
          `${item.name} | ₦${item.price.toLocaleString("en-NG")} | ${
            item.deliveryDays ?? ""
          } | ${item.description ?? ""} | ${item.includes.join(", ")}`
      )
      .join("\n") || ""
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
        handle,
        businessName,
        logoUrl,
        coverUrl,
        location,
        availabilityStatus: availabilityStatus as "AVAILABLE" | "BUSY" | "UNAVAILABLE",
        responseTimeHours: responseTimeHours ? Number(responseTimeHours) : undefined,
        startingPrice: startingPrice ? Number(startingPrice) : undefined,
        bio,
        isBusiness,
        categories,
        skills,
        coverage,
        portfolio,
        rates,
        packages,
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

        <div className="pt-3 border-t border-base-200 space-y-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Marketplace presence
            </h2>
            <p className="text-[11px] text-base-content/60">
              These fields control how your profile appears in the AdBooster
              marketplace and filters.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="booster-handle" className="text-xs font-bold">
                Public handle
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-base-content/50">@</span>
                <input
                  id="booster-handle"
                  type="text"
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="ada-creates"
                  className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
                />
              </div>
              <p className="text-[10px] text-base-content/50">
                Leave blank to generate one from your display name.
              </p>
            </div>
            <div className="space-y-1">
              <label htmlFor="booster-location" className="text-xs font-bold">
                Primary location
              </label>
              <input
                id="booster-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Lagos, Nigeria"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="booster-cover" className="text-xs font-bold">
              Cover image URL
            </label>
            <input
              id="booster-cover"
              type="url"
              value={coverUrl}
              onChange={(event) => setCoverUrl(event.target.value)}
              placeholder="https://..."
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="booster-availability" className="text-xs font-bold">
                Availability
              </label>
              <select
                id="booster-availability"
                value={availabilityStatus}
                onChange={(event) => setAvailabilityStatus(event.target.value)}
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
              >
                <option value="AVAILABLE">Available now</option>
                <option value="BUSY">Limited availability</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="booster-response" className="text-xs font-bold">
                Response time (hours)
              </label>
              <input
                id="booster-response"
                type="number"
                min="1"
                max="720"
                value={responseTimeHours}
                onChange={(event) => setResponseTimeHours(event.target.value)}
                placeholder="e.g. 24"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="booster-starting" className="text-xs font-bold">
                Starting price (₦)
              </label>
              <input
                id="booster-starting"
                type="number"
                min="0"
                step="1000"
                value={startingPrice}
                onChange={(event) => setStartingPrice(event.target.value)}
                placeholder="e.g. 50000"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          {profile?.handle && (
            <Link
              href={`/portal/adboosters/${profile.handle}`}
              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              View public profile
              <span aria-hidden>↗</span>
            </Link>
          )}
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
              Services (one per line: Service | Amount | optional description)
            </label>
            <textarea
              id="booster-rates"
              rows={4}
              value={rates}
              onChange={(event) => setRates(event.target.value)}
              placeholder={"Logo design | ₦80,000 | Three concepts\nFlyer design | ₦25,000"}
              className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="booster-packages" className="text-xs font-bold">
            Packages (Name | Price | Delivery days | Description | Includes, comma separated)
          </label>
          <textarea
            id="booster-packages"
            rows={3}
            value={packages}
            onChange={(event) => setPackages(event.target.value)}
            placeholder={"Launch kit | ₦250,000 | 7 | Launch campaign | Two posters, 30s video, 3 revisions"}
            className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
          />
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
