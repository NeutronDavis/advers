import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDateRange, parseDateRange } from "../date-range";
import { formatNaira, formatNairaShort, initials } from "../format";
import { campaignStatusClass, campaignStatusLabel } from "../types/campaign";

test("normalizeDateRange falls back to 30d", () => {
  assert.equal(normalizeDateRange(undefined), "30d");
  assert.equal(normalizeDateRange("bogus"), "30d");
  assert.equal(normalizeDateRange("7d"), "7d");
  assert.equal(normalizeDateRange("this_month"), "this_month");
});

test("parseDateRange returns a start before the end", () => {
  for (const range of ["7d", "30d", "90d", "this_month"]) {
    const { startDate, endDate } = parseDateRange(range);
    assert.ok(startDate.getTime() <= endDate.getTime(), `${range} start <= end`);
  }
});

test("formatNaira renders NGN without decimals", () => {
  const formatted = formatNaira(150000);
  assert.ok(formatted.includes("150,000"));
});

test("formatNairaShort abbreviates large amounts", () => {
  assert.equal(formatNairaShort(150000), "₦150k");
  assert.equal(formatNairaShort(2500000), "₦2.5M");
  assert.equal(formatNairaShort(500), "₦500");
});

test("initials takes the first two name parts", () => {
  assert.equal(initials("Olumide Adebayo"), "OA");
  assert.equal(initials("Advers"), "A");
});

test("campaign status labels and classes cover the view states", () => {
  assert.equal(campaignStatusLabel("ACTIVE"), "● Active");
  assert.equal(campaignStatusLabel("IN_REVIEW"), "In review");
  assert.equal(campaignStatusLabel("CANCELLED"), "Cancelled");
  assert.ok(campaignStatusClass("ACTIVE").includes("badge-success"));
  assert.ok(campaignStatusClass("CANCELLED").includes("badge-error"));
});
