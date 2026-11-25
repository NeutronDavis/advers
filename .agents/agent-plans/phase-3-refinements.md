# Phase 3 Refinements — Services, Portfolio & Engagement

**Date:** 2026-11-25
**Status:** Core refinement slice complete. Ranking/admin/anti-abuse scale items remain.

---

## 1. What shipped

### Structured services and packages
- `BoosterService` model: title, description, category, platform, price range, currency, delivery days, active, sort order.
- `BoosterPackage` model: name, description, price, currency, delivery days, revisions, includes, active.
- `PortfolioItem` model: title, description, optional `MediaAsset`, optional external URL, sort order.
- `BoosterEngagementRequest` model: request title, brief, budget, timeline, contact details, linked service/package/campaign, status, response.
- Migration `20261125190000_phase3_services_requests` applied after a fresh backup.
- `npm run backfill:marketplace-structured` migrated legacy JSON:
  - **12 services** created
  - **6 portfolio items** created

### Profile editing
- The Booster profile editor now syncs structured rows from the existing quick-entry textareas:
  - services: `Service | Amount | optional description`
  - packages: `Name | Price | Delivery days | Description`
  - portfolio: `Title | URL | Description`
- Legacy `ratesJson` and `portfolioJson` are kept in sync as fallbacks.
- Structured rows are replaced atomically inside the profile upsert transaction.

### Public profile
- Services render as structured cards with description, price and delivery time.
- Packages render in a dedicated section with price, delivery and revisions.
- Portfolio renders uploaded media when available, otherwise external links.
- **Request this Booster** opens a direct engagement dialog with optional service/package, brief, budget, timeline and contact details.

### Engagement flow
- Advertiser sends a request from the public profile.
- Request is validated server-side: Booster is active, service/package belongs to that Booster, advertiser account required, rate limited.
- Booster receives an in-app notification and sees the request in `/booster/requests`.
- Booster can **Accept** or **Decline** with an optional note.
- Advertiser sees the response in `/portal/booster-requests`.
- Added **Booster requests** to the advertiser sidebar and **Direct requests** to the Booster sidebar.
- Admins receive a notification for each new request.
- Accepted requests are ready to be converted into a paid `BoosterJob` in a later step.

---

## 2. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **87/87 passed** |
| `npm run build` | Passed |
| `npm run backfill:marketplace-structured` | 12 services, 6 portfolio items |
| `/portal/adboosters/chukwudi-eze` | 200, “Request this Booster” present |
| `/portal/booster-requests` | 200 |
| `/booster/requests` | 200 |
| `prisma migrate status` | Up to date |

---

## 3. Files added

- `src/lib/marketplace-structured.ts`
- `src/server/data/booster-engagement.ts`
- `src/server/actions/booster-engagement.ts`
- `src/app/(portal)/portal/adboosters/[handle]/EngagementRequestDialog.tsx`
- `src/app/(portal)/portal/booster-requests/page.tsx`
- `src/app/booster/requests/{page.tsx,BoosterRequestsClient.tsx}`
- `scripts/backfill-marketplace-structured.ts`
- Tests: `marketplace-structured.test.ts`
- Migration: `20261125190000_phase3_services_requests`

## 4. Files modified

- `prisma/schema.prisma`
- `src/server/data/booster.ts`
- `src/server/data/marketplace.ts`
- `src/server/actions/booster.ts`
- `src/app/booster/profile/edit/BoosterProfileForm.tsx`
- `src/app/(portal)/portal/adboosters/[handle]/page.tsx`
- `src/app/(portal)/PortalShell.tsx`, `src/app/booster/BoosterShell.tsx`
- `package.json`

---

## 5. Remaining Phase 3 work

1. **Portfolio media upload UI** — the model supports `MediaAsset`, but the editor still uses external URLs.
2. **Package includes editor** — `includesJson` exists but the form does not edit it as a list.
3. **Service category filtering** — filters still use profile categories; add a service-level category filter.
4. **Accepted request → BoosterJob conversion** — Generate a draft job from an accepted request with one click.
5. **Request read receipts** — add `VIEWED` transitions and unread badges.
6. **Ranking operations** — admin overrides, sponsored flag, ranking explanation panel.
7. **Anti-abuse signals** — recommendation eligibility, device/IP velocity, paid-manipulation detection.
8. **Moderation scale** — bulk actions, appeals, moderator assignment, content history.
9. **Pagination at scale** — move rank scoring into SQL beyond 120 candidates.

---

## 6. How to run

```bash
npm run db:migrate
npm run backfill:marketplace-structured
npm run typecheck
npm test
npm run build
npm run dev
```

Demo:
1. `client@advers.ng` → `/portal/adboosters/chukwudi-eze` → **Request this Booster**.
2. `booster@advers.ng` → `/booster/requests` → Accept or Decline.
3. `client@advers.ng` → `/portal/booster-requests` → see the response.
4. `booster@advers.ng` → `/booster/profile/edit` → edit services, packages and portfolio.

---

# Round 2 — Remaining Refinements (2026-11-25)

## Shipped

### Portfolio media
- `PortfolioMediaManager` on `/booster/profile/edit`:
  - upload an image or video through the Phase 5 media pipeline;
  - title and description;
  - thumbnail list with delete.
- `addPortfolioMediaItemAction` and `deletePortfolioItemAction`.
- Profile save now deletes only legacy `mediaAssetId = null` portfolio rows, preserving uploaded media.

### Packages
- Package quick-entry format extended to `Name | Price | Delivery days | Description | Includes`.
- `includesJson` is now populated from the structured editor and rendered on the public profile.

### Discovery
- Category filter now matches profiles whose structured services contain that category, in addition to `categoriesJson`.
- Search also matches service titles and package names.

### Engagement requests
- `viewedAt` and `VIEWED` status for read receipts.
- Booster requests page marks `REQUESTED` requests as viewed on open.
- Booster sidebar shows an unread request badge.
- Accepted request → `BoosterJob` conversion:
  - creates a draft job assigned to the Booster and linked to the advertiser client;
  - marks the request `CONVERTED`;
  - notifies the advertiser and links to the job.

### Ranking and moderation
- `rankingBoost` (clamped ±20), `sponsored`, and `rankingNote` on `BoosterProfile`.
- Ranking engine applies the manual boost after the quality score.
- Sponsored profiles display a visible **Sponsored** badge on marketplace cards and profiles.
- Admin `/admin/marketplace` adds a **Ranking** tab for boost and sponsored controls.
- Bulk approve/reject for comments and reviews.
- Anti-abuse: accounts younger than 24 hours need a completed job before recommending a Booster.

### Migration
- `20261125200000_phase3_refinement_final`:
  - `BoosterProfile.rankingBoost`, `sponsored`, `rankingNote`
  - `BoosterEngagementRequest.viewedAt`

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **88/88 passed** |
| `npm run build` | Passed |
| `prisma migrate status` | Up to date |
| `/admin/marketplace` | 200 with Ranking tab |
| `/booster/profile/edit` | 200 with portfolio media manager |
| `/booster/requests` | 200 with read-receipt marking |
| `/portal/booster-requests` | 200 |

## What still remains

1. **SQL-backed ranking/pagination** above 120 candidates.
2. **Moderation appeals/history** and moderator assignment.
3. **Service platform filter** (category-level filter is in place).
4. **Sponsorship billing** — the sponsored flag is operational, not monetised.
5. **Request notifications for VIEWED** — the advertiser sees the response, not a read receipt.
6. **Portfolio media ordering controls** — sort order is upload order.
