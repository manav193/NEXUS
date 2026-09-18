import test from "node:test";
import assert from "node:assert/strict";

import { createAction, Decision, RiskLevel, evaluateAction, classifyRisk } from "../src/index.mjs";

test("low-risk read action defaults to ALLOW", () => {
  const action = createAction({
    actor: "demo-agent",
    tool: "github",
    operation: "read_repository",
    resource: "manav193/NEXUS",
  });

  const result = evaluateAction(action, []);

  assert.equal(result.decision, Decision.ALLOW);
  assert.equal(result.risk, RiskLevel.LOW);
});

test("critical destructive action defaults to approval", () => {
  const action = createAction({
    actor: "demo-agent",
    tool: "github",
    operation: "delete_repository",
    resource: "manav193/NEXUS",
  });

  const result = evaluateAction(action, []);

  assert.equal(result.decision, Decision.REQUIRE_APPROVAL);
  assert.equal(result.risk, RiskLevel.CRITICAL);
});

test("explicit deny wins", () => {
  const action = createAction({
    actor: "demo-agent",
    tool: "filesystem",
    operation: "write_file",
    resource: ".env",
  });

  const result = evaluateAction(action, [
    {
      id: "no-secret-files",
      effect: Decision.DENY,
      match: { tool: "filesystem", operation: "write_file", resource: ".env" },
      reasonCodes: ["SECRET_RESOURCE"],
    },
  ]);

  assert.equal(result.decision, Decision.DENY);
  assert.deepEqual(result.matchedPolicies, ["no-secret-files"]);
  assert.deepEqual(result.reasonCodes, ["SECRET_RESOURCE"]);
});

test("explicit approval policy wins before allow policy", () => {
  const action = createAction({
    actor: "agent",
    tool: "github",
    operation: "push_code",
    resource: "production",
  });

  const result = evaluateAction(action, [
    {
      id: "protected-production",
      effect: Decision.REQUIRE_APPROVAL,
      match: { resource: "production" },
    },
    {
      id: "general-github-write",
      effect: Decision.ALLOW,
      match: { tool: "github", operation: "push_code" },
    },
  ]);

  assert.equal(result.decision, Decision.REQUIRE_APPROVAL);
  assert.equal(result.risk, RiskLevel.HIGH);
});

test("malformed policy fails closed", () => {
  const action = createAction({
    actor: "agent",
    tool: "http",
    operation: "http_request",
  });

  const result = evaluateAction(action, [{ id: "broken" }]);

  assert.equal(result.decision, Decision.DENY);
  assert.equal(result.reasonCodes[0], "INVALID_POLICY");
});

test("risk classification is deterministic", () => {
  const action = createAction({
    tool: "shell",
    operation: "execute_shell",
  });

  assert.equal(classifyRisk(action), RiskLevel.HIGH);
});
