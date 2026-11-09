import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionBoosterJob,
  isBoosterJobOpen,
  boosterJobStatusLabel,
  BOOSTER_CATEGORY_LABELS,
} from "../booster-status";

test("Booster categories cover the seven spec categories", () => {
  assert.equal(Object.keys(BOOSTER_CATEGORY_LABELS).length, 7);
  assert.ok("CREATIVE" in BOOSTER_CATEGORY_LABELS);
  assert.ok("PRODUCTION" in BOOSTER_CATEGORY_LABELS);
  assert.ok("DISTRIBUTION" in BOOSTER_CATEGORY_LABELS);
  assert.ok("FIELD_MARKETING" in BOOSTER_CATEGORY_LABELS);
  assert.ok("INTELLIGENCE" in BOOSTER_CATEGORY_LABELS);
  assert.ok("SALES_CONVERSION" in BOOSTER_CATEGORY_LABELS);
  assert.ok("EXPERIENCE_TECHNOLOGY" in BOOSTER_CATEGORY_LABELS);
});

test("Booster job labels include the execution states", () => {
  assert.equal(boosterJobStatusLabel("APPLICATIONS_OPEN"), "Applications open");
  assert.equal(boosterJobStatusLabel("SUBMITTED_FOR_REVIEW"), "Submitted for review");
  assert.equal(boosterJobStatusLabel("REWORK_REQUESTED"), "Rework requested");
});

test("Booster job transitions follow the execution flow", () => {
  assert.equal(canTransitionBoosterJob("APPLICATIONS_OPEN", "ASSIGNED"), true);
  assert.equal(canTransitionBoosterJob("ASSIGNED", "ACCEPTED"), true);
  assert.equal(canTransitionBoosterJob("ACCEPTED", "IN_PROGRESS"), true);
  assert.equal(
    canTransitionBoosterJob("IN_PROGRESS", "SUBMITTED_FOR_REVIEW"),
    true
  );
  assert.equal(
    canTransitionBoosterJob("SUBMITTED_FOR_REVIEW", "APPROVED"),
    true
  );
  assert.equal(canTransitionBoosterJob("APPROVED", "PAID"), true);
});

test("closed Booster jobs cannot move backwards", () => {
  assert.equal(canTransitionBoosterJob("CLOSED", "IN_PROGRESS"), false);
  assert.equal(canTransitionBoosterJob("REJECTED", "ACCEPTED"), false);
  assert.equal(isBoosterJobOpen("PUBLISHED"), true);
  assert.equal(isBoosterJobOpen("APPLICATIONS_OPEN"), true);
  assert.equal(isBoosterJobOpen("IN_PROGRESS"), false);
});
