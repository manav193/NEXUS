import test from "node:test";
import assert from "node:assert/strict";
import { createAction } from "../src/index.mjs";
import { createNimoAdapter, createNimoKnowledgeBridge } from "../src/integrations/nimo.mjs";

test("NIMO adapter forwards only through injected transport", async () => {
  let received = null;
  const adapter = createNimoAdapter({ send: async (message) => { received = message; return { accepted: true }; } });
  const action = createAction({ actor: "nimo", tool: "autolab", operation: "open_lab" });
  const result = await adapter.execute(action);
  assert.equal(result.accepted, true);
  assert.equal(received.type, "NEXUS_ACTION");
  assert.equal(received.action.operation, "open_lab");
});

test("NIMO adapter fails closed when transport is absent", async () => {
  const adapter = createNimoAdapter();
  await assert.rejects(() => adapter.execute(createAction({ tool: "nimo", operation: "read" })), /NIMO transport is not configured/);
});

test("knowledge bridge uses explicit evaluator", async () => {
  const bridge = createNimoKnowledgeBridge({ evaluate: async ({ action }) => ({ supported: action.operation === "read" }) });
  const result = await bridge.evaluateAction({ action: createAction({ tool: "nimo", operation: "read" }) });
  assert.equal(result.supported, true);
});
