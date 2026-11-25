import test from "node:test";
import assert from "node:assert/strict";
import { escapeCsv, toCsv } from "../csv";

test("escapeCsv quotes commas, quotes and newlines", () => {
  assert.equal(escapeCsv("plain"), "plain");
  assert.equal(escapeCsv("a,b"), '"a,b"');
  assert.equal(escapeCsv('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCsv("line\nbreak"), '"line\nbreak"');
  assert.equal(escapeCsv(null), "");
});

test("toCsv writes a header and rows", () => {
  const csv = toCsv(
    [
      { name: "Ada", amount: "10.00" },
      { name: "Obi, Jr", amount: "5.50" },
    ],
    ["name", "amount"]
  );
  assert.equal(csv, 'name,amount\r\nAda,10.00\r\n"Obi, Jr",5.50\r\n');
});

test("toCsv handles an empty row set", () => {
  assert.equal(toCsv([], ["a", "b"]), "a,b\r\n");
});
