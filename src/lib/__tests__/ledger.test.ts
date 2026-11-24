import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBalanced,
  isBalanced,
  netByAccount,
  validateLedgerLines,
  type LedgerLineDraft,
} from "../ledger";
import { parseMoney } from "../money";

function line(
  accountKey: string,
  direction: "DEBIT" | "CREDIT",
  amount: string,
  currency: "NGN" | "USDC" = "USDC"
): LedgerLineDraft {
  return { accountKey, direction, money: parseMoney(amount, currency) };
}

test("a balanced transfer validates", () => {
  const lines = [
    line("user:available", "DEBIT", "100"),
    line("user:escrow", "CREDIT", "100"),
  ];
  assert.deepEqual(validateLedgerLines(lines), { ok: true });
  assert.ok(isBalanced(lines));
  assert.doesNotThrow(() => assertBalanced(lines));
});

test("an unbalanced transaction is rejected with the difference", () => {
  const result = validateLedgerLines([
    line("user:available", "DEBIT", "100"),
    line("user:escrow", "CREDIT", "99.5"),
  ]);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /unbalanced/);
  assert.match(result.error ?? "", /100000000/);
});

test("mixed currencies are rejected", () => {
  const result = validateLedgerLines([
    line("user:available", "DEBIT", "100", "USDC"),
    line("user:escrow", "CREDIT", "100", "NGN"),
  ]);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /Mixed currencies/);
});

test("zero and negative amounts are rejected", () => {
  assert.equal(
    validateLedgerLines([
      line("a", "DEBIT", "0"),
      line("b", "CREDIT", "0"),
    ]).ok,
    false
  );
  assert.equal(
    validateLedgerLines([
      { accountKey: "a", direction: "DEBIT", money: parseMoney("-1", "USDC") },
      line("b", "CREDIT", "1"),
    ]).ok,
    false
  );
});

test("a transaction needs two lines and account keys", () => {
  assert.equal(validateLedgerLines([]).ok, false);
  assert.equal(validateLedgerLines([line("a", "DEBIT", "1")]).ok, false);
  assert.equal(
    validateLedgerLines([
      { accountKey: "  ", direction: "DEBIT", money: parseMoney("1", "USDC") },
      line("b", "CREDIT", "1"),
    ]).ok,
    false
  );
});

test("netByAccount nets repeated accounts and sign", () => {
  const net = netByAccount([
    line("user:available", "DEBIT", "100"),
    line("user:available", "DEBIT", "25"),
    line("user:escrow", "CREDIT", "80"),
    line("platform:fee", "CREDIT", "45"),
  ]);
  const byKey = Object.fromEntries(net.map((entry) => [entry.accountKey, entry]));
  assert.equal(byKey["user:available"].signedAmountMinor, BigInt(-125_000_000));
  assert.equal(byKey["user:escrow"].signedAmountMinor, BigInt(80_000_000));
  assert.equal(byKey["platform:fee"].signedAmountMinor, BigInt(45_000_000));
});
