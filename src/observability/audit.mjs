import { randomUUID } from "node:crypto";

export const AuditEventType = Object.freeze({
  DECISION: "DECISION",
  EXECUTION: "EXECUTION",
  BLOCKED: "BLOCKED",
  ERROR: "ERROR",
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createAuditEvent({
  type, action, decision, correlationId = randomUUID(),
  result = null, errorCode = null, timestamp = new Date().toISOString(),
}) {
  if (!Object.values(AuditEventType).includes(type)) throw new TypeError("Invalid audit event type");
  if (!action || !decision) throw new TypeError("Audit event requires action and decision");

  return Object.freeze({
    id: randomUUID(),
    timestamp,
    correlationId: String(correlationId),
    type,
    action: clone(action),
    decision: clone(decision),
    result: result == null ? null : clone(result),
    errorCode: errorCode == null ? null : String(errorCode),
    schemaVersion: "0.1.0",
  });
}

export function createMemoryAuditSink() {
  const events = [];
  return Object.freeze({
    events,
    append(event) {
      if (!event || typeof event !== "object") throw new TypeError("Audit event must be an object");
      events.push(Object.freeze(clone(event)));
      return event.id;
    },
    list({ correlationId = null } = {}) {
      const selected = correlationId == null ? events : events.filter((e) => e.correlationId === String(correlationId));
      return selected.map(clone);
    },
    clear() { events.length = 0; },
  });
}

export function replayDecision(events, { evaluate, policies = [] } = {}) {
  if (typeof evaluate !== "function") throw new TypeError("evaluate function is required");
  return events.filter((e) => e?.type === AuditEventType.DECISION).map((e) => ({
    eventId: e.id,
    correlationId: e.correlationId,
    recordedDecision: e.decision.decision,
    replayedDecision: evaluate(e.action, policies),
  }));
}
