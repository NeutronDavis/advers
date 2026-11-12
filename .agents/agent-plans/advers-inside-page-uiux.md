# ADVERS Inside Page — UI/UX Improvement Plan

**Source:** `doc/ADVERS_Inside_Page_UI_UX_Change_Document.docx`
**Scope:** Sidebar, Overview, Advertisement Channel navigation, Influencer Hub, ADVERS Posts widget.
**Status:** Implemented in this session. See the completion note at the end of this document.

---

## Note: `When a user clickes on the chanels e.g (Radio, News paper) it should open a page where all the Radio chanels parthering with Advers are listed for tht user to select on, then when the user select one , it should open the details page of that one showing the availability, time and some nessasary information for the user to select and book of r the time. Note : same flow goes with other channels , it's now making the chanels looks more like category`

## 1.1 Clarified channel flow

This note is the authoritative flow for the channel experience:

1. **Channel = category.** Dashboard/Explore tiles such as Radio, Newspaper, Television, Billboard, Podcast and Influencer Hub are categories, not individual bookable products.
2. **Channel page = partner list.** Clicking a category opens a page listing every media partner, station, newspaper, screen or creator under that category that is partnering with Advers. Example: the Radio page lists Cool FM, Wazobia FM, Nigeria Info, Rhythm FM, Kiss FM, etc.
3. **Option detail = one partner/asset.** Selecting a partner opens its detail page showing:
   - Partner/asset information.
   - Location and coverage.
   - Rate and unit type.
   - Availability and bookable time slots (e.g. morning drive 6–10am, evening drive 4–8pm, news hour, specific dates for print/billboard).
   - Duration, creative requirements and proof requirements.
   - Any verified audience/reach information.
4. **Select and book a time.** The user chooses a specific available time slot (or date/edition for print, or loop/date for billboard) and then proceeds to configure the campaign, submit it, receive/approve a quote and pay through the existing campaign flow.
5. **No direct payment.** Clicking a channel or partner must never open a payment page. Payment only happens after campaign configuration, quote approval and invoice creation.

This means the current `MediaInventory` record represents the **partner/asset** (e.g. Cool FM 96.9), while a new `MediaSlot` record represents the **bookable time window** (e.g. Morning Drive, Mon–Fri, 6–10am, 8 slots).

## 1. Summary (TL;DR)

The change is a focused UI/UX and navigation upgrade, not a redesign of the existing platform.

1. Clean up the portal sidebar by removing the “Ready to grow your brand?” widget and applying the ADVERS gold brand colour to the theme/colour control.
2. Re-head the Overview page as **Overview** with the tagline **Get seen by the right people.**
3. Make every advertising channel a category. Clicking it opens a page listing all partnering stations/screens/newspapers/creators. Selecting a partner opens its detail page with availability and bookable time slots; the user selects a time, configures the campaign, submits, receives/approves a quote and pays through the existing flow. No channel click goes straight to payment or directly to the campaign modal.
4. Rename **Influencer Marketplace** to **Influencer Hub** everywhere, then turn it into a discovery experience with influencer profiles, audience/rate details and collaboration requests. Full influencer self-service is a follow-up phase.
5. Replace the dashboard “Big ideas deserve to be seen” hero with an **ADVERS POSTS** sponsored-content widget, backed by a new admin-managed `AdversPost` model.

The existing Obsidian/Gold portal identity, daisyUI components, campaign wizard, quote flow and payment flow are preserved.

---

## 2. Current-state findings

| Area | Current behaviour | Required change |
|---|---|---|
| Sidebar growth widget | `PortalShell.tsx` renders “Ready to grow your brand?” with a Create campaign button | Remove the widget completely |
| Theme/colour icon | `ThemeToggle.tsx` uses amber sun / primary moon | Use ADVERS gold for the icon and focus/hover states |
| Overview header | Eyebrow “Your marketing command centre”, greeting “Good afternoon 👋”, subtitle “Let’s get your brand seen…” | Heading **Overview**, tagline **Get seen by the right people.** |
| Dashboard channel tiles | Buttons call `openCreateModal(channel)` directly | Each tile links to `/portal/channels/[slug]` as a category |
| Channel pages | None | New category page listing all partnering stations/screens/newspapers/creators |
| Option detail | None | Partner/asset detail with availability and bookable time slots |
| Explore channel cards | “Book channel” calls `openCreateModal` | Link to the channel category page |
| Explore inventory | “Book this slot” calls `openCreateModal` | Link to the partner detail page, then choose a time slot |
| Bookable time slots | Only `MediaInventory.availableSlots` / `loopCapacity` text | Add `MediaSlot` records and slot-selection UI |
| Influencer naming | Mixed “Influencer marketplace”, “Influencer Marketplace”, “Influencer hub” | Rename display labels to **Influencer Hub** |
| Influencer data | Static hardcoded array | DB-backed profiles, detail page and request flow |
| Dashboard hero | “Big ideas deserve to be seen” widget | Replace with **ADVERS POSTS** sponsored-content widget |
| Sponsored posts | No model or admin module | Add `AdversPost`, seed, widget and `/admin/posts` |
| Payment | Existing campaign quote + mock payment flow | Reuse it; channel click must never go straight to payment |

Relevant existing files:
- `src/app/(portal)/PortalShell.tsx`
- `src/components/ThemeToggle.tsx`
- `src/app/(portal)/portal/dashboard/page.tsx`
- `src/app/(portal)/portal/explore/page.tsx`
- `src/app/(portal)/portal/explore/ExploreClient.tsx`
- `src/app/(portal)/portal/influencers/page.tsx`
- `src/components/portal/CampaignCreateModal.tsx`
- `src/context/CampaignContext.tsx`
- `src/lib/types/campaign.ts`
- `src/server/actions/campaigns.ts`
- `src/app/api/campaigns/route.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/app/(admin)/AdminShell.tsx`

---

## 3. Phase A — Sidebar and Overview polish

### Step A1 — Remove the sidebar growth widget
- File: `src/app/(portal)/PortalShell.tsx`
- Remove the entire `bg-[var(--portal-obsidian-2)]` “Ready to grow your brand?” block.
- Keep the sign-out form and the theme/version footer.
- Adjust bottom spacing so the sidebar does not feel empty.
- Keep the mobile “Create” dock action; it is separate from the removed widget.

### Step A2 — Apply ADVERS gold to the colour/theme control
- File: `src/components/ThemeToggle.tsx`
- Replace the current amber/primary icon colours with the portal gold token:
  - `text-[var(--portal-gold)]` for the active icon.
  - Gold-tinted hover/focus ring/background.
  - Keep the existing light/dark toggle behaviour and accessibility label.
- Verify contrast in both light and dark themes.

### Step A3 — Overview heading and tagline
- File: `src/app/(portal)/portal/dashboard/page.tsx`
- Replace the header block with:
  - Eyebrow: `Overview`
  - Heading: `Get seen by the right people.`
  - Optional supporting line: “Discover advertising opportunities and manage campaigns across channels.”
- Remove the greeting state/effect if no longer used.
- Keep the primary **Create campaign** button.

**Depends on:** none.
**Parallel with:** Phase B discovery work.

---

## 4. Phase B — Channel catalog and option detail flow

### Step B1 — Central channel catalog
- New file: `src/lib/channels.ts`
- Define a single catalog used by the dashboard, explore page and channel pages:

```ts
export interface ChannelCatalogItem {
  slug: string;                 // digital-billboards
  label: string;                // Digital billboards
  shortLabel: string;
  description: string;
  icon: string;
  tag: string;
  channelType: ChannelType;     // DIGITAL_BILLBOARD, ...
  group: "OUTDOOR" | "BROADCAST" | "PRINT" | "DIGITAL" | "CROWD";
}
```

- Slugs:
  - `digital-billboards`
  - `static-billboards`
  - `fm-radio`
  - `television`
  - `newspapers`
  - `podcasts`
  - `adboosters`
  - `influencers`
- Helpers: `getChannelBySlug`, `getChannelByLabel`, `getChannelOptionsHref`.
- Display label for `INFLUENCER` is **Influencer Hub**; keep the DB enum `INFLUENCER` unchanged.

### Step B2 — New channel category page (partner list)
- New route: `src/app/(portal)/portal/channels/[slug]/page.tsx`
- Server component:
  - `requireUser()`.
  - Resolve the catalog item from the slug; `notFound()` if unknown.
  - For media channels, fetch **all operational `MediaInventory` partners** where `channel = item.channelType`.
    - Example for `fm-radio`: Cool FM, Wazobia FM, Nigeria Info, Rhythm FM, Kiss FM, etc.
    - Example for `newspapers`: Punch, ThisDay, The Guardian, BusinessDay, etc.
  - For `influencers`, fetch published influencer profiles (Phase C).
  - For `adboosters`, render a concise Booster/referral entry point or link to `/portal/adboosters`.
- Render `ChannelPartnersClient` with:
  - Channel hero (category name, description, tag).
  - Partner cards: partner/station/screen/newspaper name, city/state, starting rate, unit type, next available slot, verification badge.
  - Search/filter by city, availability and rate.
  - Empty state: “No verified partners are available right now” with a support link.
  - Mobile-first grid.
- Each partner card links to `/portal/channels/[slug]/[partnerId]`.

### Step B2b — Add bookable media slots
- Current `MediaInventory` represents the partner/asset, not a bookable time.
- Add a new `MediaSlot` model in `prisma/schema.prisma`:

```prisma
model MediaSlot {
  id           String         @id @default(cuid())
  inventoryId  String
  inventory    MediaInventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  label        String         // "Morning Drive", "Evening News", "Weekend Edition"
  startTime    String?        // "06:00"
  endTime      String?        // "10:00"
  daysOfWeek   String?        // "MON,TUE,WED,THU,FRI" or "DAILY"
  date         DateTime?      // for print editions / specific billboard dates
  rate         Int
  unitType     String         // "per_spot_30s", "per_day", "per_issue"
  capacity     Int            @default(1)
  booked       Int            @default(0)
  status       String         @default("AVAILABLE") // AVAILABLE, LIMITED, BOOKED, CLOSED
  campaigns    Campaign[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([inventoryId])
  @@index([status])
  @@index([date])
}
```

- Add `mediaSlotId String?` and `mediaSlot MediaSlot?` to `Campaign`.
- Add `slots MediaSlot[]` to `MediaInventory`.
- Seed multiple partners per channel and multiple slots per partner:
  - Radio: morning drive, midday, evening drive, weekend.
  - TV: morning, prime news, evening.
  - Newspaper: specific edition dates.
  - Billboard: specific date ranges or loop slots.
- The partner detail page must show these slots with availability status and a “Book this time” action.

### Step B3 — New partner detail page with time-slot booking
- New route: `src/app/(portal)/portal/channels/[slug]/[partnerId]/page.tsx`
- Server component:
  - Resolve channel and partner/influencer option.
  - `notFound()` if the partner does not belong to the channel.
  - Fetch `MediaSlot` records for the partner, ordered by date/start time.
- Detail content:
  - Partner name, media partner/owner, location, city/state.
  - Rate and unit type.
  - Screen/broadcast/print specs and loop capacity.
  - Duration guidance.
  - Requirements (creative format, ARCON, proof).
  - Audience/reach only where verified data exists.
  - Vendor contact only if intended for display; otherwise keep it internal.
  - **Availability and time slots:** each slot shows label, days/time, date (if applicable), rate, remaining capacity and status.
- CTA:
  - User selects one available slot (radio/TV/billboard) or edition (newspaper).
  - **Book this time** opens the existing campaign wizard with `openCreateModal(channelLabel, partnerId, slotId)`.
  - If no slot is available, show **Request assistance** instead of booking.
  - For influencer options, pass `Influencer: <name>` and/or `Influencer Hub` with the profile in notes.
  - The wizard handles configuration and submission.
  - Quote, approval and payment continue on `/portal/campaigns/[id]`.

### Step B4 — Dashboard channel tiles become navigation
- File: `src/app/(portal)/portal/dashboard/page.tsx`
- Replace the `channelsList` hardcoded array with `CHANNEL_CATALOG`.
- Change each tile from `<button onClick={() => openCreateModal(...)}>` to:
  ```tsx
  <Link href={`/portal/channels/${channel.slug}`} className="...">
  ```
- The tile click must not open a modal or payment screen.

### Step B5 — Explore page links to channel/partner pages
- File: `src/app/(portal)/portal/explore/ExploreClient.tsx`
- Channel cards: replace “Book channel” `openCreateModal` with a link to `/portal/channels/[slug]` (the category page).
- Inventory cards: replace “Book this slot” with a link to `/portal/channels/[slug]/[inventoryId]` (the partner detail page, where the user selects a time).
- Keep the existing category filter and search; derive from `CHANNEL_CATALOG`.

### Step B6 — Channel compatibility in the campaign wizard
- Files:
  - `src/components/portal/CampaignCreateModal.tsx`
  - `src/server/actions/campaigns.ts`
  - `src/app/api/campaigns/route.ts`
  - `src/lib/types/campaign.ts`
- Add `"Influencer Hub"` to channel maps while keeping `"Influencer marketplace"` for backward compatibility.
- Ensure `openCreateModal(channelLabel, inventoryId, mediaSlotId)` pre-fills channel, partner and selected time slot.
- Extend `CampaignCreateInput` and `createCampaignAction` with `mediaSlotId`.
- Validate that the selected slot belongs to the selected inventory and is still available.
- Keep the existing `inventoryId` validation and campaign creation flow.

**Depends on:** A3 for dashboard integration.
**Blocks:** Phase C influencer option links.

---

## 5. Phase C — Influencer Hub rename + discovery/request flow

### Step C1 — Rename display labels everywhere
- Replace every user-facing “Influencer Marketplace” / “Influencer marketplace” with **Influencer Hub**:
  - `src/lib/types/campaign.ts` — `CHANNEL_LABELS.INFLUENCER`, `CHANNEL_ICONS`.
  - `src/app/(portal)/PortalShell.tsx` — nav label.
  - `src/app/(portal)/portal/dashboard/page.tsx` — channel tile.
  - `src/app/(portal)/portal/explore/ExploreClient.tsx` — title and `bookChannel`.
  - `src/components/portal/CampaignCreateModal.tsx` — option label and prefill.
  - `src/server/actions/campaigns.ts` and `src/app/api/campaigns/route.ts` — accept both labels, map to `ChannelType.INFLUENCER`.
- Do **not** rename the Prisma enum `INFLUENCER` or existing stored values.

### Step C2 — Influencer data model (discovery-first)
Add to `prisma/schema.prisma`:

```prisma
model InfluencerProfile {
  id             String   @id @default(cuid())
  userId         String?  @unique
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  displayName    String
  handle         String
  niche          String
  platform       String
  followers      Int      @default(0)
  engagementRate Float?
  rateCard       Int?
  bio            String?  @db.Text
  avatarUrl      String?
  audienceJson   String?  @db.Text
  verified       Boolean  @default(false)
  status         String   @default("ACTIVE")
  requests       InfluencerRequest[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([niche])
  @@index([verified])
  @@index([status])
}

model InfluencerRequest {
  id            String   @id @default(cuid())
  influencerId  String
  influencer    InfluencerProfile @relation(fields: [influencerId], references: [id], onDelete: Cascade)
  clientId      String
  client        Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  campaignId    String?
  campaign      Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  brief         String   @db.Text
  budget        Int
  status        String   @default("REQUESTED")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  respondedAt   DateTime?

  @@index([influencerId])
  @@index([clientId])
  @@index([status])
}
```

- Add relations on `User` (`influencerProfile`), `Client` (`influencerRequests`) and `Campaign` (`influencerRequests`).
- `userId` is optional now so discovery works before self-service is built.

### Step C3 — Influencer Hub advertiser UI
- Convert `/portal/influencers/page.tsx` to a server component:
  - `requireUser()`.
  - Fetch active influencer profiles.
  - Render `InfluencerHubClient`.
- Client features:
  - Search by name, handle, niche.
  - Filters: niche, platform, verified, rate range.
  - Profile cards: avatar, name, handle, niche, platform/followers, rating/verified, rate card, short bio.
  - Link to `/portal/influencers/[id]`.
- New detail route: `src/app/(portal)/portal/influencers/[id]/page.tsx`
  - Full profile, audience breakdown, platforms, rates, past collaboration notes.
  - **Request collaboration** form: brief, budget, optional campaign.
  - Submit via `requestInfluencerCollaborationAction`.
- Server action:
  - `src/server/actions/influencers.ts`
  - Validate with Zod; require client account.
  - Verify campaign ownership if selected.
  - Create `InfluencerRequest` status `REQUESTED`.
  - Notify influencer user if linked, otherwise notify admins.
  - Write `ActivityLog`.
  - Revalidate `/portal/influencers`.

### Step C4 — Admin visibility
- Add `/admin/influencers` or include influencer requests in an existing admin trust/operations page.
- MVP: list profiles and requests, approve/decline request status, and verify profiles.
- Add an admin sidebar item only if the page is included in this change; otherwise keep it in the follow-up.

### Step C5 — Follow-up: full influencer self-service
Documented but not implemented in this change:
- `/influencer` workspace with profile management, incoming requests and approved campaigns.
- Influencer login/role handling and profile claim flow.
- Request acceptance, campaign collaboration status and payout integration.

**Depends on:** Phase B channel catalog for the influencer channel page.

---

## 6. Phase D — ADVERS POSTS widget and admin module

### Step D1 — Data model
Add to `prisma/schema.prisma`:

```prisma
enum AdversPostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

model AdversPost {
  id                  String           @id @default(cuid())
  title               String
  body                String           @db.Text
  imageUrl            String?
  ctaLabel            String?
  ctaUrl              String?
  sponsorName         String
  sponsorLogoUrl      String?
  category            String?
  placement           String           @default("DASHBOARD")
  status              AdversPostStatus @default(DRAFT)
  startsAt            DateTime?
  endsAt              DateTime?
  targetAudienceJson  String?          @db.Text
  createdById         String
  createdBy           User             @relation("AdversPostCreator", fields: [createdById], references: [id], onDelete: Cascade)
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  @@index([status])
  @@index([placement])
  @@index([startsAt])
  @@index([endsAt])
}
```

- Add `adversPostsCreated AdversPost[] @relation("AdversPostCreator")` to `User`.

### Step D2 — Data access
- New file: `src/server/data/posts.ts`
- `getPublishedAdversPosts({ placement, limit })`:
  - status `PUBLISHED`
  - `startsAt` null or <= now
  - `endsAt` null or >= now
  - order by `createdAt desc`
- `getAdminAdversPosts()` for the admin table.

### Step D3 — Dashboard widget
- New component: `src/components/portal/AdversPostsWidget.tsx`
- Replace the dashboard hero section (`Big ideas deserve to be seen`) with:
  - Eyebrow: `ADVERS POSTS`
  - Heading: `Advertisements on ADVERS`
  - Supporting line: “Discover businesses, products, services and promotional campaigns advertised inside ADVERS.”
  - Sponsored post cards/banners with:
    - `Sponsored` badge.
    - Sponsor name/logo.
    - Image.
    - Title and short body.
    - CTA link to advertiser profile/product/campaign.
  - Clear distinction from ordinary app content.
  - Mobile: horizontal scroll or stacked cards.
  - Empty state: link to explore advertising or create a campaign.
- Keep the Obsidian/Gold visual language; do not use a generic ad slot look.
- `targetAudienceJson` is stored for future targeting but not applied in this change.

### Step D4 — Admin posts module
- New route: `src/app/(admin)/admin/posts/page.tsx`
- Client: `AdminPostsClient.tsx`
- Features:
  - List posts with status, placement, sponsor, schedule.
  - Create/edit post: title, body, image, CTA label/URL, sponsor, category, placement, starts/ends.
  - Publish, schedule and archive actions.
  - Preview the sponsored card.
- Server actions: `src/server/actions/advers-posts.ts`
  - `createAdversPostAction`
  - `updateAdversPostAction`
  - `publishAdversPostAction`
  - `archiveAdversPostAction`
- Add **ADVERS Posts** to `AdminShell` sidebar with a `Megaphone` icon.
- Write `AuditLog` and `ActivityLog` entries.

### Step D5 — Seed
- Add 3–4 published posts with sponsor names, images, CTA links and categories.
- Add one scheduled/draft post for the admin demo.

**Depends on:** none; can run parallel with Phase B/C.

---

## 7. Phase E — Quality, mobile and verification

### Step E1 — Responsive and accessibility
- Channel cards, option detail and sponsored posts must work at mobile, tablet and desktop widths.
- Use real `<Link>` elements for navigation.
- Add `aria-label`s to icon-only actions.
- Ensure sponsored content has a visible text label, not colour alone.
- Keep focus-visible styles on the gold theme control.

### Step E2 — Tests
- Add unit tests for:
  - `CHANNEL_CATALOG` slug/label/enum mapping.
  - Legacy “Influencer marketplace” → `INFLUENCER` compatibility.
  - AdversPost visibility window (published/scheduled/expired).
  - Influencer request status defaults.
- Keep existing 21 tests passing.

### Step E3 — Verification commands
```bash
npx prisma validate
npx prisma db push
npm run seed
npx tsc --noEmit
npm test
npm run build
```

### Step E4 — Manual smoke test
1. Portal sidebar no longer shows “Ready to grow your brand?”.
2. Theme/colour control uses ADVERS gold.
3. Overview shows **Overview** and **Get seen by the right people.**
4. Clicking a dashboard channel opens `/portal/channels/[slug]` as a category, not a modal.
5. Channel page lists all partnering stations/screens/newspapers under that category.
6. Partner detail shows availability/time slots; selecting a slot and clicking **Book this time** opens the campaign wizard.
7. Campaign wizard pre-fills channel/partner/time slot; submit → campaign detail → quote → payment works.
7. Influencer Hub label appears everywhere; no “Influencer Marketplace” text remains in the UI.
8. Influencer profile detail and collaboration request work.
9. Dashboard shows ADVERS POSTS with a visible Sponsored badge.
10. Admin can create, publish and archive an ADVERS post.

---

## 8. Files expected to change or be added

**Modified**
- `src/app/(portal)/PortalShell.tsx`
- `src/components/ThemeToggle.tsx`
- `src/app/(portal)/portal/dashboard/page.tsx`
- `src/app/(portal)/portal/explore/ExploreClient.tsx`
- `src/app/(portal)/portal/influencers/page.tsx`
- `src/components/portal/CampaignCreateModal.tsx`
- `src/lib/types/campaign.ts`
- `src/server/actions/campaigns.ts`
- `src/app/api/campaigns/route.ts`
- `src/app/(admin)/AdminShell.tsx`
- `prisma/schema.prisma`
- `prisma/seed.ts`

**New**
- `src/lib/channels.ts`
- `src/app/(portal)/portal/channels/[slug]/page.tsx`
- `src/app/(portal)/portal/channels/[slug]/[partnerId]/page.tsx`
- `src/app/(portal)/portal/channels/[slug]/ChannelPartnersClient.tsx`
- `src/app/(portal)/portal/channels/[slug]/[partnerId]/PartnerDetailClient.tsx`
- `src/server/data/channels.ts` (partner and slot queries)
- `src/app/(portal)/portal/influencers/InfluencerHubClient.tsx`
- `src/app/(portal)/portal/influencers/[id]/page.tsx`
- `src/app/(portal)/portal/influencers/[id]/InfluencerDetailClient.tsx`
- `src/server/actions/influencers.ts`
- `src/server/data/influencers.ts`
- `src/server/data/posts.ts`
- `src/server/actions/advers-posts.ts`
- `src/components/portal/AdversPostsWidget.tsx`
- `src/app/(admin)/admin/posts/page.tsx`
- `src/app/(admin)/admin/posts/AdminPostsClient.tsx`

---

## 9. Decisions & non-goals

### Decisions
- Channel click navigates to a channel page; it never opens payment or the campaign modal directly.
- The campaign wizard and existing quote/payment flow remain the single path for configuring, submitting and paying.
- “Influencer Hub” is a display-name change; the Prisma enum `INFLUENCER` and stored data remain unchanged.
- ADVERS Posts are admin-managed and database-backed; targeting is stored but not active.
- Influencer self-service workspace is a follow-up after discovery/request functionality.
- Use the existing Obsidian/Gold portal tokens and daisyUI components; no new design system.

### Non-goals for this change
- Real payment provider integration.
- Live media partner availability feeds.
- Sponsored-post impression/click analytics.
- Interest-based targeting.
- Full influencer payout and campaign execution management.
- Changing the existing campaign status/quote/payment logic beyond the channel entry path.

---

## 10. Suggested execution order

1. **Phase A** — sidebar cleanup, gold theme control, Overview heading.
2. **Phase B** — channel catalog, channel list, option detail, dashboard/explore navigation.
3. **Phase C** — Influencer Hub rename, influencer profiles, detail page and request flow.
4. **Phase D** — AdversPost model, dashboard widget, admin posts module and seed.
5. **Phase E** — tests, mobile/accessibility pass, verification.

Phases A, B and D can overlap; Phase C depends on the Phase B channel catalog for the influencer channel page.

---

## 11. Open items for Product

- Confirm whether the channel page should show vendor contact details publicly or keep them internal.
- Confirm whether influencer collaboration requests should require an existing campaign or allow standalone requests.
- Confirm the exact “official ADVERS brand colour code” token; this plan uses the existing `--portal-gold` token.
- Confirm whether ADVERS Posts should support multiple placements (dashboard, sidebar, campaign detail) in this release.

---

## 12. Implementation completion note

Implemented in this session:

- Sidebar growth widget removed; theme control now uses ADVERS gold.
- Overview heading and tagline updated.
- Added `CHANNEL_CATALOG`, channel category pages and partner detail pages.
- Added `MediaSlot` model, campaign `mediaSlotId`, seeded multiple partners and 21 time slots.
- Dashboard channel tiles and Explore cards now navigate to channel/partner pages.
- Campaign wizard accepts a selected media slot.
- Influencer Hub renamed and converted to DB-backed profiles with detail pages and collaboration requests.
- Added `InfluencerProfile`, `InfluencerRequest` and `/admin/influencers`.
- Added `AdversPost`, `/admin/posts` and the dashboard ADVERS POSTS widget.
- Seeded 5 influencer profiles, 1 collaboration request, 4 ADVERS posts and 17 media partners.
- Verification: `npx tsc --noEmit`, `npm test` (21/21), `npm run build`, `npx prisma db push`, `npm run seed` all pass.
