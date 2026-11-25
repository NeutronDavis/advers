# Phase 2 Hardening — Completion Note

**Date:** 2026-11-25
**Status:** Complete for the mock-provider path. Remaining production blockers are external (Yellow Card, commercial numbers, email delivery).

---

## 1. What shipped

### Database-backed rate limiting
- New `RateLimitBucket` model with atomic MySQL `INSERT … ON DUPLICATE KEY UPDATE`.
- `src/server/security/rate-limit.ts` — shared limiter across processes.
- `src/lib/rate-limit.ts` — policy + in-memory test store.
- Applies to funding, payout addresses, TOTP attempts, withdrawals, and 2FA enrolment/recovery.
- `npm run cleanup:phase2` removes expired buckets, used/expired step-up tokens, and expires stale FX quotes.

### Address hardening
- EIP-55 checksum validation via `@noble/hashes` (`keccak_256`).
- Mixed-case addresses must match the checksum; all-lower/all-upper input is accepted and normalized to checksum form.
- Zero address rejected.
- `addPayoutDestinationAction` stores the checksummed address, so duplicates are caught regardless of input case.
- **Not covered:** contract-address detection (needs an RPC provider) and provider-side network attestation.

### Admin reconciliation and controls
- New `/admin/reconciliation` page with:
  - failed/unprocessed provider-event queue, retry and ignore actions;
  - advertiser withdrawal queue with **Mark paid** and **Fail & refund**;
  - pending funding requests;
  - wallet list with **Activate / Freeze / Close** controls.
- `src/server/actions/reconciliation.ts` requires staff, writes activity logs, and revalidates.
- `reverseWithdrawalById` added to the payment processor for finance recovery.
- `ProviderEvent` now tracks `attempts` and `lastAttemptAt`.
- Added **Reconciliation** to the admin sidebar.

### Recovery-code flow
- `recoverTwoFactorAction` consumes a one-time recovery code, disables 2FA, writes an activity log, and notifies the user.
- `/portal/settings/security` now has a **Lost your authenticator?** form.
- Recovery codes are now functional instead of write-only.

### Notifications
- In-app notifications for: wallet funded, funding failed, withdrawal submitted, withdrawal paid, withdrawal failed, 2FA enabled/disabled, recovery code used, recovery codes regenerated, wallet frozen/closed.
- `dispatchNotificationSafe` ensures a notification failure can never roll back a ledger movement.

### Statement export
- `GET /portal/wallet/statement` returns a CSV of the signed-in user's wallet transactions.
- `src/lib/csv.ts` handles quotes, commas, and newlines.
- **Export statement** button added to the wallet header.

### Webhook hardening
- 256 KB payload limit.
- Signature verification before parsing.
- `attempts` and `lastAttemptAt` recorded per event.
- Duplicate PROCESSED/IGNORED events return 200 without reprocessing.
- Processed/failed state and error text persisted for the reconciliation queue.

### Migration
- `20261125150000_phase2_hardening` — `ProviderEvent.attempts`, `ProviderEvent.lastAttemptAt`, `RateLimitBucket`.
- Applied after a fresh database backup.

---

## 2. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **67/67 passed** (added EIP-55, CSV, DB-limit policy tests) |
| `npm run build` | Passed |
| `npm run wallet:smoke` | Passed; funding → withdrawal → PAID, notifications, cleanup |
| `npm run security:smoke` | Passed; TOTP, step-up, recovery code, DB rate limit |
| `npm run cleanup:phase2` | Passed |
| `/admin/reconciliation` | 200, page renders |
| `/portal/wallet` | 200, export control present |
| `/portal/wallet/statement` | 200, `text/csv`, correct header row |
| `POST /api/webhooks/mock` without signature | 401 |

---

## 3. Files added

- `src/server/security/rate-limit.ts`
- `src/server/data/reconciliation.ts`
- `src/server/actions/reconciliation.ts`
- `src/app/(admin)/admin/reconciliation/{page.tsx,ReconciliationClient.tsx}`
- `src/app/(portal)/portal/wallet/statement/route.ts`
- `src/lib/csv.ts`
- `scripts/cleanup-phase2.ts`
- Tests: `csv.test.ts`; expanded `rate-limit.test.ts`, `wallet.test.ts`, `security-smoke.ts`
- Migration: `20261125150000_phase2_hardening`

## 4. Files modified

- `prisma/schema.prisma`
- `src/lib/rate-limit.ts`, `src/lib/wallet.ts`, `src/lib/notifications.ts`
- `src/server/payments/processing.ts`, `src/app/api/webhooks/[provider]/route.ts`
- `src/server/actions/{wallet,two-factor}.ts`
- `src/app/(portal)/portal/settings/security/SecurityClient.tsx`
- `src/app/(portal)/portal/wallet/WalletClient.tsx`
- `src/app/(admin)/AdminShell.tsx`
- `package.json` (`@noble/hashes`, `cleanup:phase2`)

---

## 5. Remaining production blockers

1. **Yellow Card adapter** — still a stub; needs sandbox endpoints, payout contract, and signature mapping.
2. **Real FX quotes** — currently `MOCK_NGN_PER_USDC`; replace with provider quotes and expiry handling.
3. **Fee percentages and minimums** — D-07 and D-15.
4. **Email/SMS delivery** — notifications create channel rows, but no provider adapter sends them.
5. **Contract-address detection** — requires an RPC provider; current validation is format + EIP-55 only.
6. **Withdrawal approval-before-payout** — current flow calls the provider on request; a finance pre-approval step should be added before real money.
7. **Automated reconciliation job** — the admin queue is manual; add a scheduled job for failed events and pending withdrawals.
8. **Rate-limit cleanup scheduling** — run `npm run cleanup:phase2` from cron/worker.

---

## 6. How to run

```bash
npm run db:migrate
npm run typecheck
npm test
npm run wallet:smoke
npm run security:smoke
npm run cleanup:phase2
npm run build
npm run dev
```

Admin verification: sign in as `admin@advers.ng` → `/admin/reconciliation`.
Advertiser verification: sign in as `client@advers.ng` → `/portal/wallet` → export statement; `/portal/settings/security` → recovery-code flow.
