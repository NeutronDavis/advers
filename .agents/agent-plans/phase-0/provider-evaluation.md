# Phase 0 — Provider Evaluation (USDC on/off-ramp, Nigeria)

**Date:** 2026-11-24
**Status:** Desk research complete; sandbox spike blocked on credentials
**Scope:** Advertiser funding (NGN → USDC) and withdrawals (USDC → NGN bank or USDC wallet), plus treasury.

> Evidence below was captured from public provider pages on 2026-11-24. Public marketing pages are not a contract. Every claim marked **VERIFY** must be proven in sandbox before D-05 is signed.

---

## 1. Evaluation criteria

| # | Criterion | Why it matters |
|---|---|---|
| 1 | NGN collection (card/bank/transfer) | Advertisers are Nigerian businesses paying in Naira |
| 2 | USDC payout to an external wallet | Brief requires advertiser withdrawal to a personal USDC address |
| 3 | NGN bank payout | Needed for media vendors and Booster earnings, at least as a fallback |
| 4 | Supported chains | Must match D-04 (Polygon primary) and expose network explicitly |
| 5 | Nigeria entity + licensing | CBN/SEC posture; who holds customer funds |
| 6 | KYC/KYB ownership | Determines D-09 and 2FA recovery policy |
| 7 | API + webhook quality | Signed webhooks, idempotency, replay protection, status model |
| 8 | Sandbox | Required to complete the Phase 0 spike |
| 9 | Fees + FX spread | Directly affects D-07 and customer pricing |
| 10 | Minimums + volume requirements | Can disqualify a provider at launch |
| 11 | Reconciliation exports | Required for `ProviderEvent` matching and finance ops |
| 12 | Settlement speed | Affects "pending" UX and escrow release timing |

---

## 2. Candidate matrix

| Provider | NGN on-ramp | USDC payout | Chains | Nigeria/KYC | API/sandbox | Commercial fit | Verdict |
|---|---|---|---|---|---|---|---|
| **Yellow Card** | Yes — NGN listed, Trading Onramp/Offramp, 50+ currencies, 60+ countries (public site) | **VERIFY** — stablecoin infrastructure advertised; payout API detail not captured | Major stablecoins/chains advertised; **VERIFY Polygon/Base** | Licensed stablecoin payments infra; strict KYB/KYC advertised | API suite + docs; sandbox **VERIFY** | Emerging-market focus, NGN-native | **Primary evaluation** |
| **Transak** | Global on/off-ramp; Nigeria **VERIFY** | On-ramp/off-ramp to wallets; **VERIFY** direct payout semantics | Multi-chain; **VERIFY Polygon/Base** | Provider KYC | Mature API; sandbox **VERIFY** | Strong checkout UX, broad coverage | **Backup** |
| **MoonPay** | Global on/off-ramp; Nigeria **VERIFY** | Wallet transfers; **VERIFY** business payouts | Multi-chain; **VERIFY** | Provider KYC | Mature API; sandbox **VERIFY** | Consumer-grade UX, higher fees | **Backup** |
| **BVNK** | 130+ countries; NGN **VERIFY** | Yes — send stablecoins / pay out fiat; stablecoin-native | Major chains via single API | 40+ licences; strong compliance | Documented API; sandbox **VERIFY** | **Minimum $500k/month and 6 months trading** per public FAQ | **Deferred** — not viable at launch |
| **Circle Mint** | No NGN consumer on-ramp expected | USDC native mint/redeem | USDC native | US-regulated | Enterprise | Treasury/liquidity only, not advertiser UX | **Optional treasury** |
| **Stripe / Bridge** | Global; Nigeria **VERIFY** | USDC payouts advertised | Multi-chain | US-regulated | Strong API | Availability for Nigerian entities **VERIFY** | **Watchlist** |
| **Quidax / Busha (local)** | NGN-native | **VERIFY** business payout API | **VERIFY** | Local licensing | **VERIFY** | Local liquidity, less mature business API | **Local fallback** |

**Key research finding:** BVNK's public FAQ states it works with businesses processing **at least $500,000/month with 6+ months of trading history**. That rules it out for an early-stage launch and should not be the primary integration.

**Key gap:** No provider page captured explicitly confirms *USDC payout to an arbitrary external wallet on Polygon/Base for a Nigerian business*. That is the single most important sandbox question.

---

## 3. Recommended shortlist

1. **Yellow Card** — primary. Closest match on NGN + emerging-market settlement + stablecoin infrastructure.
2. **Transak** — backup for collection UX if Yellow Card payout is weak.
3. **MoonPay** — second backup, higher fee expectation.
4. **Circle Mint** — only if ADVERS needs to mint/redeem USDC for treasury; not an advertiser-facing integration.
5. **BVNK** — revisit after volume thresholds are met.

Do not integrate more than one provider in Phase 2. The adapter (ADR-0003) keeps the second one cheap to add later.

---

## 4. Sandbox spike — required tests (blocked on credentials)

Run in a throwaway branch, not on `main`.

1. Create an on-ramp session for NGN 50,000; confirm the quote, expiry, fees, and the exact USDC amount/chain returned.
2. Complete a sandbox payment; confirm the webhook signature, event id, replay behaviour, and final status.
3. Send a test USDC payout to an external Polygon address; record fee, minimum, confirmation time, and failure modes.
4. Attempt a payout on the wrong network and confirm the provider rejects it (not ADVERS silently converting).
5. Attempt a duplicate payout with the same idempotency key; confirm only one transfer.
6. Trigger a failed/expired on-ramp; confirm the ledger can reverse cleanly.
7. Pull a settlement/reconciliation report and match it to the two test transactions by provider reference.
8. Confirm what KYC data the provider collects, what reference IDs ADVERS receives, and whether ADVERS is the merchant of record.
9. Confirm Nigerian entity onboarding requirements (KYB documents, expected approval time).
10. Record all fees and FX spreads in `provider-evaluation.md` before D-05 sign-off.

**Exit criteria:** all ten tests documented with screenshots/logs, and a written go/no-go per provider.

---

## 5. Open questions for the provider call

1. Do you support USDC payouts to external wallets on Polygon and Base for a Nigerian-registered business?
2. Who is the merchant of record and who holds customer funds?
3. What is the exact fee schedule for NGN collection and USDC payout, including FX spread?
4. What are the deposit/withdrawal minimums and per-transaction limits?
5. Do you provide sandbox credentials and signed webhook replay protection?
6. What KYC/KYB do you require from ADVERS and from each advertiser?
7. How do you handle chargebacks, reversals, and failed on-ramps?
8. What reconciliation export formats and cadences are available?
9. What is the settlement time for NGN collection and USDC payout?
10. What happens if a payout is sent to a valid address on the wrong chain?
