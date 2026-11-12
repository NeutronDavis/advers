# 🔐 Advers App Test Login Credentials & Guide

This document contains test credentials and quick-access routes to test the **Advers** web application, staff backoffice, and client onboarding flow.

---

## 🔑 Test Accounts & Credentials

| Role | Email | Password | Landing Target | Description |
|---|---|---|---|---|
| 🛡️ **Admin / Staff** | `admin@advers.ng` | `password123` | `/admin` | Full staff access to the operations cockpit, KPI dashboard, lead inbox and user directory. |
| 👤 **Active Client** | `client@advers.ng` | `password123` | `/portal/dashboard` | Active client portal (Look Professional Tier, 75% production progress, domain active). |
| ✨ **New Client** | `newclient@advers.ng` | `password123` | `/portal/billing` | New client onboarding flow (Step 1 choose plan -> Step 2 business profile). |
| 👥 **Team Member** | `team@advers.ng` | `password123` | `/portal/dashboard` | Business Pro team member under Adebayo Holdings (MEMBER role). |
| 🧑‍🔧 **Booster** | `booster@advers.ng` | `password123` | `/booster` | Verified creative Booster workspace, marketplace, applications and proof submission. |
| 🎙️ **Booster (earnings)** | `booster.voice@advers.ng` | `password123` | `/booster/earnings` | Approved earning, pending withdrawal request and rating/dispute demo data. |
| 🤝 **Booster (sales)** | `booster.sales@advers.ng` | `password123` | `/booster/applications` | Pending earning and the seeded dispute flow. |
| 👥 **Booster (team manager)** | `booster.field@advers.ng` | `password123` | `/booster/team` | Manager of the seeded Port Harcourt Launch Crew team. |
| 📨 **Invite Acceptance** | `invited@advers.ng` (via invite) | choose a password | `/accept-invite?token=demo-token` | Demo invitation seeded for the client invitation flow. |

---

## ⚡ 1-Click Quick Testing (Login Page)

Navigate to **`/login`** in your browser. At the top of the login form, you will find **1-Click Demo Buttons**:
1. Click **Admin / Staff Backoffice** to log in instantly as Admin.
2. Click **Active Client Dashboard** to test the active client portal view.
3. Click **New Client Onboarding** to test the step-by-step onboarding wizard.

---

> **Authentication note:** Login and signup now use real server actions and a signed, HttpOnly session cookie. `proxy.ts` handles optimistic route protection, and every admin/portal layout re-verifies the session. The demo buttons call the same authentication path as the email/password form.

---

## 🌐 Application Route Navigation Map

- **Home Landing Page**: `/`
- **Client Sign Up**: `/signup`
- **Client Login**: `/login`
- **Payment Invitation Acceptance**: `/accept-invite`
- **Client Onboarding Welcome**: `/portal/welcome`
- **Package Onboarding Wizard**: `/portal/onboarding/eng-101`
- **Client Portal Dashboard**: `/portal/dashboard`
- **Billing & Subscription**: `/portal/billing`
- **Business Profiles**: `/portal/business-profiles`
- **Team & Access**: `/portal/team`
- **Campaign Detail / Quote / Payment**: `/portal/campaigns/[id]`
- **Client Notifications**: `/portal/notifications`
- **Channel Category**: `/portal/channels/[slug]`
- **Partner Detail & Time Slots**: `/portal/channels/[slug]/[partnerId]`
- **Influencer Profile**: `/portal/influencers/[id]`
- **Advertiser Booster Jobs**: `/portal/booster-jobs`
- **Consolidated Reports**: `/portal/reports`
- **Client Projects & Bookings**: `/portal/projects`
- **Client Settings (incl. notification preferences)**: `/portal/settings`
- **Booster Dashboard**: `/booster`
- **Booster Marketplace**: `/booster/jobs`
- **Booster Applications**: `/booster/applications`
- **Booster Teams**: `/booster/team`
- **Booster Earnings & Withdrawals**: `/booster/earnings`
- **Booster Profile**: `/booster/profile`
- **Booster Notifications**: `/booster/notifications`
- **Staff Backoffice Cockpit**: `/admin`
- **Staff Subscriptions**: `/admin/subscriptions`
- **Staff Booster Jobs**: `/admin/boosters/jobs`
- **Staff Influencer Hub**: `/admin/influencers`
- **Staff ADVERS Posts**: `/admin/posts`
- **Staff Finance & Ledger**: `/admin/finance`
- **Staff Trust & Disputes**: `/admin/trust`
- **Staff Backoffice Inbox**: `/admin/inbox`
- **Digital Packages Spec**: `/visibility-journey`
- **About Us**: `/about`
- **Contact Us**: `/contact`

---

## 🧾 Campaign commerce demo

- **Admin moderation:** open `/admin/moderation`. `CAMP-2026-004` is seeded `UNDER_REVIEW`; use **Approve & create quote** to issue an itemised quote.
- **Advertiser quote approval:** after a quote is issued, open the campaign from `/portal/campaigns`. The quote shows media, Advers fee, production, logistics, SMS and tax lines separately.
- **Payment demo:** `CAMP-2026-006` (Q4 Radio & Billboard Blitz) is seeded `AWAITING_PAYMENT` with an accepted quote and a pending campaign invoice. Open it from the client campaign list and use **Pay now (mock)** to confirm the campaign.
- **Subscription vs campaign spend:** subscription invoices use `serviceType: SUBSCRIPTION`; campaign invoices use `serviceType: CAMPAIGN` and are linked to the campaign.

---

## 🧑‍🔧 Booster marketplace demo

- **Booster login:** `booster@advers.ng` / `password123` → `/booster`.
- **Marketplace:** `/booster/jobs`. `BJOB-2026-001` (creative) and `BJOB-2026-002` (printing) are open for applications.
- **Applications and proof:** `/booster/applications`. Assigned jobs include `BJOB-2026-004`, `BJOB-2026-006` and `BJOB-2026-008`.
- **Admin job desk:** `/admin/boosters/jobs`. Publish drafts, assign Boosters, approve/reject/rework proof.
- **Advertiser requests:** `/portal/booster-jobs` lets an advertiser request a Booster job for a campaign.
- **Notifications:** `/booster/notifications` (the bell in the portal and Booster shells links here).

---

## 💰 Payments, earnings & trust demo

- **Booster earnings:** log in as `booster.voice@advers.ng` / `password123` and open `/booster/earnings`. Grace Etim has an approved ₦70,000 earning and a pending ₦30,000 withdrawal request.
- **Admin finance:** log in as `admin@advers.ng` / `password123` and open `/admin/finance`. Review the unified ledger, Booster earnings and withdrawal requests. Marking the withdrawal paid moves approved earnings to paid.
- **Verification:** `/admin/trust` shows Amaka Nwosu's pending verification documents. Approve or reject with a note.
- **Ratings:** `/admin/trust` shows a pending 5-star rating for Grace Etim. Approving it updates her public rating.
- **Disputes:** `/admin/finance` and `/admin/trust` show the open dispute for the Port Harcourt launch. Resolve or close it with a resolution note.
- **Advertiser trust actions:** open `/portal/booster-jobs` as `client@advers.ng`. Approved/paid Booster jobs show **Rate Booster** and **Raise dispute** actions.

---

## 🧩 Teams, reports & notification preferences

- **Consolidated reports:** log in as `client@advers.ng` (Business Pro) and open `/portal/reports`. Filter between all profiles and individual branches.
- **Booster teams:** log in as `booster@advers.ng` and open `/booster/team`. Create a team, add another Booster by email, and view team jobs.
- **Admin team assignment:** `/admin/boosters/jobs` now includes a Booster team selector when creating a job.
- **Notification preferences:** `/portal/settings` includes in-app, email, SMS and WhatsApp toggles. Email/SMS/WhatsApp are simulated channel records until provider adapters are connected.
- **Loading states:** admin and Booster routes now show skeleton loaders while server data is fetched.

---

## 👥 Team & reporting demo

- **Booster team manager:** `booster.field@advers.ng` / `password123` → `/booster/team`. The seeded **Port Harcourt Launch Crew** includes Blessing Johnson (manager), Ibrahim Musa and Grace Etim.
- **Admin team assignment:** `/admin/boosters/jobs` includes a Booster team selector when creating a job.
- **Consolidated reports:** `client@advers.ng` / `password123` → `/portal/reports`. Business Pro can switch between all profiles and individual branches.
- **Notification preferences:** `client@advers.ng` → `/portal/settings`. In-app, email, SMS and WhatsApp toggles are saved per user.

---

## 📺 Inside-page UI/UX demo

- **Channel categories:** log in as `client@advers.ng` / `password123`. On the Overview, click **FM radio**, **Television**, **Newspapers** or **Digital billboards**. The category page lists all partnering stations/screens/newspapers.
- **Partner availability:** select a partner (e.g. Cool FM) to see its time slots. Choose a slot and click **Book this time** to open the campaign wizard with the partner and slot attached.
- **Influencer Hub:** open `/portal/influencers`, select a creator, and send a collaboration request.
- **ADVERS Posts:** the Overview hero is now the sponsored **ADVERS POSTS** widget. Admin management is at `/admin/posts`.
- **Admin Influencer Hub:** `/admin/influencers` for creator verification and collaboration requests.
- **Client notifications:** the bell in the client app opens `/portal/notifications` (not the Booster notification page).
- **Booster demo login:** `/login` now includes a **Booster Workspace** button for `booster@advers.ng`.

---

## 🗄️ MySQL Database Commands

- **Generate Prisma Client**:
  ```bash
  npx prisma generate
  ```
- **Sync Schema to Database**:
  ```bash
  npx prisma db push
  ```
- **Seed Demo Data**:
  ```bash
  npx tsx prisma/seed.ts
  ```
