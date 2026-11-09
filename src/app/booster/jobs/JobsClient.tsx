"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Compass,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  BOOSTER_JOB_CATEGORY_LABELS,
  BOOSTER_PAYMENT_MODEL_LABELS,
} from "@/lib/booster-status";
import { formatDate, formatNaira } from "@/lib/format";
import type { BoosterJobCard } from "@/server/data/booster";

export default function JobsClient({
  jobs,
  hasProfile,
  appliedJobIds,
}: {
  jobs: BoosterJobCard[];
  hasProfile: boolean;
  appliedJobIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [paymentModel, setPaymentModel] = useState("ALL");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const locations = Array.from(new Set(jobs.map((job) => job.location))).sort();

  const filtered = jobs.filter((job) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.requiredSkills.some((skill) => skill.toLowerCase().includes(query));
    const matchesCategory = category === "ALL" || job.category === category;
    const matchesLocation = location === "ALL" || job.location === location;
    const matchesPayment =
      paymentModel === "ALL" || job.paymentModel === paymentModel;
    const matchesRemote = !remoteOnly || job.isRemote;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesPayment &&
      matchesRemote
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find marketing work
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Browse creative, production, logistics, field, intelligence, sales and
            technical opportunities.
          </p>
        </div>
        <span className="badge badge-lg badge-primary badge-soft font-bold self-start sm:self-auto">
          {jobs.length} open jobs
        </span>
      </div>

      {!hasProfile && (
        <div className="alert alert-warning text-xs rounded-2xl">
          <ShieldCheck className="w-4 h-4" />
          <span>Create your Booster profile before applying for jobs.</span>
          <Link
            href="/booster/profile"
            className="btn btn-xs btn-primary rounded-lg font-bold ml-auto"
          >
            Create profile
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, skills or description..."
              className="input input-bordered w-full pl-10 bg-base-200/50 text-xs h-10 rounded-xl"
            />
            <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3" />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All categories</option>
            {Object.entries(BOOSTER_JOB_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={paymentModel}
            onChange={(event) => setPaymentModel(event.target.value)}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All payment models</option>
            {Object.entries(BOOSTER_PAYMENT_MODEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-base-content/50" />
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="select select-bordered select-sm bg-base-200/50 text-[11px] h-8 min-h-0 rounded-lg"
            >
              <option value="ALL">All locations</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-base-content/70">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(event) => setRemoteOnly(event.target.checked)}
              className="checkbox checkbox-primary checkbox-xs"
            />
            Remote only
          </label>
          <span className="text-[11px] text-base-content/50">
            {filtered.length} matching jobs
          </span>
        </div>
      </div>

      {/* Jobs */}
      {filtered.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center space-y-3">
          <Compass className="w-8 h-8 text-base-content/30 mx-auto" />
          <h2 className="text-base font-bold">No matching opportunities</h2>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try a different category, location or payment model.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const applied = appliedJobIds.includes(job.id);
            return (
              <Link
                key={job.id}
                href={`/booster/jobs/${job.id}`}
                className="card bg-base-100 border border-base-200 hover:border-primary/40 rounded-3xl p-5 shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-xs badge-primary badge-soft font-bold">
                        {job.categoryLabel}
                      </span>
                      <span className={`badge badge-xs font-bold ${job.statusBadgeClass}`}>
                        {job.statusLabel}
                      </span>
                      {applied && (
                        <span className="badge badge-xs badge-success badge-soft font-bold">
                          Applied
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-black mt-1.5">{job.title}</h2>
                    <div className="text-[10px] text-base-content/50 font-mono">
                      {job.jobNumber}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono">
                      {formatNaira(job.budget)}
                    </div>
                    <div className="text-[9px] text-base-content/50">
                      {job.paymentModelLabel}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-base-content/70 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-base-content/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.isRemote ? "Remote" : job.location}
                  </span>
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {formatDate(job.deadline)}
                    </span>
                  )}
                  {job.clientName && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.clientName}
                    </span>
                  )}
                </div>

                {job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="badge badge-xs bg-base-200 border-none font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-base-200">
                  <span className="text-[10px] text-base-content/50">
                    {job.proofRequirements.length} proof requirement
                    {job.proofRequirements.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    View &amp; apply
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
