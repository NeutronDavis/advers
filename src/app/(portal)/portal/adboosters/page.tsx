import React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  MapPin,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSession } from "@/lib/session";
import {
  availabilityBadgeClass,
  AVAILABILITY_LABELS,
  displayHandle,
} from "@/lib/marketplace";
import { BOOSTER_CATEGORY_LABELS } from "@/lib/booster-status";
import { formatNaira } from "@/lib/format";
import {
  getMarketplaceCards,
  type MarketplaceSort,
} from "@/server/data/marketplace";

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function pageHref(
  base: Record<string, string>,
  page: number
): string {
  const params = new URLSearchParams(base);
  params.set("page", String(page));
  return `/portal/adboosters?${params.toString()}`;
}

export default async function AdBoostersMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const session = await getSession();
  const params = await searchParams;

  const q = first(params.q).trim();
  const category = first(params.category);
  const location = first(params.location).trim();
  const availability = first(params.availability);
  const minPriceRaw = first(params.minPrice);
  const maxPriceRaw = first(params.maxPrice);
  const sortRaw = first(params.sort);
  const sort: MarketplaceSort =
    sortRaw === "rating" || sortRaw === "newest" || sortRaw === "completed"
      ? sortRaw
      : "recommended";
  const page = Math.max(1, Number(first(params.page)) || 1);

  const result = await getMarketplaceCards(
    {
      q: q || undefined,
      category: category || undefined,
      location: location || undefined,
      availability:
        availability === "AVAILABLE" ||
        availability === "BUSY" ||
        availability === "UNAVAILABLE"
          ? availability
          : undefined,
      minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      sort,
      page,
    },
    session?.id
  );

  const baseParams: Record<string, string> = {};
  if (q) baseParams.q = q;
  if (category) baseParams.category = category;
  if (location) baseParams.location = location;
  if (availability) baseParams.availability = availability;
  if (minPriceRaw) baseParams.minPrice = minPriceRaw;
  if (maxPriceRaw) baseParams.maxPrice = maxPriceRaw;
  if (sort !== "recommended") baseParams.sort = sort;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--portal-line)] pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Professional service marketplace
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-ink)] sm:text-3xl">
            AdBoosters
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-[var(--portal-muted)] sm:text-sm">
            Discover verified marketing and advertising specialists. Compare
            services, portfolios, pricing and performance before you engage.
          </p>
        </div>
        <div className="badge badge-outline badge-lg border-[var(--portal-line)] font-bold">
          {result.total} provider{result.total === 1 ? "" : "s"}
        </div>
      </div>

      <form
        method="get"
        className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-4 shadow-xs"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="form-control xl:col-span-2">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Search
            </span>
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Name, skill, service or location"
                className="input input-bordered w-full pl-9 text-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--portal-muted)]" />
            </div>
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Service
            </span>
            <select name="category" defaultValue={category} className="select select-bordered text-sm">
              <option value="">All services</option>
              {Object.entries(BOOSTER_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Location
            </span>
            <input
              name="location"
              defaultValue={location}
              placeholder="Lagos, Abuja, Remote"
              className="input input-bordered text-sm"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Availability
            </span>
            <select name="availability" defaultValue={availability} className="select select-bordered text-sm">
              <option value="">Any</option>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Sort
            </span>
            <select name="sort" defaultValue={sort} className="select select-bordered text-sm">
              <option value="recommended">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="completed">Most completed</option>
              <option value="newest">Newest</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Min price (₦)
            </span>
            <input
              name="minPrice"
              type="number"
              min="0"
              defaultValue={minPriceRaw}
              placeholder="0"
              className="input input-bordered text-sm"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-[11px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
              Max price (₦)
            </span>
            <input
              name="maxPrice"
              type="number"
              min="0"
              defaultValue={maxPriceRaw}
              placeholder="Any"
              className="input input-bordered text-sm"
            />
          </label>

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
            <button type="submit" className="btn btn-primary btn-sm rounded-xl">
              Apply filters
            </button>
            <Link href="/portal/adboosters" className="btn btn-ghost btn-sm rounded-xl">
              Reset
            </Link>
          </div>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="card border border-dashed border-[var(--portal-line)] bg-[var(--portal-surface)] p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[var(--portal-gold-ink)]" />
          <h2 className="mt-3 text-base font-bold text-[var(--portal-ink)]">
            No AdBoosters match those filters
          </h2>
          <p className="mt-1 text-xs text-[var(--portal-muted)]">
            Try a broader service, location or price range.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((booster) => {
            const href = `/portal/adboosters/${displayHandle(booster.handle, booster.id)}`;
            return (
              <Link
                key={booster.id}
                href={href}
                className="card group overflow-hidden border border-[var(--portal-line)] bg-[var(--portal-surface)] shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-24 bg-[var(--portal-obsidian)]">
                  {booster.coverUrl ? (
                    <img
                      src={booster.coverUrl}
                      alt=""
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[var(--portal-obsidian)] to-[var(--portal-obsidian-3)]" />
                  )}
                  <span
                    className={`absolute right-3 top-3 ${availabilityBadgeClass(
                      booster.availabilityStatus
                    )}`}
                  >
                    {AVAILABILITY_LABELS[booster.availabilityStatus] ??
                      booster.availabilityStatus}
                  </span>
                </div>

                <div className="relative px-5 pb-5">
                  <div className="-mt-8 flex items-end justify-between gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--portal-surface)] bg-[var(--portal-gold-soft)] text-lg font-black text-[var(--portal-gold-ink)]">
                      {booster.logoUrl ? (
                        <img
                          src={booster.logoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(booster.displayName)
                      )}
                    </div>
                    <div className="mb-1 flex items-center gap-1 text-xs font-bold text-[var(--portal-ink)]">
                      <Star className="h-3.5 w-3.5 fill-[var(--portal-gold)] text-[var(--portal-gold)]" />
                      {booster.ratingAvg > 0 ? booster.ratingAvg.toFixed(1) : "New"}
                      <span className="font-normal text-[var(--portal-muted)]">
                        ({booster.ratingCount})
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-1.5">
                    <h2 className="text-base font-extrabold text-[var(--portal-ink)]">
                      {booster.displayName}
                    </h2>
                    {booster.verificationStatus === "VERIFIED" && (
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--portal-success)]" />
                    )}
                    {booster.sponsored && (
                      <span className="badge badge-warning badge-sm font-bold">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--portal-muted)]">
                    @{displayHandle(booster.handle, booster.id)}
                    {booster.businessName ? ` · ${booster.businessName}` : ""}
                  </div>

                  <p className="mt-2 line-clamp-2 min-h-8 text-xs text-[var(--portal-body)]">
                    {booster.bio || "Professional advertising and marketing services."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {booster.categories.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="badge badge-sm border-[var(--portal-line)] bg-[var(--portal-soft)] text-[10px] font-bold text-[var(--portal-body)]"
                      >
                        {BOOSTER_CATEGORY_LABELS[item] ?? item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--portal-line-soft)] pt-3 text-[10px] text-[var(--portal-muted)]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booster.location || booster.coverage[0] || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {booster.completedJobs} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {booster.recommendationCount}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs font-black text-[var(--portal-ink)]">
                      {booster.startingPrice
                        ? `From ${formatNaira(booster.startingPrice)}`
                        : "Request quote"}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--portal-gold-ink)]">
                      <Users className="h-3 w-3" />
                      View profile
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={pageHref(baseParams, Math.max(1, result.page - 1))}
            className={`btn btn-sm ${result.page <= 1 ? "btn-disabled" : "btn-ghost"}`}
            aria-disabled={result.page <= 1}
          >
            Previous
          </Link>
          <span className="text-xs text-[var(--portal-muted)]">
            Page {result.page} of {result.totalPages}
          </span>
          <Link
            href={pageHref(baseParams, Math.min(result.totalPages, result.page + 1))}
            className={`btn btn-sm ${
              result.page >= result.totalPages ? "btn-disabled" : "btn-ghost"
            }`}
            aria-disabled={result.page >= result.totalPages}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
