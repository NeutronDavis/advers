import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  Edit3,
  ExternalLink,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  UserCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getBoosterProfileForUser } from "@/server/data/booster";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function verificationBadgeClass(status: string): string {
  switch (status) {
    case "VERIFIED":
      return "badge-success badge-soft";
    case "PENDING":
      return "badge-warning badge-soft";
    case "REJECTED":
      return "badge-error badge-soft";
    default:
      return "badge-ghost border border-base-300";
  }
}

export default async function BoosterProfilePage() {
  const user = await requireUser();
  const profile = await getBoosterProfileForUser(user.id);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My profile
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Set up your Booster profile to start applying for paid marketing work.
          </p>
        </div>
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold">No Booster profile yet</h2>
            <p className="text-xs text-base-content/60 mt-1 max-w-xl">
              Add your categories, coverage, portfolio and rates so advertisers
              and the Advers team can match you to the right jobs.
            </p>
          </div>
          <Link
            href="/booster/profile/edit"
            className="btn btn-primary rounded-xl font-bold gap-2 self-start"
          >
            <Edit3 className="w-4 h-4" />
            Create profile
          </Link>
        </div>
      </div>
    );
  }

  const verificationDetail =
    profile.verificationStatus === "VERIFIED"
      ? profile.verifiedAt
        ? `Verified ${formatDate(profile.verifiedAt)}${
            profile.verificationLevel
              ? ` at ${profile.verificationLevel} level`
              : ""
          }`
        : "Your profile is verified."
      : profile.verificationStatus === "PENDING"
        ? profile.verificationSubmittedAt
          ? `Submitted ${formatDate(profile.verificationSubmittedAt)}. Our team is reviewing your documents.`
          : "Your documents are under review."
        : profile.verificationStatus === "REJECTED"
          ? profile.verificationNotes ||
            "Your verification was not approved. Please update your documents and resubmit."
          : "Submit identity, business or portfolio documents to get verified.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My profile
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Your public Booster identity, capabilities, rates and verification status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/booster/verification"
            className="btn btn-ghost border border-base-300 rounded-xl font-bold gap-2 text-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            Verification
          </Link>
          <Link
            href="/booster/profile/edit"
            className="btn btn-primary rounded-xl font-bold gap-2 text-xs"
          >
            <Edit3 className="w-4 h-4" />
            Edit profile
          </Link>
        </div>
      </div>

      <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {profile.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={`${profile.displayName} profile picture`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border border-base-200 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-black shrink-0">
              {initials(profile.displayName)}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {profile.displayName}
              </h2>
              <span
                className={`badge badge-sm font-bold gap-1 ${verificationBadgeClass(
                  profile.verificationStatus
                )}`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                {profile.verificationLabel}
              </span>
              {profile.isBusiness && (
                <span className="badge badge-sm badge-outline font-bold">
                  Business
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/65">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.businessName || "Independent Booster"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Booster since {formatDate(profile.createdAt)}
              </span>
            </div>

            <p className="text-sm text-base-content/75 max-w-3xl">
              {profile.bio ||
                "Add a short bio so advertisers know what you do and the work you enjoy."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <Star className="w-4 h-4 fill-warning text-warning" />
                {profile.ratingAvg > 0
                  ? `${profile.ratingAvg.toFixed(1)} (${profile.ratingCount} ratings)`
                  : "No ratings yet"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <BadgeCheck className="w-4 h-4 text-success" />
                {profile.completedJobs} completed jobs
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.categories.length > 0 ? (
                profile.categories.map((category) => (
                  <span
                    key={category}
                    className="badge badge-sm bg-primary/10 border-none text-primary font-bold"
                  >
                    {category
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-base-content/50">
                  No categories selected yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">About</h2>
            </div>
            <p className="text-sm text-base-content/75 whitespace-pre-line">
              {profile.bio || "No bio added yet."}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">Skills</h2>
              </div>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-sm bg-base-200 border-none font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-base-content/50">No skills added yet.</p>
              )}
            </section>

            <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">Coverage</h2>
              </div>
              {profile.coverage.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.coverage.map((area) => (
                    <span
                      key={area}
                      className="badge badge-sm bg-base-200 border-none font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-base-content/50">
                  No service coverage added yet.
                </p>
              )}
            </section>
          </div>

          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">Portfolio</h2>
              </div>
              <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                {profile.portfolio.length} item
                {profile.portfolio.length === 1 ? "" : "s"}
              </span>
            </div>
            {profile.portfolio.length === 0 ? (
              <p className="text-xs text-base-content/50">
                Add past work so advertisers can see the quality of your delivery.
              </p>
            ) : (
              <div className="divide-y divide-base-200">
                {profile.portfolio.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{item.title}</div>
                      {item.description && (
                        <p className="text-xs text-base-content/60 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs rounded-lg font-bold gap-1 shrink-0"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Rates</h2>
            </div>
            {profile.rates.length === 0 ? (
              <p className="text-xs text-base-content/50">No rates added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.rates.map((rate, index) => (
                  <div
                    key={`${rate.label}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-base-200/50 border border-base-200"
                  >
                    <span className="text-xs font-medium text-base-content/70">
                      {rate.label}
                    </span>
                    <span className="text-sm font-black">{rate.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Verification</h2>
            </div>
            <span
              className={`badge badge-sm font-bold ${verificationBadgeClass(
                profile.verificationStatus
              )}`}
            >
              {profile.verificationLabel}
            </span>
            <p className="text-xs text-base-content/70">{verificationDetail}</p>

            {profile.verificationStatus === "PENDING" &&
              profile.verificationSubmittedNote && (
                <div className="p-2.5 rounded-xl bg-base-200/50 text-[11px] text-base-content/70">
                  <span className="font-bold">Your note: </span>
                  {profile.verificationSubmittedNote}
                </div>
              )}

            {profile.fraudRisk !== "LOW" && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-error">
                <ShieldAlert className="w-3.5 h-3.5" />
                Additional review required
              </div>
            )}

            <Link
              href="/booster/verification"
              className="btn btn-sm btn-ghost border border-base-300 rounded-xl font-bold w-full gap-1.5"
            >
              {profile.verificationStatus === "VERIFIED"
                ? "View verification"
                : profile.verificationStatus === "PENDING"
                  ? "View submission"
                  : "Submit verification"}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </section>

          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Availability</h2>
            </div>
            <p className="text-sm font-bold">
              {profile.availableHours || "Not set"}
            </p>
            <p className="text-[11px] text-base-content/55">
              Advertisers use this to plan delivery windows.
            </p>
          </section>

          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Account</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/45">
                  Name
                </div>
                <div className="font-medium">{user.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/45">
                  Email
                </div>
                <div className="font-medium break-all">{user.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/45">
                  Profile status
                </div>
                <div className="font-medium capitalize">
                  {profile.status.toLowerCase()}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
