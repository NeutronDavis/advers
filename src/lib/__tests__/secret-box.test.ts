import test from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret } from "../secret-box";

test("encrypted secrets round-trip", () => {
  const plaintext = "JBSWY3DPEHPK3PXP";
  const payload = encryptSecret(plaintext);
  assert.notEqual(payload, plaintext);
  assert.equal(decryptSecret(payload), plaintext);
});

test("each encryption uses a fresh IV", () => {
  const a = encryptSecret("same-value");
  const b = encryptSecret("same-value");
  assert.notEqual(a, b);
});

test("tampered ciphertext is rejected", () => {
  const payload = encryptSecret("JBSWY3DPEHPK3PXP");
  const parts = payload.split(".");
  const last = parts[parts.length - 1];
  parts[parts.length - 1] = `${last.slice(0, -2)}AA`;
  assert.throws(() => decryptSecret(parts.join(".")));
});

test("unsupported payload versions are rejected", () => {
  assert.throws(() => decryptSecret("v2.a.b.c"), /Unsupported/);
  assert.throws(() => decryptSecret("not-a-payload"), /Unsupported/);
});
