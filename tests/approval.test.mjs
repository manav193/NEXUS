import test from "node:test";
import assert from "node:assert/strict";
import {
  ApprovalStatus, createAction, createApprovalRequest, createMemoryApprovalStore,
  createMemoryAdapter, createMemoryAuditSink, executeThroughGateway, Decision,
} from "../src/index.mjs";

test("approval lifecycle is PENDING -> APPROVED -> CONSUMED", () => {
  let now = Date.parse("2026-09-18T10:00:00.000Z");
  const store = createMemoryApprovalStore({ clock: () => now });
  const action = createAction({ actor: "agent", tool: "shell", operation: "execute_shell" });
  const request = createApprovalRequest({ action, decision: { decision: Decision.REQUIRE_APPROVAL }, requester: "agent", ttlMs: 60000, createdAt: new Date(now).toISOString() });
  store.create(request);
  assert.equal(store.get(request.id).status, ApprovalStatus.PENDING);
  assert.equal(store.decide(request.id, { approved: true, approver: "human" }).status, ApprovalStatus.APPROVED);
  const consumed = store.consume(request.id, { actor: "agent" });
  assert.equal(consumed.approved, true);
  assert.equal(consumed.request.status, ApprovalStatus.CONSUMED);
  assert.equal(store.consume(request.id).approved, false);
});

test("expired approval cannot be consumed", () => {
  let now = Date.parse("2026-09-18T10:00:00.000Z");
  const store = createMemoryApprovalStore({ clock: () => now });
  const action = createAction({ actor: "agent", tool: "shell", operation: "execute_shell" });
  const request = createApprovalRequest({ action, decision: { decision: Decision.REQUIRE_APPROVAL }, ttlMs: 1000, createdAt: new Date(now).toISOString() });
  store.create(request);
  store.decide(request.id, { approved: true, approver: "human" });
  now += 1001;
  const result = store.consume(request.id);
  assert.equal(result.approved, false);
  assert.equal(result.request.status, ApprovalStatus.EXPIRED);
});

test("gateway executes only with a valid one-time approval", async () => {
  const store = createMemoryApprovalStore();
  const audit = createMemoryAuditSink();
  const adapter = createMemoryAdapter();
  const action = createAction({ actor: "agent", tool: "shell", operation: "execute_shell" });
  const decision = { decision: Decision.REQUIRE_APPROVAL, risk: "HIGH", reasonCodes: ["TEST"], matchedPolicies: [], action, engineVersion: "0.1.0" };
  const request = createApprovalRequest({ action, decision, requester: "agent" });
  store.create(request);
  store.decide(request.id, { approved: true, approver: "human" });

  const result = await executeThroughGateway({ action, adapter, approvalStore: store, approvalRequestId: request.id, auditSink: audit });
  assert.equal(result.executed, true);
  assert.equal(adapter.calls.length, 1);

  const replay = await executeThroughGateway({ action, adapter, approvalStore: store, approvalRequestId: request.id, auditSink: audit });
  assert.equal(replay.executed, false);
  assert.equal(adapter.calls.length, 1);
});

test("approval cannot authorize a different action", async () => {
  const store = createMemoryApprovalStore();
  const adapter = createMemoryAdapter();
  const approvedAction = createAction({ actor: "agent", tool: "shell", operation: "execute_shell", parameters: { cmd: "safe" } });
  const differentAction = createAction({ actor: "agent", tool: "shell", operation: "execute_shell", parameters: { cmd: "different" } });
  const request = createApprovalRequest({ action: approvedAction, decision: { decision: Decision.REQUIRE_APPROVAL }, requester: "agent" });
  store.create(request);
  store.decide(request.id, { approved: true, approver: "human" });
  const result = await executeThroughGateway({ action: differentAction, adapter, approvalStore: store, approvalRequestId: request.id });
  assert.equal(result.executed, false);
  assert.equal(adapter.calls.length, 0);
});

test("denied approval never executes", async () => {
  const store = createMemoryApprovalStore();
  const adapter = createMemoryAdapter();
  const action = createAction({ actor: "agent", tool: "shell", operation: "execute_shell" });
  const request = createApprovalRequest({ action, decision: { decision: Decision.REQUIRE_APPROVAL }, requester: "agent" });
  store.create(request);
  store.decide(request.id, { approved: false, approver: "human" });
  const result = await executeThroughGateway({ action, adapter, approvalStore: store, approvalRequestId: request.id });
  assert.equal(result.executed, false);
  assert.equal(adapter.calls.length, 0);
});
