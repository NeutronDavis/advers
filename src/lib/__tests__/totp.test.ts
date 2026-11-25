import test from "node:test";
import assert from "node:assert/strict";
import {
  base32Decode,
  base32Encode,
  buildOtpauthUri,
  generateRecoveryCodes,
  generateTotp,
  verifyTotp,
} from "../totp";

// RFC 6238 test secret: ASCII "12345678901234567890".
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

test("base32 round-trips binary data", () => {
  const buffer = Buffer.from("hello advers", "utf8");
  assert.equal(base32Decode(base32Encode(buffer)).toString("utf8"), "hello advers");
});

test("TOTP matches the RFC 6238 SHA-1 vectors", () => {
  const vectors: Array<[number, string]> = [
    [59_000, "94287082"],
    [1_111_111_109_000, "07081804"],
    [1_111_111_111_000, "14050471"],
    [1_234_567_890_000, "89005924"],
    [2_000_000_000_000, "69279037"],
    [20_000_000_000_000, "65353130"],
  ];
  for (const [timestamp, expected] of vectors) {
    assert.equal(
      generateTotp(RFC_SECRET, { digits: 8, timestamp }),
      expected,
      `timestamp ${timestamp}`
    );
  }
});

test("verifyTotp accepts the current token and rejects wrong values", () => {
  const timestamp = 1_234_567_890_000;
  const token = generateTotp(RFC_SECRET, { digits: 6, timestamp });
  assert.equal(verifyTotp(RFC_SECRET, token, { digits: 6, timestamp }), true);
  assert.equal(verifyTotp(RFC_SECRET, "000000", { digits: 6, timestamp }), false);
  assert.equal(verifyTotp(RFC_SECRET, "12345", { digits: 6, timestamp }), false);
});

test("verifyTotp allows a one-step clock window", () => {
  const timestamp = 1_234_567_890_000;
  const previous = generateTotp(RFC_SECRET, {
    digits: 6,
    timestamp: timestamp - 30_000,
  });
  assert.equal(
    verifyTotp(RFC_SECRET, previous, { digits: 6, timestamp, window: 1 }),
    true
  );
  assert.equal(
    verifyTotp(RFC_SECRET, previous, { digits: 6, timestamp, window: 0 }),
    false
  );
});

test("otpauth URI contains the expected parameters", () => {
  const uri = buildOtpauthUri({
    secret: "ABC234",
    accountName: "owner@example.com",
  });
  assert.ok(uri.startsWith("otpauth://totp/ADVERS:owner%40example.com?"));
  assert.ok(uri.includes("secret=ABC234"));
  assert.ok(uri.includes("issuer=ADVERS"));
  assert.ok(uri.includes("period=30"));
});

test("recovery codes are unique and formatted", () => {
  const codes = generateRecoveryCodes(10);
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-7]{4}-[A-Z2-7]{4}$/);
  }
});
