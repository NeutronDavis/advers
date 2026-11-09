import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionCampaign,
  campaignStatusLabel,
  normalizeCampaignStatus,
} from "../campaign-status";

test("legacy campaign statuses normalise to the new flow", () => {
  assert.equal(normalizeCampaignStatus("PENDING_REVIEW"), "SUBMITTED");
  assert.equal(normalizeCampaignStatus("APPROVED"), "CONFIRMED");
  assert.equal(normalizeCampaignStatus("ACTIVE"), "IN_PROGRESS");
  assert.equal(normalizeCampaignStatus("REVISION_REQUESTED"), "UNDER_REVIEW");
});

test("campaign status labels include the spec states", () => {
  assert.equal(campaignStatusLabel("SUBMITTED"), "Submitted");
  assert.equal(campaignStatusLabel("AWAITING_PAYMENT"), "Awaiting payment");
  assert.equal(campaignStatusLabel("IN_PROGRESS"), "In progress");
  assert.equal(campaignStatusLabel("PARTIALLY_COMPLETED"), "Partially completed");
});

test("campaign transitions follow the approved flow", () => {
  assert.equal(canTransitionCampaign("SUBMITTED", "UNDER_REVIEW"), true);
  assert.equal(canTransitionCampaign("UNDER_REVIEW", "AWAITING_APPROVAL"), true);
  assert.equal(canTransitionCampaign("AWAITING_APPROVAL", "AWAITING_PAYMENT"), true);
  assert.equal(canTransitionCampaign("AWAITING_PAYMENT", "CONFIRMED"), true);
  assert.equal(canTransitionCampaign("CONFIRMED", "IN_PROGRESS"), true);
  assert.equal(canTransitionCampaign("IN_PROGRESS", "COMPLETED"), true);
});

test("terminal campaign states cannot move backwards", () => {
  assert.equal(canTransitionCampaign("COMPLETED", "IN_PROGRESS"), false);
  assert.equal(canTransitionCampaign("CANCELLED", "SUBMITTED"), false);
  assert.equal(canTransitionCampaign("REJECTED", "UNDER_REVIEW"), false);
});
