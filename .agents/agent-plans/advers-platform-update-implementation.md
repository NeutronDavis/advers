# Plan: ADVERS Platform Update Implementation

**Source:** `doc/ADVERS_Technical_Development_Brief.docx`
**Status:** Phase 6 QA complete on development — controlled staging/pilot ready. Real-money production is blocked by `.agents/agent-plans/phase-6-qa-release.md` §5.
**Milestone 1:** Foundation only (Phase 0 + Phase 1). Later phases are specified but not started until Milestone 1 exits.

---

## Phase 0 Execution Log (2026-11-24)

Phase 0 discovery artifacts are complete. No application code or schema was changed.

| Deliverable | Status | Artifact |
|---|---|---|
| Current-state review | Done | Plan "Current-State Findings" |
| Decisions log + gate checklist | Done (8 items pending) | `.agents/agent-plans/phase-0/decisions-log.md` |
| Provider evaluation | Desk research done; sandbox blocked on credentials | `.agents/agent-plans/phase-0/provider-evaluation.md` |
| Media validation spike | Done | `.agents/agent-plans/phase-0/media-spike.md` |
| UI token inventory | Done | `.agents/agent-plans/phase-0/token-inventory.md` |
| ADR-0001 money | Proposed | `.agents/agent-plans/adr/0001-money-representation.md` |
| ADR-0002 ledger | Proposed | `.agents/agent-plans/adr/0002-double-entry-ledger.md` |
| ADR-0003 custody/provider | Proposed | `.agents/agent-plans/adr/0003-custody-and-provider.md` |
| ADR-0004 auth context/step-up | Proposed | `.agents/agent-plans/adr/0004-auth-context-and-step-up.md` |
| ADR-0005 design tokens | Proposed | `.agents/agent-plans/adr/0005-design-tokens.md` |
| ADR-0006 media/specs | Proposed | `.agents/agent-plans/adr/0006-media-and-channel-specs.md` |

**Key Phase 0 findings**

- `sharp` works on the current runtime; `ffprobe`/`ffmpeg` are **not installed**. V1 uses `sharp` + `music-metadata` + `mp4box`, with ffprobe as optional V2.
- The UI currently has **three palettes** (indigo marketing, obsidian/gold portal, daisyUI semantic booster/admin) and 13 genuine `bg-white` dark-mode defects.
- Provider research: Yellow Card is the best NGN/stablecoin fit; BVNK is deferred due to a public $500k/month + 6-month trading minimum. **USDC payout to an external Polygon/Base wallet for a Nigerian business is still unverified** and is the sandbox go/no-go question.
- No provider credentials exist in `.env` or `CREDENTIALS.md`; the sandbox spike cannot run yet.

**Gate status:** **PASSED.** D-04 (Polygon PoS), D-05 (Yellow Card primary), D-06 (obsidian/gold), and all non-blocking recommendations are signed off. D-07 fee numbers and D-15 minimums remain for Finance and block Phase 2 only; provider sandbox credentials block the provider spike only. Phase 1 can start immediately.

---

## Phase 1 Execution Log (2026-11-24)

Phase 1 core is implemented and verified against the live development database. Full detail is in `.agents/agent-plans/phase-1-foundation.md`.

| Deliverable | Result |
|---|---|
| Exact money module | `src/lib/money.ts` + 10 tests |
| Double-entry ledger | `src/lib/ledger.ts`, `src/server/ledger/index.ts` + 6 tests, DB smoke passed |
| Additive migration | Baseline + `20261124120000_phase1_foundation` applied |
| Backfill | 60 legacy rows converted to kobo, 0 mismatches |
| Session context | `resolveSessionContext`, `requireContext`, switch action + 6 tests |
| Design tokens | Obsidian/gold canonical, `--portal-*` aliases, 38 files cleaned |
| Tooling | `typecheck`, `db:backup`, `db:migrate`, `backfill:money`, `ledger:smoke`, `verify:phase1` |
| Verification | typecheck passed, 43/43 tests, build passed, `verify:phase1` passed |

**Deliberate deferrals:** legacy `Int` remains the UI read source until the Phase 2 wallet rebuild; `requireContext` is not yet applied to every route; theme preference is not yet synced to the account; `--portal-*` aliases remain until Phase 4; ESLint/Playwright are Phase 6.

**Phase 2 blockers:** Yellow Card sandbox credentials, Finance fee percentages (D-07), and minimum deposit/withdrawal amounts (D-15).

---

## Phase 2 Execution Log (2026-11-25)

Phase 2 core is implemented and verified against the live development database using the **mock provider**. Full detail is in `.agents/agent-plans/phase-2-wallet-security.md`.

| Deliverable | Result |
|---|---|
| Provider abstraction | Interface, mock provider, Yellow Card stub, env factory |
| Webhooks | Signed route, `ProviderEvent` persistence, duplicate handling |
| Wallet | Per-currency wallet, ledger-backed balances, fund/withdraw/address actions |
| Ledger flows | On-ramp, withdrawal hold, payout, failure reversal, all idempotent |
| 2FA | TOTP (RFC 6238), AES-GCM secret storage, hashed recovery codes, step-up tokens |
| UI | Real `/portal/wallet`, sandbox checkout, `/portal/settings/security` |
| Rate limits | Funding, address changes, TOTP attempts, withdrawals |
| Migrations | 3 additive Phase 2 migrations applied |
| Verification | typecheck passed, 62/62 tests, build passed, wallet + security smoke passed, wallet/security pages render 200 |

**Deliberate deferrals:** real Yellow Card adapter, real FX quotes, in-memory → Redis rate limiting, admin reconciliation queue, withdrawal review queue, email notifications, address checksum, recovery-code login UI, wallet freeze admin action.

**Phase 2 production blockers:** Yellow Card sandbox credentials/KYB, fee percentages (D-07), minimums (D-15), Redis-backed rate limiting, and the reconciliation/review queues.

---

## Phase 2 Hardening Log (2026-11-25)

Phase 2 was hardened after the core build. Full detail is in `.agents/agent-plans/phase-2-hardening.md`.

| Hardening item | Result |
|---|---|
| Rate limiting | MySQL-backed `RateLimitBucket`, shared across processes, with cleanup script |
| Address safety | EIP-55 checksum validation, zero-address rejection, checksum normalization |
| Admin reconciliation | `/admin/reconciliation`: retry/ignore provider events, resolve withdrawals, freeze/activate/close wallets |
| Recovery codes | One-time recovery code disables 2FA and lets the user re-enrol |
| Notifications | In-app updates for funding, withdrawals, 2FA and wallet status; safe post-ledger delivery |
| Statement export | `/portal/wallet/statement` CSV download |
| Webhook hardening | 256 KB limit, attempt tracking, duplicate detection, persisted errors |
| Migration | `20261125150000_phase2_hardening` applied after backup |
| Verification | typecheck passed, 67/67 tests, build passed, wallet + security smoke passed, admin/wallet/statement renders checked |

**Still external blockers:** real Yellow Card adapter, real FX quotes, D-07 fees, D-15 minimums, email/SMS delivery, contract-address RPC detection, and a pre-payout finance approval step.

---

## Phase 3 Execution Log (2026-11-25)

Initial AdBooster marketplace slice is complete. Full detail is in `.agents/agent-plans/phase-3-marketplace.md`.

| Deliverable | Result |
|---|---|
| Profile model | Handle, cover, location, availability, response time, starting price |
| Social models | Likes, comments, reviews, recommendations, reports |
| Ranking | D-11 weights engine + 6 tests |
| Discovery | Real `/portal/adboosters` with search, filters, sort, pagination |
| Public profile | `/portal/adboosters/[handle]` with portfolio, services, reviews, comments, recommendations |
| Social actions | Like, recommend, comment, verified review, report; rate-limited and moderation-gated |
| Moderation | `/admin/marketplace` with comment/review/report queues and content removal |
| Profile editor | Marketplace presence fields and unique handle management |
| Seed | `npm run seed:marketplace` populated 8 demo profiles |
| Verification | typecheck passed, 76/76 tests, build passed, marketplace/profile/admin pages render 200 |

**Remaining Phase 3 refinements:** structured services/packages, portfolio records, ranking admin overrides, moderation bulk/appeals, direct engagement flow, stronger anti-abuse signals, SQL-backed pagination.

---

## Phase 4 Execution Log (2026-11-25)

Phase 4 core is complete. Full detail is in `.agents/agent-plans/phase-4-account-settings-theme.md`.

| Deliverable | Result |
|---|---|
| Profile settings | Username, avatar, name/phone/company, email change, password change |
| Theme | Preference card + persisted `ThemeToggle` across shells |
| Account switching | Sidebar switchers, settings card, dual-role demo seed |
| Danger zone | Deactivate and deletion request with password + confirmation |
| Email change | 24h hashed token, confirmation page, dev verification link |
| Migration | `20261125170000_phase4_account_settings` applied after backup |
| Verification | typecheck passed, 76/76 tests, build passed, settings/switch/email pages render |

**Deferrals:** email delivery provider, logged-out confirmation redirect, server-rendered theme to remove first-paint flash, manual WCAG contrast QA, avatar uploads (Phase 5), hard account deletion, per-device session list, stricter booster route context redirects.

---

## Phase 5 Execution Log (2026-11-25)

Phase 5 core is complete. Full detail is in `.agents/agent-plans/phase-5-ad-builder-media.md`.

| Deliverable | Result |
|---|---|
| Channel specs | `ChannelSpec` model, 42 seeded fields, admin editor |
| Media assets | `MediaAsset` + `CampaignMediaAsset`, local storage driver, upload action |
| Image inspection | `sharp` dimensions and size caps |
| Dynamic builder | Channel-first fields, uploads, previews, inline validation, drafts |
| Server validation | Required fields and asset rules re-checked on create, draft and submit |
| Migration | `20261125180000_phase5_media_channel_specs` applied after backup |
| Verification | typecheck passed, 83/83 tests, build passed, media smoke passed, admin/portal pages render |

**Deferrals:** S3/signed direct uploads, server-side audio/video probing, antivirus scan, thumbnails/transcoding, partner-level spec overrides, draft autosave, campaign media gallery.

---

## Phase 3 Refinements Log (2026-11-25)

Structured services, packages, portfolio records and direct engagement requests are complete. Full detail is in `.agents/agent-plans/phase-3-refinements.md`.

| Deliverable | Result |
|---|---|
| Services/packages | `BoosterService`, `BoosterPackage`, structured editor sync, public display |
| Portfolio | `PortfolioItem` model with media/external links, legacy JSON backfill |
| Engagement requests | Advertiser request dialog, Booster accept/decline inbox, notifications |
| Backfill | 12 services and 6 portfolio items migrated from legacy JSON |
| Migration | `20261125190000_phase3_services_requests` applied after backup |
| Verification | typecheck passed, 87/87 tests, build passed, profile/request pages render |

**Remaining Phase 3 work:** portfolio media upload UI, package includes editor, service-level filters, accepted-request → job conversion, read receipts, ranking overrides, anti-abuse signals, moderation bulk actions, SQL pagination.

---

## Phase 3 Refinements Round 2 Log (2026-11-25)

The remaining high-value Phase 3 refinements are complete. Full detail is appended to `.agents/agent-plans/phase-3-refinements.md`.

| Deliverable | Result |
|---|---|
| Portfolio media | Upload/edit/delete media portfolio items; legacy rows preserved |
| Package includes | Fifth quick-entry field and public display |
| Discovery | Category/search now match structured services and packages |
| Request→job | Accepted request creates a draft assigned BoosterJob |
| Read receipts | `VIEWED` status, `viewedAt`, unread request badge |
| Ranking admin | Manual ±20 boost, sponsored flag, ranking notes, admin tab |
| Moderation bulk | Approve/reject selected comments and reviews |
| Anti-abuse | New accounts need a completed job before recommending |
| Migration | `20261125200000_phase3_refinement_final` applied after backup |
| Verification | typecheck passed, 88/88 tests, build passed, pages render |

**Remaining non-critical Phase 3 items:** SQL ranking/pagination above 120 candidates, moderation appeals/history, service platform filter, sponsorship billing, portfolio ordering controls.

---

## Phase 6 QA Log (2026-11-25)

Phase 6 QA is complete on the development environment. Full detail is in `.agents/agent-plans/phase-6-qa-release.md`.

| Deliverable | Result |
|---|---|
| Typecheck | Passed |
| Unit tests | **88/88 passed** |
| Build | Passed |
| Playwright E2E | **4/4 passed** (settings, marketplace, TV builder, admin) |
| Smoke suite | wallet, security, media, ledger all passed |
| Phase 1 verifier / cleanup | Passed |
| Security hardening | Mandatory session version, extra rate limits, audit log, security headers |
| Migration status | Up to date |

**Production blockers:** Yellow Card adapter, real FX/fee/minimum decisions, durable media storage + antivirus, email/SMS delivery, pre-payout finance approval, CSP/pen test, and a staging rehearsal.

---

## Summary

The brief asks for nine workstreams: USDC transactions, advertiser wallet + TOTP 2FA, professional AdBooster profiles, an AdBooster marketplace with reviews/recommendations, Light/Dark theme repair, a unified design system, profile settings + AdBooster account switching, a channel-driven advertisement builder with media uploads, and cross-platform QA.

Current-state review shows roughly 60–70% of this is net-new. The critical finding is that **all money in the schema is stored as `Int` whole Naira**, which cannot represent USDC (6 decimals), and the wallet screen is entirely mocked. Profiles exist but are JSON blobs with no discovery, reviews require a completed job, and there is no upload/storage pipeline, no 2FA, no payment provider, and no account-switching concept.

**Recommended strategy:** settle the irreversible decisions first (Phase 0), then build the shared foundation (Phase 1): canonical money representation + double-entry ledger, unified design tokens, account context in the session, and a test harness. Only then build features. This avoids migrating money twice and avoids building marketplace/ads on a token and auth model that has to change underneath them.

**User decisions recorded for this plan:**
- USDC custody: **regulated on/off-ramp provider**; ADVERS keeps the authoritative internal ledger and integrates provider APIs + webhooks.
- Pricing: **NGN list pricing with a locked USDC settlement quote per transaction**; both amounts and the FX rate are stored.
- First milestone: **foundation first** (Phase 0 + Phase 1).
- Deliverable: this full implementation plan.

---

## Scope

### In scope
- Money model migration to exact minor units with explicit currency and network, plus a shared formatter and DTO boundary rules.
- Double-entry, idempotent ledger with derived balances, FX quote records, and reconciliation hooks.
- USDC wallet for advertisers: balance, fund, withdraw, address book, statuses, history, receipts.
- TOTP 2FA with recovery codes, step-up verification for sensitive actions, rate limits, audit trail.
- Professional AdBooster profile (public), marketplace discovery, filters, likes, comments, reviews, recommendations, reports/moderation, ranking.
- Unified design tokens and working Light/Dark across all shells, with per-account persistence.
- Profile Settings expansion and explicit User/AdBooster account context switching with authorization tests.
- Channel-driven advertisement builder with configurable per-channel/per-partner specs, uploads, previews, validation, drafts, submission.
- Automated and manual verification for every phase.

### Out of scope (explicit non-goals)
- Native iOS/Android apps. "Mobile/tablet/desktop" is interpreted as responsive web.
- Sponsored marketplace placement. Schema should not block it, but no ranking-auction or ad-slot product is built.
- Rebuilding the Influencer Hub beyond keeping it compatible with shared tokens/components.
- Admin console redesign beyond the modules needed to operate the new flows (finance reconciliation, moderation, channel specs, media review).
- Fiat card acquiring outside the chosen on/off-ramp provider.
- KYC identity-verification build-out. If the provider does not supply it, 2FA recovery is restricted to support-assisted recovery in v1.
- Full accounting/tax reporting beyond transaction records required by the brief.

---

## Current-State Findings

| Area | Current behaviour | Required change |
|---|---|---|
| Money storage | `Int` whole Naira on `Campaign.budget`, `Wallet.*`, `WalletTransaction.amount`, `LedgerEntry.*`, `Invoice`, `Quote`, `Payment`, `BoosterJob.budget`, `BoosterEarning.amount`, `Withdrawal.amount` | Canonical minor-unit `BigInt` + `currency` + `network`; additive dual-write migration |
| Formatting | `src/lib/format.ts` hardcodes `NGN`; ad-hoc `₦` strings across screens | Single `formatMoney` with currency/decimals; ban raw `₦` literals |
| Advertiser wallet | `src/app/(portal)/portal/wallet/page.tsx` is a mock: hardcoded balances, deposit mutates React state only. `getWalletDetails()` exists but is unused | Real server-backed wallet, transaction list, deposit/withdraw flows |
| Payment provider | None. No SDK, webhook route, env keys. "Paystack & Flutterwave" is copy only | Provider adapter, webhook handler, idempotency, reconciliation |
| Ledger | `LedgerEntry` exists with `currency` default `NGN`, gross/fee/net/reference — single-entry, `Int` | Double-entry transaction + lines, immutable, idempotency keys |
| Withdrawals | `Withdrawal` is bound to `BoosterProfile` | Generalize to user-owned payout with optional booster link; add `PayoutDestination` |
| 2FA | None. Custom HMAC session cookie in `src/lib/session.ts`; no step-up, revocation, or rate limit | TOTP secret store, recovery codes, step-up token, rate limiting |
| Account context | `Role` = CLIENT/STAFF/ADMIN; booster is a profile, not a role. `landingPathForAuthenticatedUser()` routes to `/booster` only when `clientId` is null | Explicit active context in session, switch action, per-route authorization |
| AdBooster profile | `BoosterProfile` with JSON categories/skills/coverage/portfolio/rates; verification + ratings. Legacy `AdBooster` model duplicates the concept | Normalize services/packages/portfolio; add cover, location, username, availability; resolve model duplication |
| Marketplace | `src/app/(portal)/portal/adboosters/page.tsx` is a hardcoded programme page | Discovery, filters, profile pages, social actions, moderation, ranking |
| Reviews | `Rating` requires `jobId` and an approved/paid job; unique `[jobId, reviewerId]` | Add profile-level reviews/recommendations with verified vs unverified distinction |
| Theme | Toggle exists in all four shells and persists to `localStorage`; two parallel palettes (`--portal-*` obsidian/gold vs daisyUI indigo/violet) | One token system, mapped semantic colours, per-account persistence, audit of hardcoded colours |
| Settings | `/portal/settings` edits name/phone/company + notifications only | Avatar, username, email, password, account deletion, theme, AdBooster create/switch |
| Ad builder | `CampaignCreateModal.tsx` generic 3-step form; channel is a free string; creative is a pasted URL + free-text format | Channel-driven fields, configurable specs, uploads, preview, validation, summary |
| Media | No storage; `MediaInventory.screenSpecs` and `loopCapacity` are free text | Storage adapter, `MediaAsset`, `ChannelSpec`/partner overrides, metadata extraction |
| Tests | Unit tests only (`src/lib/__tests__/*.test.ts`); no lint/typecheck scripts; no E2E | Add typecheck/lint, ledger/ranking tests, Playwright critical flows |

---

## Architecture Decisions

### AD-1: Money representation
- Store `amountMinor BigInt`, `currency String` (`NGN` | `USDC`), optional `network String` (`POLYGON` | `BASE` | `ETHEREUM` | `SOLANA`).
- Decimals are defined once in `src/lib/money.ts`: `NGN=2`, `USDC=6`. Never infer decimals from the value.
- All arithmetic goes through `addMoney`, `subMoney`, `compareMoney`, `parseMoney`, `formatMoney`. No floats in domain logic.
- **Serialization rule:** `BigInt` is not serializable across the React Server Component boundary. Every server action/data loader returns `string` minor units in DTOs; client components parse with `parseMoney`. Enforce with a `MoneyDTO = { amountMinor: string; currency; network? }`.
- Migration is additive: add new columns/tables, dual-write, backfill, switch reads, then remove legacy `Int` fields in a later migration. Do not rename in place.
- Backfill: existing whole-Naira `Int` values are multiplied by 100 into kobo minor units.

### AD-2: Ledger
- `LedgerTransaction` (immutable header: `type`, `status`, `reference` unique, `idempotencyKey` unique, `createdAt`) + `LedgerLine` (debit/credit account + amount) must balance to zero per transaction.
- `LedgerAccount` rows per user and purpose (`AVAILABLE`, `ESCROW`, `FEE`, `PAYOUT_CLEARING`); balances are derived and optionally materialized with a rebuild job.
- `Wallet.availableBalance` and `escrowBalance` become cached projections only; the ledger is the source of truth.
- FX: `FxQuote` records `baseCurrency`, `quoteCurrency`, `rate`, `provider`, `expiresAt`, `lockedAt`, and is referenced by the payment/ledger transaction.
- Every external provider event is stored raw (`ProviderEvent`) before processing, with unique provider event id for idempotency.

### AD-3: Custody and provider
- Provider adapter interface in `src/server/payments/provider.ts`: `createOnrampSession`, `createPayout`, `getTransaction`, `verifyWebhook`, `parseWebhook`.
- Provider webhooks land in `src/app/api/webhooks/[provider]/route.ts`, verify signatures, persist `ProviderEvent`, then process idempotently.
- No private keys or provider secrets in client bundles, logs, or error messages. Secrets only via env and server-only modules.
- Network is chosen in Phase 0 and enforced per wallet/address. Address validation is network-specific; no shared validator.

### AD-4: Auth and step-up
- Session payload gains `ctx` (`USER` | `BOOSTER` | `ADMIN`). Server validates that the user actually owns the context before honoring it.
- `switchAccountContextAction` reissues the cookie only after checking the target profile/role; writes `AuthEvent`.
- `TwoFactorSecret` stores an encrypted TOTP secret (app-level AES-GCM key from env), hashed recovery codes, `confirmedAt`, `lastUsedAt`.
- Sensitive actions (withdraw, address change, password change, email change, payout destination change) require a `StepUpToken`: short-lived (5 min), single-use, bound to user + action, stored server-side.
- Rate limits: per-user and per-IP on login, TOTP verify, withdrawal, address add, comment/review/recommend, report.
- All sensitive actions write `AuditLog` plus `AuthEvent` where relevant.

### AD-5: Design tokens
- One canonical token file. Recommended: obsidian/gold becomes the brand palette, mapped onto daisyUI semantic tokens so `base-*`, `primary`, etc. resolve correctly in both themes; `--portal-*` aliases are removed after migration.
- Token groups: background, surface, elevated surface, text (primary/secondary/muted), border, brand, brand-contrast, success/warning/danger/info + soft variants, focus ring, overlay, skeleton.
- Hardcoded colour utilities (`bg-white`, `text-white`, `bg-black`, `text-emerald-*`, `border-gray-*`) are treated as defects in updated surfaces.

### AD-6: Media and channel specs
- `MediaAsset` stores storage key + extracted metadata (`mime`, `bytes`, `width`, `height`, `durationSec`, `checksum`, `scanStatus`).
- `StorageAdapter` interface with a local/dev driver and a production driver (S3-compatible/R2/Cloudinary). Signed direct uploads; server confirms and validates.
- `ChannelSpec` rows define field keys, types, required flags, MIME allowlist, byte limits, dimension/aspect rules, duration rules, and help text. `partnerId` may override a channel default.
- Validation is data-driven from `ChannelSpec` plus a server-side media inspector (`sharp` for images; an ffprobe-based worker for audio/video). If ffprobe cannot be provisioned, audio/video duration is captured from provider metadata and flagged for manual review — this is a deployment risk to confirm in Phase 0.

---

## Implementation Steps

### Phase 0: Decisions, ADRs, and spikes (no feature code)
1. **Resolve the gating business decisions** and record them in this plan's Decisions Log.
   - USDC network(s) and provider shortlist; custody and payout responsibilities.
   - Fee schedule, minimums, refunds, and who bears FX movement.
   - KYC/AML ownership; 2FA recovery policy when identity verification is unavailable.
   - Canonical palette (recommendation: obsidian/gold).
   - Ranking weights and moderation SLA.
   - *Dependencies:* None. Blocks all other phases.
2. **Spike the provider integration** in a throwaway branch: sandbox on-ramp session, sandbox payout, webhook signature verification, one reconciliation query.
   - *Dependencies:* Step 1.
3. **Spike media validation**: confirm `sharp` metadata extraction and an ffprobe-capable runtime (local + target host). Document fallback.
   - *Dependencies:* None; parallel with Step 2.
4. **Audit the UI token surface**: inventory every hardcoded colour in `src/app/**` and `src/components/**`; produce a mapping table old → token.
   - *Dependencies:* Step 1 (palette).
5. **Write ADRs** in `.agents/agent-plans/adr/` for money, ledger, custody, auth context, tokens, and media.
   - *Dependencies:* Steps 1–4.
6. **Exit gate:** signed decisions log, provider spike notes, media spike notes, token inventory, ADRs. No schema migration starts before this gate.
   - *Dependencies:* Steps 1–5.

### Phase 1: Foundation (Milestone 1)
7. **Add the money module** `src/lib/money.ts` with decimals map, parse/format/arithmetic, and unit tests covering NGN kobo, USDC 6-dp, rounding rejection, and overflow.
   - *Dependencies:* Phase 0 exit.
8. **Add a money formatter** `formatMoney`/`MoneyText` and replace `src/lib/format.ts` NGN-only usage. Remove raw `₦` literals from screens touched in this phase.
   - *Dependencies:* Step 7.
9. **Schema migration (additive):** add `currency`, `network`, `amountMinor`/`grossMinor`/`feeMinor`/`netMinor` columns and new ledger tables. Keep legacy columns temporarily.
   - *Dependencies:* Step 7.
10. **Backfill script** in `scripts/backfill-money.ts`: multiply whole-Naira `Int` by 100, set currency `NGN`, verify row counts and totals against the old columns.
    - *Dependencies:* Step 9.
11. **Ledger service** `src/server/ledger/` with balanced-transaction creation, idempotency keys, derived balance queries, and a rebuild command. Unit tests must assert every transaction sums to zero.
    - *Dependencies:* Step 9.
12. **Switch financial reads** to ledger + money DTOs: `src/server/data/finance.ts`, `src/server/actions/finance.ts`, wallet page data source. Keep legacy writes dual-writing during transition.
    - *Dependencies:* Steps 10, 11.
13. **Session context:** add `ctx` to the signed payload, `requireContext()` guard, and switch-context server action with authorization tests. Update `src/proxy.ts` only as optimistic routing; real checks stay in pages/actions.
    - *Dependencies:* None; parallel with Step 7.
14. **User profile fields:** `username @unique`, `avatarUrl`, `coverUrl`, `themePreference`, `locale`; add reserved-username validation and uniqueness error handling.
    - *Dependencies:* Step 9.
15. **Unified tokens:** migrate `globals.css` to one token set, map daisyUI semantic colours, keep functional colours, delete `--portal-*` after alias migration. Update `ThemeToggle` to apply `data-theme` without flash and persist to the user record when signed in.
    - *Dependencies:* Phase 0 Steps 4–5; parallel with Step 7.
16. **Test harness:** add `typecheck`, `lint`, and `test:e2e` scripts; add Playwright with a smoke spec for login → portal → booster switch once Step 13 exists. Add CI steps.
    - *Dependencies:* None; parallel.
17. **Foundation exit gate:** migration verified on a staging copy; ledger tests green; both themes render on portal/booster/admin/marketing home; typecheck/lint/test green.
    - *Dependencies:* Steps 7–16.

### Phase 2: USDC wallet and security
18. **Provider adapter + config** (`src/server/payments/`) and env validation; no UI yet.
    - *Dependencies:* Phase 1 exit; Phase 0 Step 2.
19. **Advertiser wallet models:** `PayoutDestination`, generalized `Withdrawal` with `userId`, `WalletTransaction` types (`ONRAMP`, `PAYOUT`, `ESCROW_LOCK`, `ESCROW_RELEASE`, `REFUND`, `FEE`), and status enums.
    - *Dependencies:* Step 18.
20. **Fund wallet flow:** amount entry in NGN with live USDC quote, provider session, pending state, webhook confirmation, receipt.
    - *Dependencies:* Steps 11, 18, 19.
21. **Withdraw flow:** destination address + network, validation, fee preview, confirmation summary, step-up TOTP, pending/paid/failed states, duplicate-submission prevention.
    - *Dependencies:* Step 19; Step 22 for step-up.
22. **TOTP 2FA:** enrolment (QR + manual key), confirmation, recovery codes, disable/replace, encrypted secret storage, rate limits, audit.
    - *Dependencies:* Phase 1 Step 13.
23. **Step-up guard** applied to withdrawals, address changes, password/email changes, payout destination changes.
    - *Dependencies:* Step 22.
24. **Wallet UI** replacing the mock page: real balances, transaction history with filters, empty/error/loading states, network badge, copy/QR for deposit address.
    - *Dependencies:* Steps 20–23.
25. **Admin reconciliation:** provider event log, unmatched events, manual match, payout review queue. Extend `src/app/(admin)/admin/finance/`.
    - *Dependencies:* Step 20.

### Phase 3: AdBooster profile and marketplace
26. **Normalize profile data:** `BoosterService`, `ServicePackage`, `PortfolioItem`, `BoosterAvailability`; migrate `categoriesJson`/`portfolioJson`/`ratesJson` into rows while keeping JSON fallback during transition.
    - *Dependencies:* Phase 1 exit.
27. **Public profile page** at `/portal/adboosters/[handle]` (or `/adboosters/[handle]` if public browsing is desired): cover, avatar, name/handle, bio, location, specialisations, services/packages, portfolio, experience, completed count, ratings, availability, engage CTA.
    - *Dependencies:* Step 26.
28. **Profile editor** upgrade in `src/app/booster/profile/edit/`: image uploads, structured services/packages, portfolio items, location, availability; validation via Zod.
    - *Dependencies:* Step 26; Phase 5 Steps 40–41 for uploads (may use URL fallback until then).
29. **Marketplace discovery** replacing the hardcoded `/portal/adboosters`: profile cards, search, filters (service, location, price, expertise, availability, verification), sort. Server-side query with indexes and pagination.
    - *Dependencies:* Step 27.
30. **Social actions:** `ProfileLike`, `ProfileComment` (threaded, moderation state), `Recommendation` (unique from→to), with rate limits and self-action blocks.
    - *Dependencies:* Step 29.
31. **Reviews:** `ProfileReview` with `verifiedJobId?`, distinct verified badge, one review per user per booster per engagement, moderation queue, aggregate recalculation job.
    - *Dependencies:* Step 30.
32. **Reports and moderation:** `ContentReport`, admin queue, hide/restore/ban actions, audit. Applies to comments, reviews, profiles, portfolio.
    - *Dependencies:* Step 30.
33. **Ranking engine** `src/lib/marketplace-ranking.ts`: documented weight config, inputs (verified review score/count, completed work, responsiveness, recommendation count, recency, report penalty, verification level), anti-manipulation caps, deterministic tests.
    - *Dependencies:* Steps 30–32.
34. **Admin marketplace console** under `/admin/adboosters`: verification, moderation, ranking overrides, abuse signals.
    - *Dependencies:* Steps 31–33.

### Phase 4: Settings, switching, theme completion
35. **Profile Settings expansion:** avatar, username, email change with verification, password change with current-password check, notification prefs (existing), theme preference, danger zone (deactivate/delete request).
    - *Dependencies:* Phase 1 Step 14.
36. **AdBooster create/switch:** create-profile entry point, switch toggle, separate dashboards/data, explicit denial when the context is unauthorized, audit events.
    - *Dependencies:* Phase 1 Step 13; Step 35.
37. **Theme audit and finish:** replace remaining hardcoded colours in all AdBooster and shared components; contrast checks (WCAG AA) in both themes; persistence across devices via `themePreference`.
    - *Dependencies:* Phase 1 Step 15.

### Phase 5: Channel advertisement builder and media
38. **Channel spec model and seed:** `ChannelSpec` rows for Radio, TV, Podcast, Newspaper, Static Billboard, Digital Billboard, News/Online, with required fields and media rules; partner overrides.
    - *Dependencies:* Phase 0 Step 3; Phase 1 exit.
39. **Storage adapter + `MediaAsset` + upload endpoints:** signed upload, server confirm, checksum, scan status.
    - *Dependencies:* Step 38.
40. **Media inspector:** `sharp` for images; ffprobe worker (or documented fallback) for audio/video; returns dimensions/duration/codec; feeds spec validation.
    - *Dependencies:* Step 39.
41. **Dynamic builder** replacing/extending `CampaignCreateModal.tsx`: channel first, then only relevant fields; required markers; per-channel sections; supporting files; draft autosave.
    - *Dependencies:* Steps 38–40.
42. **Preview and validation UX:** image preview, video player, audio playback, written-copy review, inline errors that state the rule and the fix.
    - *Dependencies:* Step 41.
43. **Submission summary and lifecycle:** final summary, submit, approval status, revision request, resubmission; server-side validation is authoritative.
    - *Dependencies:* Step 42.
44. **Admin channel-spec management** under `/admin/inventory` or a new `/admin/channel-specs`: edit specs without deploys, audit changes.
    - *Dependencies:* Step 38.
45. **Provider-config enforcement:** reject unsupported specs per selected partner; show the partner's actual limits.
    - *Dependencies:* Steps 41, 44.

### Phase 6: QA and staged release
46. **Automated coverage:** unit tests for money, ledger, ranking, spec validation; integration tests for wallet/withdraw/2FA/switch; Playwright for fund → create → submit and profile → review → rank.
    - *Dependencies:* All phases.
47. **Non-functional pass:** responsive at 360/768/1280+, keyboard navigation, focus states, screen-reader labels, contrast, empty/error/loading states, no secrets in logs.
    - *Dependencies:* All phases.
48. **Security review:** authorization matrix per route/action, IDOR checks, rate-limit verification, webhook signature tests, duplicate-submission tests, audit completeness.
    - *Dependencies:* All phases.
49. **Staged rollout:** staging migration rehearsal, provider sandbox → production allowlist, feature flags for wallet/marketplace/builder, rollback plan.
    - *Dependencies:* Steps 46–48.

---

## Relevant Files & Symbols

- `prisma/schema.prisma` — `Wallet`, `WalletTransaction`, `LedgerEntry`, `Withdrawal`, `BoosterProfile`, `Rating`, `Campaign`, `MediaInventory`, `MediaSlot`, `User`; add money columns, ledger tables, `PayoutDestination`, `TwoFactorSecret`, `StepUpToken`, `MediaAsset`, `ChannelSpec`, marketplace social/review/report tables, `FxQuote`, `ProviderEvent`.
- `prisma/seed.ts` — seed channel specs, demo AdBooster profiles/services, wallet/ledger fixtures, ranking inputs.
- `src/lib/money.ts` (new) — decimals map, arithmetic, parse/format, `MoneyDTO`.
- `src/lib/format.ts` — current NGN-only formatter; replace usage with `formatMoney`.
- `src/server/ledger/` (new) — `postTransaction`, `getIdempotentTransaction`, `getBalance`, `rebuildBalances`.
- `src/server/payments/` (new) — provider adapter, webhook verification, reconciliation queries.
- `src/app/api/webhooks/[provider]/route.ts` (new) — signed webhook ingestion.
- `src/lib/session.ts`, `src/lib/auth.ts`, `src/lib/session-constants.ts`, `src/proxy.ts` — add `ctx`, `requireContext()`, switch action, step-up guard.
- `src/server/actions/finance.ts` — replace Naira `Int` writes and strings; route withdrawals through ledger + step-up.
- `src/server/data/finance.ts` — switch to ledger-derived balances and money DTOs.
- `src/app/(portal)/portal/wallet/page.tsx` — replace mock with server-backed wallet.
- `src/app/(portal)/portal/settings/SettingsClient.tsx`, `src/server/actions/account.ts` — expand profile settings.
- `src/app/globals.css`, `src/components/ThemeToggle.tsx`, `src/app/layout.tsx` — unify tokens, remove duplicated palettes, eliminate theme flash.
- `src/app/booster/profile/edit/BoosterProfileForm.tsx`, `src/server/actions/booster.ts`, `src/app/booster/profile/page.tsx` — structured profiles, uploads, public view.
- `src/app/(portal)/portal/adboosters/page.tsx` — replace hardcoded programme page with discovery.
- `src/lib/channels.ts` — reuse catalog; extend with spec references.
- `src/components/portal/CampaignCreateModal.tsx` — channel-driven dynamic builder.
- `src/lib/mediaPlatform.ts` — currently unused wallet helper; refactor or retire.
- `src/lib/__tests__/*` — extend money/ledger/ranking/spec tests.
- `package.json` — add `typecheck`, `lint`, `test:e2e`; add dependencies only after Phase 0 approval (TOTP, payment SDK, storage SDK, Playwright, ESLint).
- `src/app/(admin)/admin/finance/`, `src/app/(admin)/admin/trust/`, `src/app/(admin)/admin/adboosters/` — reconciliation, moderation, ranking overrides.

Reuse patterns: server-action + Zod + `getSession()` + `AuditLog`/`ActivityLog` pattern from `src/server/actions/finance.ts` and `src/server/actions/booster.ts`; pure-function + unit-test pattern from `src/lib/finance.ts` and `src/lib/__tests__/finance.test.ts`.

---

## Verification Plan

1. **Automated**
   - `npm test` — existing and new unit tests (money, ledger balance invariants, ranking determinism, spec validation, allocation logic).
   - `npx tsc --noEmit` — add as `npm run typecheck`.
   - `npm run lint` — add ESLint per the installed Next 16 documentation in `node_modules/next/dist/docs/`.
   - `npm run test:e2e` — Playwright: login, fund wallet (sandbox), withdraw with TOTP, switch account, create channel advert with upload, marketplace review + moderation.
   - Migration rehearsal on a staging copy, comparing backfilled totals against legacy columns.
2. **Manual**
   - Fund/withdraw happy path, provider failure, webhook replay, duplicate submit, wrong network address, expired step-up.
   - 2FA enrol, lost device, recovery code, disable/re-enable.
   - Profile create/edit/view, marketplace filter/search, like/comment/review/recommend/report, verification badge.
   - Ad builder for all eight channels: correct fields only, required markers, bad file type/size/dimension/duration errors, previews, draft resume, submission status.
   - Both themes on marketing, auth, portal, booster, admin; contrast and focus visible.
   - Responsive at 360, 768, 1024, 1440.
3. **Acceptance mapping**
   - Every clause in `doc/ADVERS_Technical_Development_Brief.docx` §10 must have a named test or a manual checklist item before Phase 6 exit.

---

## Effort Estimate (indicative)

| Milestone | Build effort | Notes |
|---|---|---|
| Phase 0 — decisions & spikes | 2–3 weeks | Business/legal lead time excluded |
| Phase 1 — foundation | 3–5 weeks | Money migration + ledger + tokens + context |
| Phase 2 — wallet & security | 6–9 weeks | Depends on provider sandbox access |
| Phase 3 — profiles & marketplace | 6–9 weeks | Ranking and moderation are the long poles |
| Phase 4 — settings, switching, theme | 2–3 weeks | After foundation |
| Phase 5 — ad builder & media | 7–10 weeks | Storage + ffprobe + spec config |
| Phase 6 — QA & release | 4–6 weeks | Includes staging rehearsal |
| **Total** | **~30–45 person-weeks** | With 2 full-stack devs + designer: ~5–7 months |

---

## Context & Decisions Log

- **2026-11-24**: User asked for a review of `doc/ADVERS_Technical_Development_Brief.docx` and a plan.
- **2026-11-24**: User decision — "Regulated on/off-ramp provider. Provider holds custody and handles card/bank on-ramp, KYC and payouts; ADVERS keeps an authoritative internal ledger and calls provider APIs/webhooks."
- **2026-11-24**: User decision — "NGN pricing + USDC settlement quote. Keep NGN list prices, lock an FX quote at checkout, store both amounts and the rate on the transaction."
- **2026-11-24**: User decision — "Foundation first. Phase 0 decisions + money/ledger migration, design tokens, account context, and test harness."
- **2026-11-24**: User decision — "Full implementation plan" as the deliverable.
- **2026-11-24**: User instruction — "exicute the phase 0 so wer can enter another phase". Phase 0 artifacts produced; application code and schema intentionally unchanged.
- **2026-11-24**: Phase 0 agent recommendations awaiting sign-off: Polygon PoS primary network; Yellow Card primary provider; obsidian/gold canonical palette; Resend for transactional email; signed-in-only profile browsing in v1; support-assisted 2FA recovery until provider KYC is confirmed.
- **2026-11-24**: User sign-off — network: "Polygon PoS primary (Recommended)".
- **2026-11-24**: User sign-off — provider: "Yellow Card primary (Recommended)".
- **2026-11-24**: User sign-off — palette: "Obsidian/gold canonical (Recommended)".
- **2026-11-24**: User sign-off — remaining defaults: "Accept all recommendations (Recommended)". This accepts the 10-minute FX lock, provider-owned KYC, support-assisted 2FA recovery, ranking weights 35/20/15/10/10/5/5, Resend email, signed-in-only profiles, refunds at original USD value, and pure-Node media validation with ffmpeg deferred.
- **2026-11-24**: Environment check — MySQL host reachable (Aiven, port 28393). Phase 1 migration rehearsal is technically possible; take a snapshot/staging copy before applying.
- **2026-11-24**: User instruction — "start Phase 1 now in this session". Phase 1 core executed.
- **2026-11-24**: Database backup taken (43 tables, 282 rows); baseline migration recorded; Phase 1 additive migration applied; 60 legacy money rows backfilled and verified; ledger smoke test passed.
- **2026-11-24**: Phase 1 deferrals accepted for the milestone: legacy `Int` remains the UI read source until Phase 2; route adoption of `requireContext` is Phase 2/4; theme persistence is Phase 4; ESLint/Playwright are Phase 6.
- **2026-11-25**: User instruction — "start Phase 2". Phase 2 core executed against the mock provider.
- **2026-11-25**: Three additive Phase 2 migrations applied after a fresh database backup; Phase 2 wallet and security smoke tests passed.
- **2026-11-25**: Phase 2 production path remains gated on Yellow Card sandbox credentials, D-07 fee percentages, D-15 minimums, and a Redis-backed rate limiter.
- **2026-11-25**: User instruction — "Harden Phase 2". Implemented DB-backed rate limiting, EIP-55 checksums, admin reconciliation/wallet controls, recovery-code flow, notifications, CSV statements, and webhook hardening.
- **2026-11-25**: `20261125150000_phase2_hardening` applied after a fresh database backup; 67/67 tests, typecheck, build, wallet/security smoke, and page render checks passed.
- **2026-11-25**: User instruction — "Start Phase 3". Initial AdBooster profile and marketplace slice executed.
- **2026-11-25**: `20261125160000_phase3_marketplace` applied after a fresh backup; 8 demo profiles seeded; 76/76 tests, typecheck, build, and marketplace/profile/admin render checks passed.
- **2026-11-25**: User instruction — "okay lt do phase 4 , 5 then 3". Phase 4 executed first.
- **2026-11-25**: `20261125170000_phase4_account_settings` applied after a fresh backup; dual-role demo seeded; settings, switching and email-confirm pages verified.
- **2026-11-25**: User instruction — "go on with phase 5 , then 3". Phase 5 executed.
- **2026-11-25**: `20261125180000_phase5_media_channel_specs` applied after a fresh backup; 42 channel fields seeded; media smoke passed; 83/83 tests and build passed.
- **2026-11-25**: User instruction — "go on with phase 3". Structured services/packages/portfolio and direct engagement requests executed.
- **2026-11-25**: `20261125190000_phase3_services_requests` applied after a fresh backup; 12 services and 6 portfolio items backfilled; 87/87 tests and build passed.
- **2026-11-25**: User instruction — "continue with the remaining Phase 3 refinements first before pahase 6". Round 2 refinements executed.
- **2026-11-25**: `20261125200000_phase3_refinement_final` applied after a fresh backup; 88/88 tests and build passed.
- **2026-11-25**: User instruction — "go on with phase 6". QA and release-readiness executed.
- **2026-11-25**: Playwright E2E added (4/4 passing), full smoke suite passed, security headers and session/rate-limit hardening applied.

## Key Decisions & Trade-offs

- **Additive money migration over in-place rename:** slower, but keeps production financial data readable and rollback-safe. Legacy `Int` columns are removed only after read cutover and reconciliation.
- **Ledger as source of truth:** wallet balances become projections. Adds upfront complexity but is required for escrow, fees, refunds, and provider reconciliation.
- **Provider custody:** removes key-management/compliance build-out, at the cost of provider dependency, fees, and coverage limits in Nigeria.
- **NGN pricing + USDC settlement:** keeps vendor payouts and tax predictable; requires FX quote storage and an explicit policy for quote expiry and who bears movement.
- **Explicit session context instead of overloaded roles:** avoids privilege escalation and keeps one login for both experiences.
- **Normalized marketplace tables instead of JSON blobs:** enables filtering, ranking, moderation, and integrity constraints; requires a backfill from `categoriesJson`/`portfolioJson`/`ratesJson`.
- **Data-driven channel specs:** avoids hardcoding provider rules; adds an admin surface and a migration path for existing inventory.
- **Foundation milestone as a hard gate:** delays visible features by ~5–8 weeks but prevents a second money migration and a second auth redesign.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Compliance/legal rejects USDC model | Blocks Phase 2 | Phase 0 sign-off before any wallet code |
| Provider lacks Nigerian on/off-ramp or payouts | Blocks deposits/withdrawals | Shortlist + sandbox spike in Phase 0; fallback documented |
| Money migration corrupts balances | Critical | Additive columns, backfill script, staging rehearsal, reconciliation report, rollback plan |
| `BigInt` serialization breaks client components | Runtime errors | `MoneyDTO` string boundary + lint rule/review checklist |
| ffprobe unavailable on host | No reliable duration/dimension validation | Phase 0 spike; provider-metadata fallback + manual review |
| Account switching creates privilege escalation | Security | Deny-by-default `requireContext()`, authorization matrix tests, audit events |
| Marketplace review/recommendation abuse | Trust/ranking integrity | Unique constraints, rate limits, verified-job weighting, report queue, ranking caps |
| Token unification causes visual regressions | Broad UI blast radius | Token inventory, per-shell screenshots, phased page migration |
| Scope creep into sponsored placement/native apps | Timeline | Explicit non-goals; Phase 0 change control |

## Open Items

Resolved in Phase 0 sign-off:
- Network: **Polygon PoS primary**.
- Provider: **Yellow Card primary**; Transak/MoonPay backup.
- Palette: **obsidian/gold canonical**.
- Ranking weights: **35/20/15/10/10/5/5**.
- Public profiles: **signed-in only in v1**.
- Email: **Resend**.
- Media runtime: **pure-Node V1**; ffmpeg worker deferred to V2.
- Refunds: **original USD value**, ledger reversal.

Still open:
1. **Fee percentages and minimum deposit/withdrawal** — Finance, blocks Phase 2 production pricing/withdrawal validation.
2. **Moderation SLA** — Product, blocks Phase 3 launch criteria.
3. **Storage vendor and scan provider** (S3-compatible/R2/Cloudinary + antivirus hook) — blocks Phase 5.
4. **Yellow Card sandbox credentials and KYB onboarding** — blocks the real provider adapter and Phase 2 production.
5. **Provider confirmation** that USDC payouts to external Polygon wallets are supported for a Nigerian business.
6. **Real Yellow Card adapter** — map on-ramp, payout, and webhook signature endpoints.
7. **Pre-payout finance approval** — the current flow calls the provider on request; add an approval gate before real payouts.
8. **Scheduled reconciliation job** — the admin queue is manual; add a worker for failed events and stale pending withdrawals.
9. **Email/SMS delivery adapter** — notifications create channel rows but nothing sends them yet.
10. **Contract-address detection** — EIP-55 format validation is in place; detecting contracts needs an RPC provider.
11. **Schedule `npm run cleanup:phase2`** — expired rate-limit buckets, step-up tokens, and FX quotes.
12. **Marketplace pagination at scale** — move rank scoring into SQL or a materialized table beyond 120 candidates.
13. **Moderation appeals/history** — bulk actions exist; add appeals and moderator assignment.
14. **Service platform filter** — category filtering is in place; add platform-level filtering.
15. **Sponsorship billing** — the sponsored flag is operational but not monetised.
16. **Portfolio ordering controls** — media items sort by upload order.
17. **Read-receipt notifications** — advertisers do not yet see when a Booster viewed a request.
18. **Server-rendered theme** — apply the saved preference before hydration to remove the first-paint flash; complete manual WCAG AA checks.
19. **Email delivery + logged-out verification redirect** — connect Resend/SES and preserve `next` through login.
20. **Avatar media uploads** — URL-only today; wire to Phase 5 storage.
21. **Per-device session management** — `sessionVersion` revocation exists; add a device list.
22. **Stricter booster route context** — redirect USER-context sessions away from Booster routes unless onboarding.
23. **Production media storage** — replace `public/uploads` with S3/R2/Cloudinary and signed direct uploads.
24. **Server-side audio/video probing** — add `music-metadata`/`mp4box` or an ffprobe worker; client metadata is trusted in v1.
25. **Antivirus/media scan hook** — assets are created with `scanStatus=PENDING`.
26. **Partner-level channel overrides** — specs are per channel today; add `partnerId` overrides.
27. **Campaign media gallery** — surface `CampaignMediaAsset` on campaign detail.
28. **Thumbnails/transcoding** — generate poster frames and compressed variants.
29. **CSP + external penetration test** — baseline security headers are in place; CSP is not.
30. **Staging rehearsal** — run migrations, smokes and E2E against a production-shaped staging environment.
31. **Manual accessibility pass** — axe/Lighthouse, screen-reader and WCAG AA contrast checks.
32. **ESLint** — no ESLint configuration is committed; current gate is typecheck + tests + build.
33. **Load/performance testing** — marketplace ranking, wallet webhooks and upload endpoints.

Resolved during Phase 1/2/3/4/5/6:
- Database backup taken before each migration; migrations are additive and applied.
- Wallet, ledger, 2FA and step-up foundations are in place.
- MySQL-backed rate limiting, admin reconciliation, wallet freeze/close, recovery-code flow, CSV statements, and webhook attempt tracking are in place.
- AdBooster profiles, marketplace discovery, likes/comments/reviews/recommendations, reports, ranking, and moderation are in place.
- Profile settings, account switching, theme persistence, email-change tokens, password change and danger-zone controls are in place.
- Channel-specific specs, media uploads, previews, validation and admin spec management are in place.
- Structured services, packages, portfolio records, and direct advertiser-to-Booster engagement requests are in place.
- Portfolio media uploads, package includes, service-aware filters, request→job conversion, read receipts, ranking overrides, sponsored labels, bulk moderation, and recommendation anti-abuse are in place.
- Playwright E2E, security headers, mandatory session versioning, and the full smoke suite are in place.
