import test from "node:test";
import assert from "node:assert/strict";
import { createAction, createMemoryAdapter, createSecurityGuard, executeThroughGateway, Decision } from "../src/index.mjs";
import { createNimoAdapter } from "../src/integrations/nimo.mjs";

test("NIMO adapter routes only through the NEXUS gateway", async () => {
  const adapter = createMemoryAdapter();
  let forwarded = null;
  const nimo = createNimoAdapter({ send: async (message) => { forwarded = message; return { accepted:true }; } });
  const action = createAction({ actor:"nimo", tool:"github", operation:"read_repository" });
  const result = await executeThroughGateway({ action, adapter:nimo, policies:[] });
  assert.equal(result.executed, true);
  assert.equal(result.result.accepted, true);
  assert.equal(forwarded.type, "NEXUS_ACTION");
  assert.equal(forwarded.action.operation, "read_repository");
  assert.equal(adapter.calls.length, 0);
});

test("NIMO execution cannot bypass the security guard", async () => {
  let called = false;
  const nimo = createNimoAdapter({ send: async () => { called = true; return { accepted:true }; } });
  const guard = createSecurityGuard({ allowedTools:["github"] });
  const action = createAction({ actor:"nimo", tool:"shell", operation:"execute_shell" });
  const result = await executeThroughGateway({ action, adapter:nimo, securityGuard:guard });
  assert.equal(result.executed, false);
  assert.equal(result.decision.decision, Decision.DENY);
  assert.equal(called, false);
});

test("NIMO adapter fails closed without transport", async () => {
  const nimo = createNimoAdapter();
  await assert.rejects(() => nimo.execute(createAction({ tool:"nimo", operation:"read" })), /NIMO transport is not configured/);
});
