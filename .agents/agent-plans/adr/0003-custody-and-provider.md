# ADR-0003: USDC Custody and Provider Integration

**Status:** Proposed — pending provider selection
**Date:** 2026-11-24
**Deciders:** Product, Finance, Compliance, Engineering

## Context

The brief asks for USDC across deposits, withdrawals, campaign budgets, service payments, fees, and history, and explicitly warns that USDC networks are not interchangeable. The user selected a **regulated on/off-ramp provider** that holds custody while ADVERS keeps an authoritative ledger (D-01). No provider is integrated today; the current wallet screen is a mock.

Public provider research (`.agents/agent-plans/phase-0/provider-evaluation.md`) shortlists Yellow Card as primary, with Transak/MoonPay as backups. BVNK is deferred due to a public $500k/month, 6-month trading minimum. The critical unverified question is whether the provider supports **USDC payout to an external wallet on Polygon/Base for a Nigerian business**.

## Decision

1. **Custody:** the provider holds customer funds; ADVERS never stores private keys and never signs on-chain transactions in v1.
2. **Ledger authority:** ADVERS' ledger is the customer-facing source of truth. Provider balances are reconciled daily; a non-zero unreconciled clearing balance is an incident.
3. **Provider adapter:** a single interface in `src/server/payments/provider.ts`:
   ```ts
   interface PaymentProvider {
     createOnrampSession(input): Promise<OnrampSession>;
     createPayout(input): Promise<Payout>;
     getTransaction(id): Promise<ProviderTransaction>;
     verifyWebhook(rawBody, headers): boolean;
     parseWebhook(rawBody): ProviderEvent;
   }
   ```
   The concrete adapter is selected by env (`PAYMENT_PROVIDER`), never by client input.
4. **Webhooks:** `POST /api/webhooks/[provider]` verifies the signature against the raw body, persists `ProviderEvent` first, then processes idempotently. Replays return 200 without re-posting ledger entries.
5. **Network policy:** one network at launch (D-04 recommendation: Polygon PoS). The wallet stores an explicit network; address validation is network-specific; a mismatched network is rejected, not auto-converted.
6. **Address safety:** checksum/format validation, optional contract-address detection, allowlist of supported chains, and a confirmation step showing amount + address + network + fee. Address changes require step-up 2FA.
7. **Secrets:** provider keys and webhook secrets are server-only env vars, never logged, never exposed to client components. Error messages are sanitised.
8. **Reconciliation:** store provider references on every transaction; daily job compares provider settlement report to ledger clearing accounts; mismatches raise an admin alert.
9. **Fees:** provider fee and network fee are recorded separately from the platform fee; the customer-facing quote discloses all three.
10. **Failure handling:** failed on-ramp → no ledger credit; failed payout → funds return to AVAILABLE via a reversal; stuck pending → admin queue with provider reference.

## Consequences

- Positive: avoids key management, on-chain ops, and most custody compliance build-out.
- Positive: provider handles KYC/AML and fiat rails.
- Negative: hard dependency on provider coverage, uptime, fees, and Nigeria support; account approval is a lead-time item.
- Negative: provider may not support USDC payouts to arbitrary wallets; if not, the fallback is "withdraw to NGN bank" plus a separate USDC transfer process, which changes the brief's UX.
- Security: webhook endpoint becomes a high-value target; signature verification and idempotency are mandatory, not optional.

## Alternatives considered

| Option | Why rejected for v1 |
|---|---|
| Self-custodial wallets | Full key management, custody, AML, and on-chain ops burden; not justified at launch |
| Static platform deposit address + manual payouts | Cheapest but poor UX, high reconciliation risk, manual key handling |
| Multiple providers at launch | Doubles integration and reconciliation surface; adapter keeps the second cheap later |

## Open questions

- D-04: final network.
- D-05: provider and commercial terms.
- D-09: whether the provider KYC satisfies 2FA recovery identity checks.
- Whether advertisers may withdraw to an external wallet or only to a verified bank account in v1 (brief requires wallet; provider capability decides).
