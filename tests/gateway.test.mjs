import test from "node:test";
import assert from "node:assert/strict";

import {
  createAction,
  Decision,
  executeThroughGateway,
  createMemoryAdapter,
} from "../src/index.mjs";

test("gateway executes an explicitly allowed action", async () => {
  const adapter = createMemoryAdapter();
  const action = createAction({ actor: "agent", tool: "github", operation: "read_repository", resource: "manav193/NEXUS" });
  const result = await executeThroughGateway({
    action,
    adapter,
    policies: [{ id: "allow-read", effect: Decision.ALLOW, match: { operation: "read_repository" } }],
  });
  assert.equal(result.executed, true);
  assert.equal(result.decision.decision, Decision.ALLOW);
  assert.equal(adapter.calls.length, 1);
});

test("gateway blocks denied action without invoking adapter", async () => {
  const adapter = createMemoryAdapter();
  const action = createAction({ actor: "agent", tool: "filesystem", operation: "write_file", resource: ".env" });
  const result = await executeThroughGateway({
    action,
    adapter,
    policies: [{ id: "deny-secrets", effect: Decision.DENY, match: { resource: ".env" } }],
  });
  assert.equal(result.executed, false);
  assert.equal(result.decision.decision, Decision.DENY);
  assert.equal(adapter.calls.length, 0);
});

test("gateway requires approval before high-risk execution", async () => {
  const adapter = createMemoryAdapter();
  const action = createAction({ actor: "agent", tool: "shell", operation: "execute_shell" });

  const blocked = await executeThroughGateway({ action, adapter });
  assert.equal(blocked.executed, false);
  assert.equal(blocked.decision.decision, Decision.REQUIRE_APPROVAL);
  assert.equal(adapter.calls.length, 0);

  const approved = await executeThroughGateway({ action, adapter, approval: true });
  assert.equal(approved.executed, true);
  assert.equal(adapter.calls.length, 1);
});

test("gateway converts adapter failure into a controlled error", async () => {
  const adapter = { execute: async () => { throw new Error("secret internal detail"); } };
  const action = createAction({ actor: "agent", tool: "http", operation: "http_request" });

  await assert.rejects(
    executeThroughGateway({
      action,
      adapter,
      policies: [{ id: "allow-http", effect: Decision.ALLOW, match: { operation: "http_request" } }],
    }),
    (error) => error.code === "ADAPTER_EXECUTION_FAILED" && !error.message.includes("secret internal detail"),
  );
});
