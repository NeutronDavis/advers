# Phase 0 — Decisions Log & Gate Checklist

**Date:** 2026-11-24
**Status:** Executed by agent — awaiting sign-off on items marked **PENDING**
**Rule:** No Phase 1 migration starts until every **PENDING** item is either accepted, changed, or explicitly deferred with a written owner.

Legend: **ACCEPTED** = user-confirmed · **RECOMMENDED** = agent proposal awaiting sign-off · **PENDING** = business/legal/vendor input required · **BLOCKED** = external dependency.

---

## 1. Decisions

| ID | Decision | Recommendation / current answer | Status | Owner |
|---|---|---|---|---|
| D-01 | USDC custody model | Regulated on/off-ramp provider holds custody; ADVERS keeps authoritative internal ledger; provider APIs + signed webhooks | **ACCEPTED** | Product |
| D-02 | Pricing vs settlement currency | NGN list prices; locked USDC quote per transaction; store both amounts + rate on the transaction | **ACCEPTED** | Product |
| D-03 | First milestone | Foundation first (Phase 0 + Phase 1) | **ACCEPTED** | Product |
| D-04 | USDC network(s) | **Polygon PoS primary.** Single network at launch; Base deferred. Enforce per wallet/address; no cross-network fallback | **ACCEPTED** | Product + Eng |
| D-05 | Provider | **Yellow Card primary**; Transak / MoonPay as backup; Circle Mint only if treasury liquidity is needed; BVNK deferred (volume minimums) | **ACCEPTED** | Product + Finance |
| D-06 | Canonical palette | **Obsidian/gold canonical**, mapped onto daisyUI semantic tokens; indigo/violet retired | **ACCEPTED** | Product + Design |
| D-07 | Fee schedule | Platform service fee on campaign spend; network fee passed through on withdrawal; FX spread disclosed in the quote. Structure accepted; exact percentages **PENDING** | **ACCEPTED (structure)** | Finance |
| D-08 | FX policy | Quote locked 10 minutes from provider rate; quote expiry forces re-quote; ADVERS does not absorb movement inside the lock window | **ACCEPTED** | Finance |
| D-09 | KYC/AML ownership | Provider-owned (KYB on ADVERS, KYC on the payer where required); ADVERS stores only provider reference IDs, no raw documents | **ACCEPTED** | Compliance |
| D-10 | 2FA recovery without KYC | Support-assisted recovery in v1: identity check via registered email + phone + recent transaction evidence; recovery codes remain the primary path | **ACCEPTED** | Security |
| D-11 | Ranking weights (v1) | Verified review 35%, completed work 20%, responsiveness 15%, recommendations 10%, rating score 10%, verification level 5%, recency 5%; report penalty multiplicative. Weights live in config, not code | **ACCEPTED** | Product |
| D-12 | Signed-out profile browsing | Signed-in only in v1; public read-only profiles deferred. Keeps moderation and PII scope small | **ACCEPTED** | Product |
| D-13 | Email delivery provider | **Resend** (or equivalent transactional API); required for verification, password reset, withdrawal notices | **ACCEPTED** | Eng |
| D-14 | Media worker hosting | Pure-Node inspectors (`sharp` + `music-metadata` + `mp4box`) on the existing Next runtime for v1; ffmpeg worker deferred to V2 | **ACCEPTED** | Eng/Ops |
| D-15 | Minimums | Minimum deposit and withdrawal in USD terms: **numbers PENDING**; must cover provider + network fees | **PENDING** | Finance |
| D-16 | Refund policy | Refund to ADVERS USDC wallet at the original transaction's USD value; no FX gain/loss to the customer; ledger reversal entry, never an edit | **ACCEPTED** | Finance |
| D-17 | Sponsored placement | Out of scope for v1; ranking schema reserves a `sponsored` flag but no auction is built | **ACCEPTED (plan)** | Product |
| D-18 | Mobile delivery | Responsive web only; no native apps | **ACCEPTED (plan)** | Product |

---

## 2. Exit Gate

Phase 0 exits only when all of the following are true:

- [x] Current-state review completed against every brief section.
- [x] Money, ledger, custody, auth, token, and media decisions documented as ADRs.
- [x] Token surface audited with counts and a mapping table.
- [x] `sharp` verified working; ffprobe availability tested and fallback documented.
- [x] Provider candidates researched with evidence and a sandbox test plan.
- [x] D-04 network signed off — Polygon PoS primary.
- [x] D-05 provider shortlist signed off — Yellow Card primary.
- [x] D-06 palette signed off — obsidian/gold canonical.
- [ ] D-07 fee schedule numbers supplied (structure accepted; blocks Phase 2 pricing UI).
- [x] D-09 KYC ownership accepted — provider-owned, confirm in sandbox.
- [x] D-11 ranking weights signed off — 35/20/15/10/10/5/5.
- [x] D-13 email provider confirmed — Resend.
- [x] D-14 hosting target confirmed — pure-Node V1, ffmpeg worker deferred.
- [ ] D-15 minimums supplied (blocks Phase 2 withdrawal validation).
- [ ] Provider sandbox credentials issued (blocks the provider spike, not Phase 1 schema work).

**Agent assessment:** Phase 1 (money module, additive migration, ledger skeleton, token aliases, session context) can start now. D-07/D-15 only block Phase 2, and provider sandbox credentials only block the provider spike.

---

## 3. Verbatim User Decisions

- "Which USDC custody model should the plan target?" → "Regulated on/off-ramp provider (Recommended)"
- "How should pricing and settlement currency work?" → "NGN pricing + USDC settlement quote (Recommended)"
- "What should the first implementation milestone cover?" → "Foundation first (Recommended)"
- "What should I produce next?" → "Full implementation plan (Recommended)"
- 2026-11-24: "exicute the phase 0 so wer can enter another phase" → execute Phase 0 discovery artifacts.
- 2026-11-24: User sign-off — network: "Polygon PoS primary (Recommended)".
- 2026-11-24: User sign-off — provider: "Yellow Card primary (Recommended)".
- 2026-11-24: User sign-off — palette: "Obsidian/gold canonical (Recommended)".
- 2026-11-24: User sign-off — remaining defaults: "Accept all recommendations (Recommended)".

---

## 4. Artifacts Produced

| Artifact | Path |
|---|---|
| Decisions log (this file) | `.agents/agent-plans/phase-0/decisions-log.md` |
| Provider evaluation | `.agents/agent-plans/phase-0/provider-evaluation.md` |
| Media validation spike | `.agents/agent-plans/phase-0/media-spike.md` |
| Token inventory | `.agents/agent-plans/phase-0/token-inventory.md` |
| ADR-0001 Money representation | `.agents/agent-plans/adr/0001-money-representation.md` |
| ADR-0002 Ledger | `.agents/agent-plans/adr/0002-double-entry-ledger.md` |
| ADR-0003 Custody & provider | `.agents/agent-plans/adr/0003-custody-and-provider.md` |
| ADR-0004 Auth context & step-up | `.agents/agent-plans/adr/0004-auth-context-and-step-up.md` |
| ADR-0005 Design tokens | `.agents/agent-plans/adr/0005-design-tokens.md` |
| ADR-0006 Media & channel specs | `.agents/agent-plans/adr/0006-media-and-channel-specs.md` |
