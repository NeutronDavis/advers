import test from "node:test";
import assert from "node:assert/strict";
import { parseMoney } from "../money";
import {
  convertNgnToUsdc,
  convertUsdcToNgn,
  isValidPolygonAddress,
  normalizePolygonAddress,
  toChecksumAddress,
  withdrawalFeeUsdc,
} from "../wallet";

test("EIP-55 checksum matches the canonical vectors", () => {
  const vectors = [
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
    "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
  ];
  for (const address of vectors) {
    assert.equal(toChecksumAddress(address.toLowerCase()), address);
  }
});

test("Polygon address validation enforces checksums for mixed-case input", () => {
  const checksummed = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";
  assert.equal(isValidPolygonAddress(checksummed), true);
  assert.equal(isValidPolygonAddress(checksummed.toLowerCase()), true);
  assert.equal(isValidPolygonAddress(checksummed.toUpperCase().replace("0X", "0x")), true);
  assert.equal(
    isValidPolygonAddress("0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"),
    false
  );
  assert.equal(isValidPolygonAddress("0x123"), false);
  assert.equal(isValidPolygonAddress("0x0000000000000000000000000000000000000000"), false);
  assert.equal(isValidPolygonAddress("0xZZ34567890abcdef1234567890ABCDEF12345678"), false);
});

test("normalizePolygonAddress returns the checksummed form", () => {
  assert.equal(
    normalizePolygonAddress("  0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed  "),
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
  );
});

test("NGN converts to USDC at the quoted rate", () => {
  assert.equal(
    convertNgnToUsdc(parseMoney("160000", "NGN"), 1600).amountMinor,
    BigInt(100_000_000)
  );
  assert.equal(
    convertNgnToUsdc(parseMoney("1600", "NGN"), 1600).amountMinor,
    BigInt(1_000_000)
  );
  assert.throws(() => convertNgnToUsdc(parseMoney("1", "USDC"), 1600), /NGN/);
  assert.throws(() => convertNgnToUsdc(parseMoney("1", "NGN"), 0), /positive/);
});

test("USDC converts back to NGN at the same rate", () => {
  assert.equal(
    convertUsdcToNgn(parseMoney("100", "USDC"), 1600).amountMinor,
    BigInt(16_000_000)
  );
  assert.equal(
    convertUsdcToNgn(parseMoney("1", "USDC"), 1600).amountMinor,
    BigInt(160_000)
  );
});

test("withdrawal fee configuration falls back to zero when invalid", () => {
  const previous = process.env.WITHDRAWAL_FEE_USDC;
  process.env.WITHDRAWAL_FEE_USDC = "0.5";
  assert.equal(withdrawalFeeUsdc(), "0.5");
  process.env.WITHDRAWAL_FEE_USDC = "not-money";
  assert.equal(withdrawalFeeUsdc(), "0");
  if (previous === undefined) delete process.env.WITHDRAWAL_FEE_USDC;
  else process.env.WITHDRAWAL_FEE_USDC = previous;
});
