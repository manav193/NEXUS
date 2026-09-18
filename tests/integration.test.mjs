import test from "node:test";
import assert from "node:assert/strict";
import { createAction, createDefaultNimoBridge, createMemoryAdapter, createSecurityGuard, Decision } from "../src/index.mjs";

test("NIMO bridge routes an action through the NEXUS gateway", async () => {
  const adapter = createMemoryAdapter();
  const bridge = createDefaultNimoBridge({ adapter });
  const action = createAction({ actor: "nimo", tool: "github", operation: "read_repository" });
  const result = await bridge.dispatch(action);
  assert.equal(result.executed, true);
  assert.equal(adapter.calls.length, 1);
});

test("NIMO bridge cannot bypass security", async () => {
  const adapter = createMemoryAdapter();
  const guard = createSecurityGuard({ allowedTools: ["github"] });
  const bridge = createDefaultNimoBridge({ adapter, securityGuard: guard });
  const action = createAction({ actor: "nimo", tool: "shell", operation: "execute_shell" });
  const result = await bridge.dispatch(action);
  assert.equal(result.executed, false);
  assert.equal(result.decision.decision, Decision.DENY);
  assert.equal(adapter.calls.length, 0);
});
