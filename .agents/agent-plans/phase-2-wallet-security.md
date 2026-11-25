# Phase 2 — USDC Wallet & Security: Completion Note

**Date:** 2026-11-25
**Status:** Core complete against the **mock provider**. Yellow Card adapter is a deliberate stub until sandbox credentials exist.
**Database:** Aiven MySQL `advers` — fresh backup taken, three additive Phase 2 migrations applied.

---

## 1. What shipped

### Provider abstraction
- `src/server/payments/types.ts` — provider contract (`createOnrampSession`, `createPayout`, `verifyWebhook`, `parseWebhook`).
- `src/server/payments/mock-provider.ts` — working sandbox provider with HMAC-SHA256 webhook signatures and a `signMockWebhook` helper.
- `src/server/payments/yellowcard-provider.ts` — explicit stub that refuses to run until the sandbox contract is mapped.
- `src/server/payments/index.ts` — env-driven factory (`PAYMENT_PROVIDER=mock|yellowcard`).
- `src/app/api/webhooks/[provider]/route.ts` — signed webhook ingestion, `ProviderEvent` persistence, duplicate detection, retry-safe processing.

### Ledger-backed wallet
- `src/server/payments/processing.ts` — `onramp.completed`, `onramp.failed`, `payout.paid`, `payout.failed`.
- `src/server/data/wallet.ts` — USDC wallet overview, ledger-derived balances, transactions, destinations, withdrawals, 2FA state, FX rate, fee.
- `src/server/actions/wallet.ts` — fund, mock completion, address add/default/disable, TOTP step-up, withdrawal request, available balance.
- Wallet is now per `(user, currency, network)`, so the legacy NGN wallet and the new USDC wallet coexist without a destructive rewrite.
- Every value movement posts a balanced ledger transaction with an idempotency key:
  - on-ramp: `AVAILABLE` credit / `PROVIDER_SETTLEMENT` debit;
  - withdrawal hold: `AVAILABLE` debit / `PAYOUT_CLEARING` credit;
  - payout: `PAYOUT_CLEARING` debit / `PROVIDER_SETTLEMENT` credit;
  - failure: reversing `REFUND`.

### Wallet UI
- `src/app/(portal)/portal/wallet/page.tsx` — server component, real data.
- `src/app/(portal)/portal/wallet/WalletClient.tsx` — balances, activity, payout addresses, fund modal, withdrawal modal, TOTP verification, statuses.
- `src/app/(portal)/portal/wallet/checkout/[reference]/page.tsx` + client — sandbox checkout that simulates the provider completing the on-ramp.
- Legacy NGN balance is displayed separately and never silently relabelled as USDC.

### 2FA and step-up
- `src/lib/totp.ts` — RFC 6238 SHA-1 TOTP, base32, otpauth URI, recovery codes.
- `src/lib/secret-box.ts` — AES-256-GCM encryption for authenticator secrets.
- `src/lib/step-up.ts` + `src/server/security/step-up.ts` — 5-minute, single-use, action-bound step-up tokens.
- `src/server/security/two-factor.ts` — enrol, confirm, verify, disable, regenerate recovery codes, consume recovery code.
- `src/server/actions/two-factor.ts` — server actions with rate limits and activity logs.
- `src/app/(portal)/portal/settings/security/` — enrolment, recovery codes, disable, regenerate UI.
- Settings now links to **Security & 2FA**.
- Withdrawals require a verified authenticator code; the step-up token is consumed before the payout is attempted.

### Rate limiting
- `src/lib/rate-limit.ts` — per-process limiter for funding, addresses, TOTP attempts, withdrawals.
- **Production limitation:** this must move to Redis or a database-backed limiter before launch.

### Migrations
| Migration | Purpose |
|---|---|
| `20261125120000_phase2_wallet_security` | `Wallet.status`, `WalletTransaction` provider/idempotency fields, `PayoutDestination`, `AdvertiserWithdrawal`, `TwoFactorSecret`, `StepUpToken` |
| `20261125130000_phase2_ledger_types` | Adds `DEPOSIT` and `PAYOUT` ledger types |
| `20261125140000_phase2_multiwallet` | One wallet per `(userId, currency, network)`; backfills `network='NONE'` |

---

## 2. Verification evidence

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **62/62 passed** (money, ledger, TOTP, secret box, step-up, wallet, rate limit, session context, existing suites) |
| `npm run build` | Passed (Next.js 16.4.5, Turbopack) |
| `npm run wallet:smoke` | Passed: fund 25 USDC via mock on-ramp → withdraw → PAID → balance 0; cleanup successful |
| `npm run security:smoke` | Passed: enrol, confirm, verify, single-use step-up, disable; cleanup successful |
| `prisma migrate status` | Up to date |
| `/portal/wallet` HTTP render | 200 with real wallet UI (“Available USDC”, “Fund wallet”) |
| `/portal/settings/security` HTTP render | 200 with 2FA UI |

---

## 3. Files added

- `src/lib/totp.ts`, `src/lib/secret-box.ts`, `src/lib/step-up.ts`, `src/lib/wallet.ts`, `src/lib/rate-limit.ts`, `src/lib/ledger-account-key.ts`
- `src/server/payments/{types,mock-provider,yellowcard-provider,index,processing}.ts`
- `src/server/security/{two-factor,step-up}.ts`
- `src/server/actions/{wallet,two-factor}.ts`
- `src/server/data/wallet.ts`
- `src/app/api/webhooks/[provider]/route.ts`
- `src/app/(portal)/portal/wallet/{page.tsx,WalletClient.tsx}`
- `src/app/(portal)/portal/wallet/checkout/[reference]/{page.tsx,MockCheckoutClient.tsx}`
- `src/app/(portal)/portal/settings/security/{page.tsx,SecurityClient.tsx}`
- `scripts/{wallet-smoke,security-smoke}.ts`
- Tests: `totp.test.ts`, `secret-box.test.ts`, `step-up.test.ts`, `wallet.test.ts`, `rate-limit.test.ts`
- Migrations: three Phase 2 migrations listed above

## 4. Files modified

- `prisma/schema.prisma`, `prisma/seed.ts`
- `src/lib/types/dto.ts` (Phase 1), `src/lib/mediaPlatform.ts` (wallet lookup)
- `src/app/(portal)/portal/settings/SettingsClient.tsx` (security link)
- `package.json`, `.env.example`, `.gitignore`

---

## 5. Deliberate deferrals / production blockers

1. **Yellow Card adapter is a stub.** `PAYMENT_PROVIDER=yellowcard` refuses to run until the sandbox on-ramp, payout, and signature contract is mapped (Phase 0 blockers).
2. **Mock FX rate.** `MOCK_NGN_PER_USDC=1600` is used for the quote. Replace with the provider rate before any real money.
3. **Fee percentages and minimums are not final.** `WITHDRAWAL_FEE_USDC=0`, `MIN_FUNDING_NGN=1000`, `MAX_FUNDING_NGN=10000000` are placeholders pending D-07/D-15.
4. **In-memory rate limiting.** Replace with Redis/DB before multi-instance deployment.
5. **Address validation is format-only.** No EIP-55 checksum, no contract-address detection, no provider-side network attestation.
6. **No admin reconciliation UI yet.** `ProviderEvent` rows are stored; an admin queue for failed/unmatched events is still needed.
7. **No withdrawal review queue.** Mock payouts settle instantly; real payouts will need finance review and a pending/processing queue.
8. **No email/notification fan-out** for funding, withdrawal, or 2FA changes beyond in-app activity logs.
9. **Recovery-code login UI** is not wired; the service (`consumeRecoveryCode`) exists.
10. **No wallet freeze/close admin action.**
11. **No CSV statement export / receipt PDF.**
12. **No real KYC flow**; provider-owned KYC is assumed (D-09).

---

## 6. How to run

```bash
npm run db:backup
npm run db:migrate
npm run typecheck
npm test
npm run wallet:smoke
npm run security:smoke
npm run build
npm run dev
```

Manual flow:
1. Sign in as `client@advers.ng` / `password123`.
2. Open `/portal/wallet`.
3. **Fund wallet** → enter NGN → Continue → **Simulate successful payment**.
4. Confirm the USDC balance and transaction history update.
5. Open `/portal/settings/security` → set up authenticator → scan/save the key → confirm the 6-digit code → save recovery codes.
6. Back on `/portal/wallet`, add a Polygon address, then **Withdraw** → enter amount → verify authenticator code → request.
7. Confirm the withdrawal reaches `PAID` and the balance decreases.

---

## 7. Rollback

All Phase 2 migrations are additive except the `Wallet` uniqueness swap:
1. Restore from the pre-Phase-2 JSON backup or the provider backup.
2. To reverse the multi-wallet change: drop `Wallet_userId_currency_network_key`, recreate `Wallet_userId_key` on `userId`, and set `network` back to nullable only after confirming no duplicate user wallets exist.
3. Drop Phase 2 tables (`StepUpToken`, `TwoFactorSecret`, `AdvertiserWithdrawal`, `PayoutDestination`) only after restoring.
4. Do not edit applied migration files; create a new corrective migration.
