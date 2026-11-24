import test from "node:test";
import assert from "node:assert/strict";
import {
  canSwitchTo,
  landingPathForContext,
  resolveSessionContext,
} from "../session-context";

test("staff and admins always resolve to the admin context", () => {
  assert.equal(
    resolveSessionContext({ role: "ADMIN", hasClient: true, boosterStatus: "ACTIVE", requested: "BOOSTER" }),
    "ADMIN"
  );
  assert.equal(
    resolveSessionContext({ role: "STAFF", hasClient: false, boosterStatus: null }),
    "ADMIN"
  );
});

test("an explicit booster request wins only for an active profile", () => {
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: true, boosterStatus: "ACTIVE", requested: "BOOSTER" }),
    "BOOSTER"
  );
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: true, boosterStatus: "PAUSED", requested: "BOOSTER" }),
    "USER"
  );
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: true, boosterStatus: null, requested: "BOOSTER" }),
    "USER"
  );
});

test("booster-only users default to the booster context", () => {
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: false, boosterStatus: "ACTIVE" }),
    "BOOSTER"
  );
});

test("advertisers default to the user context", () => {
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: true, boosterStatus: "ACTIVE" }),
    "USER"
  );
  assert.equal(
    resolveSessionContext({ role: "CLIENT", hasClient: false, boosterStatus: null }),
    "USER"
  );
});

test("switching rules deny privilege escalation", () => {
  assert.deepEqual(
    canSwitchTo("USER", { role: "ADMIN", hasClient: true, boosterStatus: "ACTIVE" }),
    { allowed: false, reason: "Admin sessions cannot switch into a customer workspace." }
  );
  assert.equal(
    canSwitchTo("BOOSTER", { role: "CLIENT", hasClient: true, boosterStatus: "SUSPENDED" }).allowed,
    false
  );
  assert.equal(
    canSwitchTo("BOOSTER", { role: "CLIENT", hasClient: true, boosterStatus: "ACTIVE" }).allowed,
    true
  );
  assert.equal(
    canSwitchTo("USER", { role: "CLIENT", hasClient: false, boosterStatus: "ACTIVE" }).allowed,
    false
  );
  assert.equal(
    canSwitchTo("USER", { role: "CLIENT", hasClient: true, boosterStatus: "ACTIVE" }).allowed,
    true
  );
});

test("each context has a landing path", () => {
  assert.equal(landingPathForContext("ADMIN"), "/admin");
  assert.equal(landingPathForContext("BOOSTER"), "/booster");
  assert.equal(landingPathForContext("USER"), "/portal/dashboard");
});
