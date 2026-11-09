import test from "node:test";
import assert from "node:assert/strict";
import { PLAN_DEFINITIONS, getPlanDefinition } from "../plans";

test("plan catalog matches the specification prices and limits", () => {
  const starter = getPlanDefinition("STARTER");
  const growth = getPlanDefinition("GROWTH");
  const businessPro = getPlanDefinition("BUSINESS_PRO");

  assert.ok(starter);
  assert.ok(growth);
  assert.ok(businessPro);

  assert.equal(starter.monthlyPrice, 1999);
  assert.equal(starter.annualPrice, 19990);
  assert.equal(starter.profileLimit, 1);
  assert.equal(starter.workspaceLimit, 1);

  assert.equal(growth.monthlyPrice, 4999);
  assert.equal(growth.annualPrice, 49990);
  assert.equal(growth.profileLimit, 3);
  assert.equal(growth.workspaceLimit, 5);

  assert.equal(businessPro.monthlyPrice, 9999);
  assert.equal(businessPro.annualPrice, 99990);
  assert.equal(businessPro.profileLimit, 10);
  assert.equal(businessPro.workspaceLimit, 15);
  assert.equal(businessPro.teamSeatLimit, 3);
});

test("Business Pro inherits lower plan features and adds team access", () => {
  const businessPro = PLAN_DEFINITIONS.find((plan) => plan.key === "BUSINESS_PRO");
  assert.ok(businessPro);
  assert.ok(businessPro.features.includes("TEAM_ACCESS"));
  assert.ok(businessPro.features.includes("CHANNEL_DISCOVERY"));
  assert.ok(businessPro.features.includes("BULK_SMS"));
});
