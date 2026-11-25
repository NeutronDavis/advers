import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Star,
  ThumbsUp,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { BOOSTER_CATEGORY_LABELS } from "@/lib/booster-status";
import {
  availabilityBadgeClass,
  AVAILABILITY_LABELS,
  displayHandle,
} from "@/lib/marketplace";
import { formatDate, formatNaira } from "@/lib/format";
import { getMarketplaceProfile } from "@/server/data/marketplace";
import ProfileInteractions from "./ProfileInteractions";
import ReportButton from "./ReportButton";
import EngagementRequestDialog from "./EngagementRequestDialog";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-3.5 w-3.5 ${
            value <= score
              ? "fill-[var(--portal-gold)] text-[var(--portal-gold)]"
              : "text-[var(--portal-line)]"
          }`}
        />
      ))}
    </span>
  );
}

export default async function MarketplaceProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  await requireUser();
  const session = await getSession();
  const { handle } = await params;
  const profile = await getMarketplaceProfile(
    decodeURIComponent(handle),
    session?.id,
    session?.clientId
  );
  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/portal/adboosters"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to marketplace
      </Link>

      <section className="overflow-hidden rounded-3xl border border-[var(--portal-line)] bg-[var(--portal-surface)] shadow-xs">
        <div className="relative h-40 bg-[var(--portal-obsidian)] sm:h-52">
          {profile.coverUrl ? (
            <img src={profile.coverUrl} alt="" className="h-full w-full object-cover opacity-80" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--portal-obsidian)] via-[var(--portal-obsidian-2)] to-[var(--portal-obsidian-3)]" />
          )}
          <span
            className={`absolute right-4 top-4 ${availabilityBadgeClass(
              profile.availabilityStatus
            )}`}
          >
            {AVAILABILITY_LABELS[profile.availabilityStatus] ??
              profile.availabilityStatus}
          </span>
        </div>

        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-[var(--portal-surface)] bg-[var(--portal-gold-soft)] text-2xl font-black text-[var(--portal-gold-ink)] sm:h-28 sm:w-28">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(profile.displayName)
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-ink)] sm:text-3xl">
                    {profile.displayName}
                  </h1>
                  {profile.verificationStatus === "VERIFIED" && (
                    <span className="badge badge-success badge-sm gap-1 font-bold">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                  {profile.sponsored && (
                    <span className="badge badge-warning badge-sm font-bold">
                      Sponsored
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--portal-muted)]">
                  @{displayHandle(profile.handle, profile.id)}
                  {profile.businessName ? ` · ${profile.businessName}` : ""}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!profile.viewer.isOwner && (
                <EngagementRequestDialog
                  boosterId={profile.id}
                  boosterName={profile.displayName}
                  services={profile.services.map((service) => ({
                    id: service.id,
                    title: service.title,
                    priceMin: service.priceMin,
                  }))}
                  packages={profile.packages.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                  }))}
                />
              )}
              <Link
                href="/portal/booster-jobs"
                className="btn btn-ghost btn-sm rounded-xl border border-[var(--portal-line)]"
              >
                <Briefcase className="h-4 w-4" />
                Post a Booster job
              </Link>
              <ReportButton
                boosterId={profile.id}
                targetType="PROFILE"
                targetId={profile.id}
                label="Report profile"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[var(--portal-soft)] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                Rating
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Stars score={Math.round(profile.ratingAvg)} />
                <span className="text-sm font-black text-[var(--portal-ink)]">
                  {profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "New"}
                </span>
                <span className="text-[10px] text-[var(--portal-muted)]">
                  ({profile.ratingCount})
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--portal-soft)] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                Completed work
              </div>
              <div className="mt-1 text-sm font-black text-[var(--portal-ink)]">
                {profile.completedJobs} jobs
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--portal-soft)] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                Recommendations
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm font-black text-[var(--portal-ink)]">
                <ThumbsUp className="h-3.5 w-3.5 text-[var(--portal-gold-ink)]" />
                {profile.recommendationCount}
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--portal-soft)] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                Response time
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm font-black text-[var(--portal-ink)]">
                <Clock className="h-3.5 w-3.5 text-[var(--portal-gold-ink)]" />
                {profile.responseTimeHours != null
                  ? `~${profile.responseTimeHours}h`
                  : "Not stated"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-[var(--portal-muted)]">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            )}
            {profile.availableHours && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {profile.availableHours}
              </span>
            )}
            {profile.verifiedAt && (
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified {formatDate(profile.verifiedAt)}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-[var(--portal-body)]">
              {profile.bio || "This Booster has not added a biography yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.categories.map((item) => (
                <span
                  key={item}
                  className="badge badge-sm border-[var(--portal-line)] bg-[var(--portal-soft)] font-bold text-[var(--portal-body)]"
                >
                  {BOOSTER_CATEGORY_LABELS[item] ?? item}
                </span>
              ))}
            </div>

            {profile.skills.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                  Skills
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="badge badge-ghost badge-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.coverage.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--portal-muted)]">
                  Coverage
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.coverage.map((area) => (
                    <span key={area} className="badge badge-outline badge-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--portal-ink)]">
                Services &amp; pricing
              </h2>
              {profile.startingPrice && (
                <span className="text-xs font-bold text-[var(--portal-gold-ink)]">
                  From {formatNaira(profile.startingPrice)}
                </span>
              )}
            </div>
            {profile.services.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--portal-muted)]">
                Request a custom quote from this Booster.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-[var(--portal-line-soft)]">
                {profile.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-[var(--portal-ink)]">
                        {service.title}
                      </div>
                      {service.description && (
                        <p className="mt-0.5 text-[11px] text-[var(--portal-muted)]">
                          {service.description}
                        </p>
                      )}
                      {service.deliveryDays && (
                        <div className="mt-1 text-[10px] text-[var(--portal-muted)]">
                          Delivery: ~{service.deliveryDays} days
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-black text-[var(--portal-body)]">
                      {service.priceMin ? `From ${formatNaira(service.priceMin)}` : "Quote"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {profile.packages.length > 0 && (
            <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
              <h2 className="text-base font-bold text-[var(--portal-ink)]">
                Packages
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.packages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--portal-line)] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-bold text-[var(--portal-ink)]">
                        {item.name}
                      </div>
                      <div className="text-xs font-black text-[var(--portal-gold-ink)]">
                        {formatNaira(item.price)}
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--portal-muted)]">
                      {item.deliveryDays && <span>~{item.deliveryDays} days</span>}
                      {item.revisions && <span>{item.revisions} revisions</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">Portfolio</h2>
            {profile.portfolioItems.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--portal-muted)]">
                No portfolio items yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.portfolioItems.map((item) => {
                  const href = item.externalUrl ?? item.mediaUrl ?? undefined;
                  return (
                    <a
                      key={item.id}
                      href={href}
                      target={item.externalUrl ? "_blank" : undefined}
                      rel={item.externalUrl ? "noreferrer" : undefined}
                      className="group overflow-hidden rounded-2xl border border-[var(--portal-line)] transition hover:border-[var(--portal-gold-border)] hover:bg-[var(--portal-soft)]"
                    >
                      {item.mediaUrl && (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="h-36 w-full object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-bold text-[var(--portal-ink)]">
                            {item.title}
                          </div>
                          {item.externalUrl && (
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--portal-muted)]" />
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--portal-ink)]">
                Verified reviews
              </h2>
              <span className="text-[11px] text-[var(--portal-muted)]">
                {profile.approvedReviewCount} approved
              </span>
            </div>
            {profile.reviews.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--portal-muted)]">
                No approved reviews yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-[var(--portal-line)] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--portal-ink)]">
                          {review.reviewerName}
                          {review.verified && (
                            <span className="badge badge-success badge-xs">Verified</span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Stars score={review.score} />
                          <span className="text-[10px] text-[var(--portal-muted)]">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <ReportButton
                        boosterId={profile.id}
                        targetType="REVIEW"
                        targetId={review.id}
                        label="Report review"
                      />
                    </div>
                    {review.body && (
                      <p className="mt-2 text-xs text-[var(--portal-body)]">{review.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">Comments</h2>
            {profile.comments.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--portal-muted)]">
                No comments yet. Start the conversation.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {profile.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-[var(--portal-line)] p-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--portal-ink)]">
                        {comment.userName}
                        <span className="ml-2 text-[10px] font-normal text-[var(--portal-muted)]">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--portal-body)]">{comment.body}</p>
                    </div>
                    <ReportButton
                      boosterId={profile.id}
                      targetType="COMMENT"
                      targetId={comment.id}
                      label="Report comment"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[var(--portal-ink)]">Work with this Booster</h2>
            <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
              Likes show interest. Recommendations feed marketplace ranking. Verified
              reviews come from completed Booster jobs.
            </p>
            <div className="mt-3">
              <ProfileInteractions
                boosterId={profile.id}
                likeCount={profile.likeCount}
                recommendationCount={profile.recommendationCount}
                initialLiked={profile.viewer.isLiked}
                initialRecommended={profile.viewer.isRecommended}
                canReview={profile.viewer.canReview}
                isOwner={profile.viewer.isOwner}
                myReview={
                  profile.viewer.myReview
                    ? {
                        score: profile.viewer.myReview.score,
                        moderationState: profile.viewer.myReview.moderationState,
                        verified: profile.viewer.myReview.verified,
                      }
                    : null
                }
              />
            </div>
          </section>

          <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[var(--portal-ink)]">
              Recommendations
            </h2>
            {profile.recommendations.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--portal-muted)]">
                No recommendations yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {profile.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="rounded-xl bg-[var(--portal-soft)] p-3">
                    <div className="text-xs font-bold text-[var(--portal-ink)]">
                      {recommendation.userName}
                    </div>
                    {recommendation.note && (
                      <p className="mt-1 text-[11px] text-[var(--portal-muted)]">
                        {recommendation.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {profile.viewer.isOwner && (
            <div className="alert alert-info text-xs">
              <Sparkles className="h-4 w-4" />
              <span>
                This is your public profile.{" "}
                <Link href="/booster/profile/edit" className="link font-bold">
                  Edit it
                </Link>
                .
              </span>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
