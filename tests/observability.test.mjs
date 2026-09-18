import test from "node:test";
import assert from "node:assert/strict";
import {
  AuditEventType, createAction, createAuditEvent, createMemoryAuditSink,
  evaluateAction, replayDecision, Decision,
} from "../src/index.mjs";

test("audit sink stores and filters correlated events", () => {
  const sink = createMemoryAuditSink();
  const action = createAction({ actor: "agent", tool: "github", operation: "read_repository" });
  const decision = evaluateAction(action);
  sink.append(createAuditEvent({ type: AuditEventType.DECISION, action, decision, correlationId: "corr-123" }));
  sink.append(createAuditEvent({ type: AuditEventType.BLOCKED, action, decision: { ...decision, decision: Decision.DENY }, correlationId: "corr-other" }));
  assert.equal(sink.list({ correlationId: "corr-123" }).length, 1);
  assert.equal(sink.list()[0].correlationId, "corr-123");
});

test("audit events have unique ids and schema version", () => {
  const action = createAction({ actor: "agent", tool: "filesystem", operation: "write_file" });
  const event = createAuditEvent({ type: AuditEventType.DECISION, action, decision: evaluateAction(action), correlationId: "corr-1" });
  assert.match(event.id, /^[0-9a-f-]{36}$/);
  assert.equal(event.schemaVersion, "0.1.0");
});

test("replay reproduces deterministic decisions", () => {
  const action = createAction({ actor: "agent", tool: "github", operation: "read_repository" });
  const decision = evaluateAction(action);
  const event = createAuditEvent({ type: AuditEventType.DECISION, action, decision, correlationId: "corr-replay" });
  const replay = replayDecision([event], { evaluate: evaluateAction });
  assert.equal(replay[0].recordedDecision, Decision.ALLOW);
  assert.equal(replay[0].replayedDecision.decision, Decision.ALLOW);
  assert.equal(replay[0].replayedDecision.risk, decision.risk);
});
