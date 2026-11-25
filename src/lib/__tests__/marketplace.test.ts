import test from "node:test";
import assert from "node:assert/strict";
import {
  availabilityBadgeClass,
  displayHandle,
  slugifyHandle,
} from "../marketplace";

test("slugifyHandle creates a stable profile handle", () => {
  assert.equal(slugifyHandle("Olumide Adebayo"), "olumide-adebayo");
  assert.equal(slugifyHandle("  Lagos Creative Co.  "), "lagos-creative-co");
  assert.equal(slugifyHandle("A/B Testing & Video"), "a-b-testing-video");
  assert.equal(slugifyHandle("!!!"), "booster");
  assert.equal(slugifyHandle("x".repeat(100)).length, 40);
});

test("displayHandle falls back to the profile id", () => {
  assert.equal(displayHandle("ada-creates", "abc"), "ada-creates");
  assert.equal(displayHandle(null, "abc"), "abc");
});

test("availability badges map to theme states", () => {
  assert.match(availabilityBadgeClass("AVAILABLE"), /success/);
  assert.match(availabilityBadgeClass("BUSY"), /warning/);
  assert.match(availabilityBadgeClass("UNAVAILABLE"), /ghost/);
});
