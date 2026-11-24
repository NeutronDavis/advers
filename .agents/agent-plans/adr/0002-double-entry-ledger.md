# ADR-0002: Double-Entry Ledger

**Status:** Proposed — pending sign-off
**Date:** 2026-11-24
**Deciders:** Engineering, Finance

## Context

`LedgerEntry` already exists with `type`, `status`, `payerId`, `payeeId`, `grossAmount`, `feeAmount`, `netAmount`, `currency` (default `NGN`), `reference` (unique), and optional campaign/job/booster links. It is a single-entry record with `Int` amounts. `Wallet.availableBalance` and `escrowBalance` are mutable integers updated by actions. `WalletTransaction` has free-string `type` and `status`.

The brief requires the ledger to record currency, amount, status, timestamps, fees, and transaction references. Escrow, refunds, platform fees, Booster payouts, and provider reconciliation all require balanced, auditable double-entry.

## Decision

1. **Ledger is the source of truth.** `Wallet.availableBalance`/`escrowBalance` become cached projections that can be rebuilt from ledger lines.
2. **Two-level model:**
   - `LedgerTransaction`: immutable header — `id`, `type`, `status`, `reference` (unique), `idempotencyKey` (unique), `fxQuoteId?`, `metadataJson?`, `createdAt`, `postedAt?`.
   - `LedgerLine`: `transactionId`, `accountId`, `direction` (`DEBIT` | `CREDIT`), `amountMinor`, `currency`, `network?`.
   - **Invariant:** for every transaction, sum(DEBIT) = sum(CREDIT) per currency. Enforced in code and asserted in tests; optionally by a DB trigger.
3. **Account types:** `AVAILABLE`, `ESCROW`, `PLATFORM_FEE`, `PAYOUT_CLEARING`, `PROVIDER_SETTLEMENT`, plus per-user sub-accounts. Accounts are created with the wallet, not ad hoc.
4. **Immutability:** never update or delete a posted line. Corrections are new reversing transactions (`REVERSAL`/`ADJUSTMENT`) referencing the original.
5. **Idempotency:** every external or user-triggered money action supplies an idempotency key; duplicate requests return the existing transaction. This is the primary defence against double withdrawal and webhook replay.
6. **Status model:** `PENDING` → `POSTED` → (`SETTLED` | `FAILED` | `REVERSED`). Provider events drive transitions; ADVERS never marks funds settled from a client callback alone.
7. **Provider events are persisted raw first.** `ProviderEvent` stores `provider`, `eventId` (unique), `type`, `payloadJson`, `signatureValid`, `processedAt`, `error`. Processing is idempotent and replayable.
8. **FX:** `FxQuote` stores `baseCurrency`, `quoteCurrency`, `rate`, `provider`, `expiresAt`, `lockedAt`. A transaction references exactly one quote when currencies differ.
9. **Balances:** `getBalance(accountId)` sums posted lines; a materialized projection and a `rebuildBalances` command exist for recovery.
10. **Escrow semantics:** funding a campaign posts AVAILABLE → ESCROW. Release posts ESCROW → PLATFORM_FEE + vendor/booster payable + refund as applicable, in one balanced transaction.

## Consequences

- Positive: auditable, reconcilable, correct under retries; supports escrow, fees, refunds, and payouts uniformly.
- Positive: provider settlement can be matched line-by-line.
- Negative: more tables and more code than mutable balances; every money flow must be modelled as a balanced transaction.
- Negative: existing `LedgerEntry` rows need a migration/backfill into the new model (or a legacy import transaction type).
- Operational: finance needs a reconciliation view (`/admin/finance`) showing unmatched provider events and non-zero clearing accounts.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep mutable wallet balances + single-entry log | Cannot prove correctness; retries and webhooks cause drift; refunds and fees are ambiguous |
| Event sourcing with no current-state tables | Overkill; harder queries and reporting |
| Third-party ledger (e.g., Blnk, Formance) | Extra service and operational burden; current scale does not justify it. Revisit if transaction volume grows |

## Open questions

- Whether escrow release is automatic on proof approval or finance-approved (recommendation: finance-approved in v1, with an audit trail).
- Rounding policy for fees when the price is NGN and settlement is USDC (recommendation: round fee up to the settlement currency's smallest unit, disclose in the quote).
