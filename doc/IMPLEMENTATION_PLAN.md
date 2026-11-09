# ADVERS — Implementation Plan

**Source of truth:** `doc/ADVERS_Product_and_Engineering_Build_Specification.md`
**Stack:** Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, Prisma 6 + MySQL, Tailwind CSS 4, daisyUI 5 (custom `light` / `dark` themes).
**Purpose of this document:** Record what is already built, what is mocked or missing against the specification, and the phased plan to make the platform production-correct.

---

## 1. Executive summary

The repository currently contains a strong **marketing website**, a **visual portal shell**, and a **visual admin shell**. Most portal and several admin screens are still demo/mock UIs backed by hardcoded arrays or React context. The database schema covers the older “agency services” model and part of the advertising model, but it does **not** cover the core commercial model in the specification: subscription plans/entitlements, business profiles, Booster profiles/jobs/applications, deliverables, ledgers/commissions, notifications, ratings or disputes.

The biggest correctness gaps are:

1. **Authentication is not real.** Login/signup only call `setTimeout` and navigate. `getAuthSession()` always returns the first `ADMIN` user. There is no cookie/session, no `proxy.ts`, and no authorization on most routes.
2. **Portal data is in-memory.** Campaigns live in `CampaignContext` and reset on refresh. The `/api/campaigns` route exists but is unused and is not scoped to the signed-in user.
3. **No subscription model or entitlement enforcement.** Plan limits (profiles/workspaces) are not represented or enforced.
4. **No Booster marketplace domain.** The existing `AdBooster` model only represents referral promoters, not the seven Booster categories, jobs, applications, teams or proof.
5. **Admin dashboard is static.** `src/lib/kpi.ts` exists but `/admin` does not use it. Several admin modules (moderation, inventory, PoP, AdBoosters, finance) are static.
6. **Design drift.** Portal pages use hardcoded Obsidian/Gold hex values and ignore the daisyUI light/dark themes; admin pages use daisyUI semantic tokens. Dark mode is effectively broken in the portal.

---

## 2. Current-state audit

### 2.1 What is already done

| Area | Status | Notes |
|---|---|---|
| Marketing site (`/`, `/about`, `/contact`, `/visibility-journey`) | Built | Componentised, animated, responsive. |
| Auth screens (`/login`, `/signup`, `/accept-invite`) | UI only | Zod validation, no real auth. Demo shortcuts navigate directly. |
| Portal shell | Built | Obsidian sidebar, mobile dock, top bar, campaign modal, toast. |
| Portal dashboard / campaigns / explore / influencers / AdBoosters / wallet / support / settings | UI/mock | Hardcoded arrays and local state. |
| Portal projects | Partly real | Reads `Engagement`/`Renewal` from Prisma. |
| Admin shell + inbox + users list/detail | Built | Inbox and users are DB-backed; `requireStaff()` used. |
| Admin cockpit, moderation, inventory, PoP, AdBoosters, finance | UI/mock | Static arrays. |
| Prisma schema | Partial | Legacy agency models + `Campaign`, `MediaInventory`, `ProofOfPerformance`, `AdBooster`, `BoosterLink`, `MediaSettlement`, `Wallet`, `WalletTransaction`. |
| Seed | Partial | Clients, users, wallet, inventory, campaigns, PoP, boosters, settlements. No leads/quotes/invoices/renewals/engagements/feedback/subscriptions/jobs. |
| KPI helpers | Built but unused | `src/lib/kpi.ts` has cards/charts/attention/activity/users. |
| Charts | Built but unused | `src/app/(admin)/admin/AdminCharts.tsx` uses Recharts. |
| Theme | Built | daisyUI 5 custom `light` and `dark`, Plus Jakarta Sans. |

### 2.2 What is missing or incorrect against the spec

| Spec area | Gap |
|---|---|
| §3 Roles & permissions | Only `CLIENT`/`STAFF`/`ADMIN`. No Booster roles, team manager, finance scope, or campaign/job-level permissions. |
| §4 Marketing Access Plans | No `Plan`, `Subscription`, `Entitlement`, billing period, renewal or payment state. No limit enforcement. |
| §4.1–4.3 plan features | No feature gating (bulk SMS, saved partners, comparisons, team seats, reporting). |
| §5 Advertiser journey | Campaign creation is a 6-field modal; no objective/audience/locations/channels/dates/assets/contact capture. No quote/booking/payment. |
| §5.5 statuses | `CampaignStatus` uses `PENDING_REVIEW/APPROVED/SCHEDULED/...`; spec requires Draft → Submitted → Under review → Quote required → Awaiting payment → Confirmed → In progress → Completed (+ exceptions). |
| §5.6 itemised quote | No quote/booking entity or separated media/service/production/logistics/SMS/tax lines. |
| §6 Booster ecosystem | No seven-category Booster profile, no special opportunities, no service coverage/portfolio/rates. |
| §7 Marketplace | No job listings, search, filters or application flow. |
| §8 Teams | No Booster teams, work packages, dependencies or team manager. |
| §9 Payments/earnings | Wallet exists for advertisers only; no Booster ledger, commissions, withdrawal review or escrow workflow. |
| §10 Trust | No verification workflow, ratings tied to completed work, proof review decisions, disputes or fraud controls. |
| §11 Admin console | Missing subscriptions, campaigns review bound to real status, booster jobs/applications/verification, deliverables, payments/withdrawals, disputes, audit log UI. |
| §12 Data model | Missing `BusinessProfile`, `Subscription`, `Plan`, `BoosterProfile`, `BoosterJob`, `Application`, `Assignment`, `BoosterTeam`, `Deliverable`, `PaymentLedger`, `Commission`, `Rating`, `Dispute`, `Notification`. `AuditLog` exists but is unused. |
| §13 Status flows | Not enforced server-side. |
| §14 Notifications | No `Notification` model or UI. Bell button shows a toast. |
| §15 Reporting | No real reporting; dashboard KPIs are static. |
| §16 Non-functional | No server-side authorization, idempotency, indexes for new queries, tests, observability. |
| §18 Acceptance criteria | Only “browse channels” and “admin users/inbox” are partly met. |

### 2.3 Concrete defects to fix early

1. `src/lib/auth.ts` — `getAuthSession()` is a placeholder; must read a signed cookie.
2. `src/app/(auth)/login/page.tsx` and `signup/page.tsx` — no server action, no password check, no session cookie.
3. `src/app/(admin)/admin/page.tsx` — does not call `requireAdmin()/requireStaff()`; uses static KPIs.
4. Admin sidebar lacks the **Inbox** link even though `/admin/inbox` exists.
5. `src/app/api/campaigns/route.ts` — selects the first `CLIENT` user instead of the session user; no auth/ownership check.
6. `src/context/CampaignContext.tsx` — demo data is the source of truth for portal pages.
7. `src/lib/kpi.ts` — uses `(prisma as any)` fallbacks and a bug in the users pagination link (`status=${search}`); remove `as any` once the schema is stable.
8. `src/app/(admin)/admin/users/page.tsx` — “Next” link passes `status=${search}`.
9. `AdminCharts.tsx` — uses raw Tailwind palette (`indigo`, `emerald`, `amber`) instead of daisyUI semantic tokens.
10. Portal pages — hardcoded `#f5f6f8`, `#101113`, `#e8b64b`, `#e8e9ed`; no dark-mode support.
11. `CampaignCreateModal` — `openCreateModal("Influencer: Name")` produces a channel string that cannot be mapped.
12. Seed — no data for leads/quotes/invoices/renewals/engagements/feedback, so the KPI helpers return zeros or demo placeholders.

---

## 3. Target architecture

### 3.1 Next.js 16 conventions (read from `node_modules/next/dist/docs`)

- **`proxy.ts`** at `src/proxy.ts` replaces `middleware.ts` in Next 16. Use it only for optimistic redirects (unauthenticated → `/login`, role landing). **Do not** use it as the authorization boundary.
- **Server Actions** (`"use server"`) for all mutations: signup, login, logout, profile, campaign, quote, job, proof, admin decisions.
- **Data Access Layer (DAL)** in `src/lib/dal/` or `src/server/` that performs authorization and returns minimal DTOs. Every action and every server component must authorize.
- **Server Components by default**; client components only for interactivity (modals, filters, charts, forms with `useActionState`).
- `cookies()` is async; `searchParams`/`params` are promises (already used in the users page).
- Use `revalidatePath`/`revalidateTag` after mutations; use `Suspense` + skeleton for heavy sections.

### 3.2 Auth & RBAC

- Add `jose` for signed, HttpOnly, SameSite=Lax session cookies (or a small HMAC helper with Node `crypto` if no new dependency is allowed).
- `src/lib/session.ts`:
  - `createSession(user)`, `destroySession()`, `getSession()` (cached with `react.cache`).
- `src/lib/auth.ts`:
  - `requireUser()`, `requireAdmin()`, `requireStaff()`, `requireClient()`, `requireBooster()`, `requireFinance()`.
  - `assertCampaignAccess(user, campaignId)`, `assertJobAccess(user, jobId)`.
- `src/proxy.ts`:
  - Redirect unauthenticated `/portal/*` and `/admin/*` to `/login`.
  - Redirect authenticated users away from `/login`/`signup`.
  - Keep role landing logic (`ADMIN/STAFF → /admin`, `CLIENT → /portal/dashboard`, `BOOSTER → /booster/dashboard`).
- Password hashing with `bcryptjs` (already installed); Zod validation on every action.
- Audit: write `AuditLog` for admin actions and `ActivityLog` for user actions.

### 3.3 Data access & mutations

- Move portal reads from `CampaignContext` to server components + DAL.
- Keep `CampaignContext` only for UI state (modal open, toast), not data.
- Add `src/server/actions/*.ts` grouped by domain: `auth`, `business-profile`, `subscription`, `campaign`, `quote`, `booster`, `job`, `proof`, `payment`, `admin`.
- Use `zod` schemas in `src/lib/validations/*`.

### 3.4 Design system rules (daisyUI 5)

Follow the existing patterns exactly:

**Portal (Obsidian & Gold identity):**
- Shell: `bg-[#f5f6f8]`, sidebar `bg-[#101113]`, gold accent `#e8b64b`.
- Cards: `card bg-white border border-[#e8e9ed] rounded-2xl/3xl p-5 shadow-xs`.
- Buttons: daisyUI `btn` with existing sizes/radii; primary actions `bg-[#101113]` or `bg-[#e8b64b]`.
- Badges: `badge badge-sm badge-soft` with status colors.
- Inputs: `input input-bordered rounded-xl text-xs`.
- Eyebrow labels: `text-[10px] font-black uppercase tracking-widest text-[#9a752b]`.
- Keep the mobile `dock` and `md`/`lg` breakpoints.

**Admin (daisyUI semantic):**
- `bg-base-100`, `text-base-content`, `border-base-200`, `bg-base-200/50`.
- `btn btn-primary`, `badge badge-success/warning/error badge-soft`.
- `table table-sm`, `card rounded-3xl`, `shadow-3d`, `tabs`, `modal`, `drawer`, `stats`, `progress`, `steps`, `timeline`, `alert`, `skeleton`, `pagination`, `filter`, `dropdown`, `toast`.
- Use `text-base-content/60` for secondary text; never raw `gray-*` for text.

**Auth/marketing:** daisyUI semantic tokens + `glass-card`.

**Design-debt fix (non-blocking):** centralise the portal palette into CSS variables (e.g. `--portal-bg`, `--portal-ink`, `--portal-gold`, `--portal-line`) and add `dark:`/theme-aware values so the portal works in dark mode. New code must not add new hardcoded hex values; reuse the existing classes.

---

## 4. Data model changes

Add to `prisma/schema.prisma` (names indicative; final naming during migration):

### 4.1 Enums

```
enum BoosterCategory {
  CREATIVE
  PRODUCTION
  DISTRIBUTION
  FIELD_MARKETING
  INTELLIGENCE
  SALES_CONVERSION
  EXPERIENCE_TECHNOLOGY
}

enum BoosterJobStatus {
  DRAFT
  PUBLISHED
  APPLICATIONS_OPEN
  ASSIGNED
  ACCEPTED
  IN_PROGRESS
  SUBMITTED_FOR_REVIEW
  APPROVED
  PAYMENT_PENDING
  PAID
  CLOSED
  REJECTED
  WITHDRAWN
  CANCELLED
  DISPUTED
  REWORK_REQUESTED
}

enum ApplicationStatus { APPLIED SHORTLISTED ASSIGNED REJECTED WITHDRAWN }
enum PaymentModel { FIXED COMMISSION PER_ORDER PER_DELIVERY PER_TASK PER_VERIFICATION PER_REPORT PER_LEAD PROJECT_FEE MANAGEMENT_FEE }
enum SubscriptionStatus { PENDING_PAYMENT ACTIVE RENEWAL_DUE PAYMENT_FAILED GRACE_PERIOD EXPIRED CANCELLED }
enum BillingPeriod { MONTHLY ANNUAL }
enum BusinessProfileStatus { DRAFT PENDING_VERIFICATION VERIFIED REJECTED }
enum VerificationStatus { UNVERIFIED PENDING VERIFIED REJECTED }
enum ProofDecision { PENDING APPROVED REJECTED REWORK_REQUESTED }
enum DisputeStatus { OPEN UNDER_REVIEW RESOLVED APPEALED CLOSED }
enum NotificationChannel { IN_APP EMAIL SMS WHATSAPP }
```

Also align `CampaignStatus`:

```
DRAFT SUBMITTED UNDER_REVIEW QUOTE_REQUIRED AWAITING_APPROVAL AWAITING_PAYMENT CONFIRMED IN_PROGRESS COMPLETED REJECTED CANCELLED ON_HOLD PARTIALLY_COMPLETED DISPUTED
```

Keep a migration mapping for existing seed values.

### 4.2 New models (minimum)

- `Plan` — key, name, monthlyPrice, annualPrice, profileLimit, workspaceLimit, teamSeatLimit, featuresJson, active.
- `Subscription` — account/client, plan, billingPeriod, status, startDate, renewalDate, price, paymentState, cancelAt.
- `BusinessProfile` — owner/account, name, category, branches, location, verificationStatus, isPrimary.
- `BoosterProfile` — user, displayName/logo, categories, skillsJson, coverageJson, portfolioJson, ratesJson, verificationStatus, ratingAvg, completedJobs, availableHours, paymentInfo (private).
- `BoosterJob` — campaign, category, scope, location, deadline, budget, paymentModel, proofRequirementsJson, status, createdById, assignedToId.
- `JobApplication` — job, booster, status, note, appliedAt, assignedAt.
- `BoosterTeam` — manager, members, roles, permissions.
- `BoosterTeamMember` — team, booster, role.
- `Deliverable` — job, submitter, filesJson, timestamp, locationEvidence, reviewerId, decision, reason.
- `PaymentLedger` — type, payer, payee, gross, fees, net, currency, reference, status, related campaign/job, timestamps.
- `Commission` — referrer, qualifying transaction, rate, amount, eligibility, payoutStatus.
- `Rating` — job, reviewer, rated party, score, comment, moderationState.
- `Dispute` — related job/payment/campaign, parties, reason, evidenceJson, status, resolution, appeal.
- `Notification` — recipient, event, channel, title, body, readAt, link, createdAt.
- `TeamMember` (Business Pro seats) — client/account, user, role, permissions, invitedAt, acceptedAt.

Add relations and indexes for: `status`, `createdAt`, `dueDate`, `renewalDate`, `category`, `location`, `city`, `boosterId`, `campaignId`, `jobId`, `recipientId`.

### 4.3 Seed expansion

Seed realistic data so every screen is populated:

- 3 plans (Starter/Growth/Business Pro) with the exact spec prices.
- 1 active Starter, 1 Growth, 1 Business Pro subscription.
- 4–6 business profiles across branches.
- 6–8 campaigns across all statuses.
- Leads, quotes, invoices, payments, renewals, feedback, engagements.
- 8–12 Booster profiles across all seven categories.
- 8–10 published jobs, applications, one assigned/in-progress, one submitted, one approved.
- Deliverables/proofs, ratings, one dispute, notifications, audit logs.
- Wallet transactions and media settlements.

---

## 5. Phased implementation plan

### Phase 0 — Foundations & correctness (blocking)

**Goal:** make the app secure and make the existing data real before adding features.

1. **Real auth + session**
   - Add `src/lib/session.ts`, rewrite `src/lib/auth.ts`, add `src/proxy.ts`.
   - Add server actions: `signup`, `login`, `logout`, `acceptInvite`.
   - Update `/login`, `/signup`, `/accept-invite` to use actions and `useActionState`.
   - Update demo buttons to call the real login action (keep credentials from `CREDENTIALS.md`).
   - Add `lastLoginAt` update and `ActivityLog` on login/signup.
2. **Route protection**
   - `requireAdmin()` on `/admin`; `requireStaff()` on every admin page (wrap client pages in server components).
   - `requireClient()` on `/portal/*`; redirect to `/login`.
   - Add ownership checks to `/api/campaigns` or remove it in favour of server actions.
3. **Admin shell fixes**
   - Add **Inbox** (unread badge), **Subscriptions**, **Booster Jobs**, **Verification**, **Disputes**, **Notifications**, **Audit Log** to the sidebar.
   - Make `/admin` a server component using `getAdminKPICards`, `getAdminDashboardCharts`, `getNeedsAttentionItems`, `getRecentActivityLogs` with `Suspense` per section and a date-range selector via search params.
4. **Portal data migration**
   - Replace `CampaignContext` demo arrays with DAL reads.
   - Keep context only for modal/toast UI.
   - Wire `CampaignCreateModal` to a server action.
5. **Design token pass**
   - Centralise portal palette; add dark-mode variants; replace raw Tailwind colors in admin charts with daisyUI tokens.
6. **Tests + seed**
   - Unit tests for `parseDateRange`, entitlement checks, status transition guards.
   - Expand seed (see §4.3).

**Acceptance:** a real user can sign up, log in, is redirected by role, only sees their own data, and admin pages require staff.

**Phase 0 status: implemented (pending database migration/seed run).**

- `src/lib/session.ts` + `src/lib/session-constants.ts` — signed HttpOnly cookie session, verification, per-request cache.
- `src/lib/auth.ts` — real `requireUser`, `requireStaff`, `requireAdmin`, `requireClient`, role landing paths.
- `src/server/actions/auth.ts` — signup, login, demo login, logout, invite acceptance.
- `src/proxy.ts` — Next 16 proxy for optimistic route protection.
- `src/app/(admin)/layout.tsx` + `AdminShell.tsx` — server-protected admin shell with Inbox unread badge and sign-out.
- `src/app/(portal)/layout.tsx` + `PortalShell.tsx` — server-protected portal shell, real user identity and DB-backed campaigns.
- `src/server/data/campaigns.ts` + `src/server/actions/campaigns.ts` — campaign reads/writes scoped to the signed-in user/client.
- `src/app/(admin)/admin/page.tsx` — server-rendered KPI dashboard with `Suspense`, date-range selector, charts, needs-attention and activity feed.
- `src/lib/kpi.ts`, `src/lib/date-range.ts`, `src/lib/format.ts` — grounded KPI queries and shared formatting.
- `src/app/globals.css` — portal design tokens with light/dark values; portal files no longer use hardcoded hex.
- `prisma/seed.ts` — plans/packages, engagements, onboarding responses, leads, quotes, invoices, payments, renewals, inbox items, activity/audit logs and a demo invitation.
- `CREDENTIALS.md` — updated real-auth routes and demo invitation.

**Verification:** `npx tsc --noEmit` and `npm run build` pass. `npm run seed` requires the configured MySQL database to be reachable (the current `.env` points to a remote Aiven host that was unreachable during this run).

---

### Phase 1 — Subscription & account foundation (spec §4, §18)

**Goal:** a business can subscribe, create a profile and explore opportunities.

1. **Plan catalog & checkout**
   - `Plan` seed + `/portal/billing` (plan comparison, monthly/annual toggle, current plan, usage).
   - Subscription creation with `PENDING_PAYMENT → ACTIVE` (mock payment reference until provider decision).
   - Renewal date, invoices, payment records.
2. **Business profiles**
   - `/portal/business-profiles` list/create/edit; enforce `profileLimit` server-side.
   - Branch support for Business Pro.
3. **Entitlement service**
   - `src/lib/entitlements.ts`: `canCreateProfile`, `canCreateWorkspace`, `canAddTeamMember`, `hasFeature`.
   - Enforce on the server; on downgrade, block new activity but never delete data.
4. **Team seats (Business Pro)**
   - Invite up to 3 additional members; roles/permissions; accept-invite flow bound to a client.
5. **Admin subscriptions module**
   - `/admin/subscriptions`: plan, status, renewal, payment state, account, limits.
6. **Plan-aware UI**
   - Usage badges on dashboard; upgrade prompts; Growth/Business Pro features marked where not entitled.

**Acceptance:** all three plans can browse channels; profile/workspace limits enforced; subscription is separate from campaign spend.

**Phase 1 status: implemented (pending database `db push` + seed run).**

- `prisma/schema.prisma` — added `Plan`, `Subscription`, `BusinessProfile`, `BillingPeriod`, `SubscriptionStatus`, `BusinessProfileStatus`; linked subscriptions/profiles to `Client`.
- `src/lib/plans.ts` — exact Starter/Growth/Business Pro prices, limits and feature sets.
- `src/lib/entitlements.ts` — plan-aware entitlements, usage counts and server-side limit checks for profiles, workspaces and team seats.
- `src/server/actions/subscription.ts` — plan activation/change/cancel, subscription invoice and payment records.
- `src/server/actions/business-profiles.ts` — create/edit/delete/set-primary with owner checks and profile-limit enforcement.
- `src/server/actions/team.ts` — team invitations, revocation and member removal with Business Pro seat enforcement.
- `src/server/actions/onboarding.ts` — persists the business profile after plan selection.
- `src/server/actions/account.ts` — real account settings persistence.
- `/portal/billing`, `/portal/business-profiles`, `/portal/team` — new portal modules.
- `/admin/subscriptions` — admin subscription ledger and MRR/renewal KPIs.
- Portal layout now shows plan status and limit banners; campaign creation enforces active-workspace limits.
- Seed now creates the three plans, three subscriptions, business profiles, a Business Pro team member, a no-plan onboarding client, and subscription invoice/payment records.
- `CREDENTIALS.md` — added the new routes and team credentials.

**Verification:** `npx tsc --noEmit`, `npm test` (8/8) and `npm run build` pass. `npx prisma db push && npm run seed` still requires the configured MySQL database to be reachable.

---

### Phase 2 — Campaign commerce (spec §5, §13.2, §18)

**Goal:** an advertiser can create, submit, quote, pay and track a campaign end-to-end.

1. **Campaign wizard**
   - Multi-step form: objective, product/service, audience, locations, channels, dates, budget, creative upload, contact.
   - Save draft, submit for review.
2. **Media discovery**
   - `/portal/explore` reads `MediaInventory` (channel, provider, format, location, rate, availability, source).
   - Filters: channel, city, budget, availability; show “verified data only”.
3. **Campaign detail + timeline**
   - `/portal/campaigns/[id]`: status timeline, selected opportunity, quote, booking, proofs, reporting.
4. **Quotes & bookings**
   - `Quote`/`Booking` linked to campaign + inventory; itemised lines: media, Advers fee, production, logistics, SMS, taxes.
   - Advertiser approve/reject; expiry.
5. **Payments**
   - Mock/manual payment action with idempotent reference; update invoice/payment state.
   - Confirm only secured inventory.
6. **Admin review**
   - `/admin/moderation` bound to real campaigns; approve/reject/request revision; audit log.
7. **Status guards**
   - Central `canTransitionCampaign(from, to, role)` used by actions and admin.
8. **Basic reporting**
   - Spend, placements booked, execution evidence, available channel metrics; label unavailable metrics clearly.

**Acceptance:** create/save/submit, status visible, costs separated from subscription, admin review writes audit, no guaranteed-reach claims.

**Phase 2 status: implemented (pending database `db push` + seed run).**

- `prisma/schema.prisma` — expanded campaign fields (profile, product/service, audience, contacts, notes), itemised quote fields, campaign links on quotes/invoices, `CampaignStatusEvent`, and the spec status enum values (legacy values retained).
- `src/lib/campaign-status.ts` — status labels, tones, allowed transitions and active-workspace statuses.
- `src/server/actions/campaigns.ts` — 3-step campaign creation, draft save, draft submission, business profile/media inventory attachment, dates, contact and creative details; writes status events and activity logs.
- `src/components/portal/CampaignCreateModal.tsx` — 3-step campaign wizard.
- `src/server/data/campaign-detail.ts` + `/portal/campaigns/[id]` — campaign detail with timeline, itemised quote, invoice/payment and proof of performance.
- `src/server/actions/campaign-commerce.ts` — advertiser quote approval/rejection, idempotent campaign payment and cancellation.
- `src/server/actions/admin-campaigns.ts` — staff review, revision, rejection and itemised quote issuance with audit logs.
- `/admin/moderation` — now bound to real campaigns with a quote builder.
- `/portal/explore` — now reads live `MediaInventory` and can attach a specific slot to a campaign request.
- Seed now includes `CAMP-2026-004` (under review) and `CAMP-2026-006` (awaiting payment with an accepted quote and pending invoice), plus campaign status timelines.
- `CREDENTIALS.md` — added the campaign commerce demo flow.

**Verification:** `npx tsc --noEmit`, `npm test` (8/8) and `npm run build` pass on Next.js 16.4.5. `npx prisma db push && npm run seed` still requires the configured MySQL database to be reachable.

---

### Phase 3 — Booster marketplace MVP (spec §6, §7, §8, §13.3)

**Goal:** advertisers can source Booster services; Boosters can find and execute work.

1. **Booster onboarding**
   - `/booster/onboarding` + `/booster/profile`: identity/business, categories (7), skills, coverage, portfolio, rates, availability, payment info (private), verification upload.
2. **Marketplace**
   - `/booster/jobs`: search/filter by category, task type, location/radius, remote/on-site, budget model, skills, deadline, verification, availability.
   - Job detail, apply, withdraw.
3. **Admin job management**
   - `/admin/boosters/jobs`: create/edit/pause/close; assign; view applications.
4. **Assignment & execution**
   - Accept, in progress, submit proof, review/approve/reject/rework, close.
   - Deliverable files, timestamp, location evidence.
5. **Notifications**
   - `Notification` model + in-app bell/dropdown; events for application, assignment, deadline, proof decision, payment.
6. **Advertiser view**
   - Campaign → Booster jobs panel; see assigned providers and progress (respecting privacy).

**Acceptance:** Booster profile with categories/coverage/portfolio; admin publishes job; Booster applies/is assigned; job has deliverable/deadline/payment model/proof; reviewer approves/rejects with reason.

**Phase 3 status: implemented and seeded.**

- `prisma/schema.prisma` — added `BoosterProfile`, `BoosterJob`, `BoosterApplication`, `BoosterDeliverable`, `Notification`, plus the seven Booster categories, nine marketplace job categories, job statuses, payment models, application statuses, deliverable decisions and verification states.
- `src/lib/booster-status.ts` — labels, tones, transitions and open-job rules.
- `src/server/data/booster.ts` — profile, marketplace, job detail, applications, assigned work, advertiser jobs, admin jobs and notification queries.
- `src/server/actions/booster.ts` — profile upsert, apply, withdraw, accept assignment, start work, submit proof and notification actions.
- `src/server/actions/admin-booster-jobs.ts` — create/publish/close jobs, assign Boosters and review deliverables with audit logs.
- `src/server/actions/advertiser-booster-jobs.ts` — advertiser job requests and cancellation.
- `/booster` workspace — dashboard, profile, marketplace, job detail, applications and notifications.
- `/admin/boosters/jobs` — real job management, applications, assignment and proof review.
- `/portal/booster-jobs` — advertiser request and tracking page.
- Portal and admin sidebars now link to the Booster areas.
- Seed now includes 8 Booster profiles, 10 jobs, 8 applications, 2 deliverables and 6 notifications.

**Verification:** `npx tsc --noEmit`, `npm test` (12/12) and `npm run build` pass on Next.js 16.4.5. `npx prisma db push` and `npm run seed` completed successfully against the configured MySQL database.

---

### Phase 4 — Payments, earnings & trust (spec §9, §10, §18)

**Goal:** work can be completed and paid with auditable controls.

1. **Ledgers**
   - Separate ledgers: subscription, campaign funds, media partner, Booster job, commission, Advers fees, refunds, withdrawals.
   - `PaymentLedger` + `Commission`; idempotent references.
2. **Escrow**
   - Advertiser funds held → released on approved completion; show held vs available.
3. **Booster earnings**
   - `/booster/earnings`: pending, approved, paid, commissions, withdrawable; withdrawal request + admin review.
4. **Verification**
   - Identity/business/skills/locations; admin review queue.
5. **Ratings**
   - Only after completed jobs; tied to job; moderation.
6. **Disputes**
   - Structured report, evidence, review, decision, appeal; financial resolution.
7. **Fraud controls**
   - Duplicate evidence, suspicious location/time, repeated fake leads; route to human review.
8. **Admin finance**
   - `/admin/finance` bound to ledgers; approve payouts/withdrawals; reconcile.

**Acceptance:** pending/approved/paid/withdrawable visible; withdrawal not withdrawable before approval; separate records for subscription/campaign/service/commission; dispute flow works.

**Phase 4 status: implemented and seeded.**

- `prisma/schema.prisma` — added `LedgerEntry`, `BoosterEarning`, `Withdrawal`, `Rating` and `Dispute`, plus verification/fraud fields on Booster profiles and fraud risk on deliverables.
- `src/server/data/finance.ts` — Booster earnings/withdrawable totals, admin ledger, withdrawals, disputes and trust queues.
- `src/server/actions/finance.ts` — withdrawal requests and review, verification decisions, rating moderation, dispute creation/resolution.
- `/booster/earnings` — pending, approved, paid and withdrawable balances; withdrawal request form and history.
- `/admin/finance` — unified ledger, Booster earnings, withdrawals and disputes.
- `/admin/trust` — verification queue, rating moderation and dispute resolution.
- `/portal/booster-jobs` — advertiser **Rate Booster** and **Raise dispute** actions.
- Deliverable approval now creates a `BoosterEarning` and a `BOOSTER_PAYMENT` ledger entry.
- Subscription activation and campaign payment now write `SUBSCRIPTION` and `CAMPAIGN_PAYMENT` ledger entries.
- Duplicate evidence is flagged as `MEDIUM` fraud risk and routed to admins.
- Seed now includes two earnings (approved and pending), a withdrawal request, four ledger entries (subscription, campaign, Booster payment and referral commission), a pending rating, an open dispute, and a pending verification profile.

**Verification:** `npx tsc --noEmit`, `npm test` and `npm run build` pass on Next.js 16.4.5. `npx prisma db push` and `npm run seed` completed successfully.

---

### Phase 5 — Teams, scale & polish (spec §8, §15, §16)

1. **Booster teams**
   - Team manager creates project, work packages, owners, deadlines, fees, proof requirements, dependencies; Advers reviews exceptions.
2. **Business Pro multi-location**
   - Consolidated reporting across profiles/branches; comparisons where data exists.
3. **Notifications channels**
   - Email/SMS/WhatsApp adapters behind consent + feature flags; bulk SMS for Growth with separate delivery charge.
4. **Performance & reliability**
   - Pagination, indexes, `Suspense`/skeletons, empty states, caching 60–300s for heavy aggregates.
   - Idempotent payment callbacks; duplicate payout prevention.
5. **Accessibility & mobile**
   - Keyboard/focus, contrast, labels, mobile-first screens.
6. **Observability**
   - Error logging, payment/approval events, failed integrations without secrets.
7. **Tests**
   - Unit: entitlements, status guards, fee/commission calculations, KPI helpers.
   - Integration: auth, campaign flow, job flow, proof decision.
   - E2E: signup → subscribe → campaign → admin review; booster → apply → proof → approve.

**Phase 5 status: implemented and seeded (MVP scope).**

- `BoosterTeam` and `BoosterTeamMember` models, team roles and team/job links.
- `/booster/team` — create teams, add/remove Boosters by email, archive teams and view team jobs.
- Admin Booster job creation now supports assigning a team, which assigns the team manager and notifies the team.
- `/portal/reports` — consolidated campaign, spend, channel, status and profile/branch reporting; multi-profile filtering is gated by the Business Pro `CONSOLIDATED_REPORTING` feature.
- `NotificationPreference` model and `/portal/settings` channel toggles for in-app, email, SMS and WhatsApp.
- Shared `dispatchNotification` helper creates in-app records and simulated email/SMS/WhatsApp channel records based on preferences.
- Pure finance helpers (`approvedRemaining`, `computeWithdrawable`, `allocateWithdrawal`) with unit tests for partial and full withdrawal allocation.
- Admin and Booster route-level `loading.tsx` skeleton states.
- Tests now cover plan limits, campaign status flow, Booster status flow, Booster categories, finance allocation and formatting (21 tests).

**Verification:** `npx tsc --noEmit`, `npm test` (21/21) and `npm run build` pass on Next.js 16.4.5. `npx prisma db push` and `npm run seed` completed successfully.

---

## 6. Decisions required from Product/Finance (spec §19)

These block final implementation of Phases 2–4. For MVP, use the proposed defaults below and mark them as configurable.

| Decision | MVP default (proposed) |
|---|---|
| Payment provider | Paystack (mock adapter until keys are available) |
| Renewals | Manual renewal for MVP; auto-renew later |
| Grace period | 7 days (configurable) |
| Media inventory source | Admin-managed `MediaInventory`; no live partner feed |
| Instant vs quote-based booking | Quote-based for all channels in MVP |
| Campaign approval SLA | 24 hours target; no promise in UI |
| Escrow/legal | Advers holds funds in ledger; release on approval (legal review required) |
| Qualified lead / verified engagement | Defined per job template; admin approves |
| Referral commission | 5–10% only where campaign terms say so; not automatic |
| Verification levels | Email + phone for MVP; ID/business docs for paid jobs |
| Evidence standards | Photo/video + timestamp; GPS where required |
| Team subcontracting | Team manager assigns; Advers approves external subcontractors |
| Discounts/priority/exclusive | Implement as plan feature flags, not guaranteed inventory |
| Support SLAs | In-app + email for MVP; WhatsApp/phone later |

---

## 7. Recommended build order (first two sprints)

### Sprint 1 — Secure foundation
- Auth/session/proxy/RBAC.
- Admin dashboard wired to `kpi.ts` + Inbox link.
- Portal campaigns moved to DB (create/list/detail).
- Seed expansion.
- Design token pass + dark-mode fix.
- Tests for auth guards and KPI helpers.

### Sprint 2 — Subscriptions & campaign commerce
- Plans/subscriptions/entitlements.
- Business profiles + limits.
- Campaign wizard + quote/booking + mock payment.
- Admin moderation with audit.
- Billing page + admin subscriptions.

Then Phase 3 (marketplace), Phase 4 (payments/trust), Phase 5 (teams/scale).

---

## 8. Definition of done for the first release (spec §18)

- Register, create business profile, subscribe to one of three plans.
- Plan profile/workspace limits enforced server-side.
- Every plan browses all channel categories.
- Advertiser creates/saves/submits campaign and sees status.
- Campaign costs displayed separately from subscription fees.
- Admin reviews campaign and updates status with audit record.
- Booster creates profile, selects categories, coverage, portfolio.
- Admin publishes job; Booster applies/is assigned.
- Job specifies deliverables, deadline, payment model, proof.
- Booster submits proof; authorised reviewer approves/rejects with reason.
- Separate subscription, campaign, service-payment and commission records.
- Users see notifications and current campaign/job status.
