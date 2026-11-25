# Phase 3 — AdBooster Marketplace: Initial Slice

**Date:** 2026-11-25
**Status:** Initial end-to-end slice complete. Remaining Phase 3 refinements listed in §5.

---

## 1. What shipped

### Profile model
- `BoosterProfile` additions: `handle` (unique), `coverUrl`, `location`, `availabilityStatus`, `responseTimeHours`, `startingPrice`.
- Marketplace social models: `BoosterLike`, `BoosterComment`, `BoosterReview`, `BoosterRecommendation`, `MarketplaceReport`.
- `BoosterAvailability`, `MarketplaceReportTarget`, `MarketplaceReportStatus` enums.
- Migration `20261125160000_phase3_marketplace` applied after a fresh backup.

### Ranking engine
- `src/lib/marketplace-ranking.ts` implements the approved D-11 weights:
  - verified reviews 35, completed work 20, responsiveness 15, recommendations 10, rating 10, verification 5, recency 5.
  - report penalty: −15% per open report, capped at 5 reports.
  - component caps, deterministic ordering.
- 6 unit tests cover weights, caps, penalty, recency/responsiveness and ordering.

### Marketplace discovery
- `/portal/adboosters` replaced the hardcoded programme page with real data.
- Filters: search, service category, location, availability, min/max starting price, sort.
- Sorts: recommended (rank), highest rated, most completed, newest.
- Cards show cover, avatar, name/handle, verification badge, availability, rating, jobs, recommendations, starting price and categories.
- Server-rendered GET form, 12 per page.

### Public profile
- `/portal/adboosters/[handle]` with:
  - cover, avatar, verified badge, availability, location, response time;
  - bio, categories, skills, coverage;
  - services/pricing (from rates), portfolio links;
  - approved verified reviews, comments, recommendations;
  - like/recommend buttons, comment form, verified-review form;
  - report buttons on profile, reviews and comments.
- Verified review eligibility requires an `APPROVED`, `PAID` or `CLOSED` Booster job between the advertiser and the Booster.

### Social actions and anti-abuse
- `src/server/actions/marketplace.ts`:
  - toggle like (one per user/profile);
  - comment (2–1,000 chars, pending moderation, 10/hour);
  - toggle recommendation (one per user/profile, 10/hour);
  - verified review (one per user/profile, completed-job requirement, 5/day);
  - report profile/comment/review/recommendation (5/hour).
- Notifications to Booster and admins.
- Rate limits use the DB-backed limiter from Phase 2.

### Moderation
- `/admin/marketplace` with tabs for comments, reviews and reports.
- Actions: approve/reject comment, approve/reject review, resolve/dismiss report, remove content.
- Approving/rejecting a review recalculates `ratingAvg`/`ratingCount` using both approved profile reviews and approved job ratings.
- Audit logs for every moderation action.
- Added **Marketplace Moderation** to the admin sidebar.

### Profile editor
- Booster editor now supports handle, cover URL, location, availability, response time, starting price.
- Handle is auto-generated and made unique when left blank.
- Public profile link shown when a handle exists.

### Demo data
- `npm run seed:marketplace` backfills handles, covers, locations, availability, response times and starting prices for all seeded profiles.
- Seeds likes, recommendations, approved comments and verified reviews for demo profiles.
- Ran successfully for 8 Booster profiles.

---

## 2. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **76/76 passed** |
| `npm run build` | Passed (retried once after a transient TypeScript-Go crash) |
| `npm run seed:marketplace` | 8 profiles seeded |
| `/portal/adboosters` | 200, marketplace renders |
| `/portal/adboosters?category=CREATIVE&sort=rating` | 200, filters work |
| `/portal/adboosters/chukwudi-eze` | 200, public profile renders |
| `/admin/marketplace` | 200, moderation page renders |
| `prisma migrate status` | Up to date |

---

## 3. Files added

- `src/lib/marketplace.ts`, `src/lib/marketplace-ranking.ts`
- `src/server/data/marketplace.ts`, `src/server/data/marketplace-admin.ts`
- `src/server/actions/marketplace.ts`, `src/server/actions/marketplace-admin.ts`
- `src/app/(portal)/portal/adboosters/page.tsx` (replaced)
- `src/app/(portal)/portal/adboosters/[handle]/{page.tsx,ProfileInteractions.tsx,ReportButton.tsx}`
- `src/app/(admin)/admin/marketplace/{page.tsx,MarketplaceModerationClient.tsx}`
- `scripts/seed-marketplace.ts`
- Tests: `marketplace-ranking.test.ts`, `marketplace.test.ts`
- Migration: `20261125160000_phase3_marketplace`

## 4. Files modified

- `prisma/schema.prisma`
- `src/server/data/booster.ts`, `src/server/actions/booster.ts`
- `src/app/booster/profile/edit/BoosterProfileForm.tsx`
- `src/app/(admin)/AdminShell.tsx`
- `package.json`

---

## 5. Remaining Phase 3 work

1. **Structured services and packages** — services/pricing still come from `ratesJson`; add `BoosterService` and `BoosterPackage` tables for true filtering and packages.
2. **Portfolio records** — portfolio items still come from `portfolioJson`; add a `PortfolioItem` table when media uploads land in Phase 5.
3. **Profile completeness** — optional service packages, response SLA, availability calendar.
4. **Ranking operations** — admin overrides, sponsored flag, ranking explanation panel.
5. **Moderation scale** — bulk actions, appeals, moderator assignment, content history.
6. **Engagement flow** — the CTA currently links to Booster jobs; add direct booking/request flow.
7. **Anti-abuse** — device/IP signals, recommendation eligibility rules, paid-manipulation detection, duplicate review detection beyond unique constraints.
8. **Signed-out browsing** — deferred by D-12 (signed-in only in v1).
9. **Pagination at scale** — the current query evaluates up to 120 candidates in memory; move scoring to SQL or a materialized ranking table when the marketplace grows.

---

## 6. How to run

```bash
npm run db:migrate
npm run seed:marketplace
npm run typecheck
npm test
npm run build
npm run dev
```

Demo:
- Advertiser: `client@advers.ng` → `/portal/adboosters` → open a profile → like/recommend/comment.
- Review eligibility: use a client with a completed job for the selected Booster.
- Admin: `admin@advers.ng` → `/admin/marketplace`.
