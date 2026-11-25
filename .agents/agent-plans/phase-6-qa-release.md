# Phase 6 — QA & Release Readiness

**Date:** 2026-11-25
**Status:** QA complete on the development environment. Production release remains blocked by the external items in §5.

---

## 1. Test matrix and results

| Area | Command | Result |
|---|---|---|
| Type safety | `npm run typecheck` | Passed |
| Unit tests | `npm test` | **88/88 passed** |
| Production build | `npm run build` | Passed |
| Browser E2E | `npm run test:e2e` | **4/4 passed** |
| Wallet flow | `npm run wallet:smoke` | Funding → withdrawal → PAID; cleanup passed |
| 2FA/security | `npm run security:smoke` | TOTP, step-up, recovery code, DB rate limit passed |
| Media pipeline | `npm run media:smoke` | PNG stored, inspected, persisted, cleaned up |
| Ledger invariants | `npm run ledger:smoke` | Balanced transfer, idempotent replay, rebuild passed |
| Phase 1 data | `npm run verify:phase1` | Passed |
| Housekeeping | `npm run cleanup:phase2` | Passed |
| Migrations | `prisma migrate status` | Up to date |

### Playwright coverage
- Advertiser settings: account experience, danger zone, security link.
- Marketplace: discovery and public profile render.
- Campaign builder: Television channel shows only TV-specific requirements.
- Admin: channel specifications and reconciliation pages.

The E2E suite uses the system Chrome channel (`channel: "chrome"`), so no Playwright browser download is required.

---

## 2. Bugs found and fixed during QA

| Finding | Fix |
|---|---|
| Legacy session cookies without a version bypassed password-change revocation | Sessions now require a matching `sessionVersion`; legacy cookies are rejected |
| Password/email change and campaign create/draft had no rate limits | Added DB-backed limits |
| Engagement request creation had no activity audit entry | Added `ActivityLog` |
| Portfolio media additions were unbounded | Added 20-item cap and 20/hour limit |
| Ledger smoke left an empty provider-settlement account | Cleanup now removes zero-line system accounts |
| Phase 1 verifier flagged zero-line system accounts | Verifier now counts only system accounts with ledger lines |
| E2E login raced server-action navigation | `waitForURL(..., { waitUntil: "commit" })` |
| E2E selector matched both label and validation error | Exact selector fixed |

---

## 3. Security review

### Verified controls
- All admin actions are staff/admin guarded.
- Marketplace actions verify ownership/eligibility.
- Wallet actions require USER context and a client account.
- Withdrawals require a single-use step-up token and TOTP.
- TOTP secrets are AES-256-GCM encrypted; recovery codes are bcrypt-hashed.
- Provider webhooks verify signatures and persist events before processing.
- Money movements are idempotent and double-entry.
- Addresses are EIP-55 validated and checksum-normalized.
- Rate limits cover login-adjacent actions, TOTP, withdrawals, funding, comments, reviews, recommendations, reports, campaigns, media and portfolio.
- Session cookies are HttpOnly, SameSite=Lax, Secure in production.
- Security headers added: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

### Known security gaps
1. **No CSP.** A Content-Security-Policy needs a report-only rollout before production.
2. **205 MB Server Action body limit.** Required by the v1 upload path; production should use signed direct-to-storage uploads and a much smaller action limit.
3. **Media scan is pending.** No antivirus hook; assets are created with `scanStatus=PENDING`.
4. **Audio/video metadata is client-reported.** Images are server-inspected.
5. **Email delivery provider is missing.** Password reset/email verification links are not delivered in production.
6. **No per-device session list.** `sessionVersion` revokes all other sessions but cannot revoke one device.
7. **No full CSP/HSTS/pen-test.** Recommend an external penetration test before real money.

---

## 4. Accessibility and responsive review

Checked:
- Keyboard-accessible form controls and buttons.
- Labels/aria-labels on key inputs and icon buttons.
- Focus-visible rings on theme toggle and action buttons.
- Empty, error, loading and success states across wallet, marketplace, settings, media and admin queues.
- Responsive layouts at the grid/stack breakpoints used by the app.

Still outstanding:
- Automated axe/Lighthouse scan.
- Manual screen-reader pass on wallet, marketplace, campaign builder and admin moderation.
- WCAG AA contrast verification on every page in both themes.
- Mobile Safari / Firefox manual pass.

---

## 5. Production release blockers

1. **Yellow Card adapter** — on-ramp, payout and webhook contract not implemented.
2. **Real FX quotes** — mock rate is still used.
3. **D-07 fee percentages and D-15 minimums.**
4. **Production media storage** — local `public/uploads` is not durable/serverless-safe.
5. **Antivirus/media scanning.**
6. **Email/SMS delivery provider.**
7. **Pre-payout finance approval.**
8. **Scheduled reconciliation and rate-limit cleanup jobs.**
9. **CSP and external security review.**
10. **Staging environment rehearsal** with production-like provider sandbox.

---

## 6. Staged rollout plan

### Stage 0 — Release candidate
- Freeze migrations; take a production-shaped backup.
- Run `db:migrate`, `verify:phase1`, all smokes, unit tests, build and E2E on staging.
- Confirm env vars: `NEXTAUTH_SECRET`, `TOTP_ENCRYPTION_KEY`, `PAYMENT_PROVIDER`, `PAYMENT_WEBHOOK_SECRET`, `MAX_MEDIA_BYTES`.

### Stage 1 — Internal staff
- Deploy with `PAYMENT_PROVIDER=mock` (or sandbox) and wallet funding disabled for non-staff.
- Verify admin reconciliation, moderation, channel specs, withdrawals.
- Monitor provider events and ledger clearing accounts.

### Stage 2 — Selected advertisers
- Enable USDC funding/withdrawals behind an allowlist.
- Enable direct Booster requests and marketplace reviews for the pilot group.
- Monitor failed events, pending withdrawals, duplicate submissions and rate-limit hits.

### Stage 3 — General availability
- Switch on Yellow Card production credentials.
- Enable email delivery and media scanning.
- Publish the marketplace and channel builder to all users.

### Rollback
- Migrations are additive; no destructive migration is pending.
- Restore from the pre-deploy backup if a migration or backfill fails.
- Keep the previous build deployed until Stage 2 is stable.
- Drop new tables only after restoring data.

---

## 7. Go / no-go checklist

- [x] Typecheck
- [x] Unit tests
- [x] Build
- [x] E2E smoke
- [x] Wallet/security/media/ledger smokes
- [x] Migration status
- [x] Security header baseline
- [ ] CSP report-only + external pen test
- [ ] Yellow Card sandbox contract
- [ ] Fee/minimum decisions
- [ ] Production storage + media scan
- [ ] Email delivery
- [ ] Staging rehearsal

**QA verdict:** the application is functionally ready for a controlled staging/pilot rollout in mock/sandbox mode. It is **not** ready for real-money production until the blockers in §5 are closed.
