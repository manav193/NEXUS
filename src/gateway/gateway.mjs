import { randomUUID } from "node:crypto";
import { Decision } from "../core/types.mjs";
import { evaluateAction } from "../core/policy.mjs";
import { NexusGatewayError } from "./errors.mjs";
import { AuditEventType, createAuditEvent } from "../observability/audit.mjs";

function assertAdapter(adapter) {
  if (!adapter || typeof adapter.execute !== "function") throw new NexusGatewayError("Invalid execution adapter", "INVALID_ADAPTER");
}
function emit(auditSink, event) {
  if (auditSink == null) return;
  if (typeof auditSink.append !== "function") throw new NexusGatewayError("Invalid audit sink", "INVALID_AUDIT_SINK");
  auditSink.append(event);
}

export async function executeThroughGateway({
  action, policies = [], adapter, approval = false,
  auditSink = null, correlationId = randomUUID(),
}) {
  if (!action) throw new NexusGatewayError("Action is required", "INVALID_ACTION");
  assertAdapter(adapter);
  const decision = evaluateAction(action, policies);

  emit(auditSink, createAuditEvent({ type: AuditEventType.DECISION, action, decision, correlationId }));

  if (decision.decision === Decision.DENY ||
      (decision.decision === Decision.REQUIRE_APPROVAL && approval !== true)) {
    emit(auditSink, createAuditEvent({ type: AuditEventType.BLOCKED, action, decision, correlationId }));
    return Object.freeze({ executed: false, decision, result: null, correlationId });
  }

  try {
    const result = await adapter.execute(action);
    emit(auditSink, createAuditEvent({ type: AuditEventType.EXECUTION, action, decision, result, correlationId }));
    return Object.freeze({ executed: true, decision, result: result ?? null, correlationId });
  } catch (error) {
    const wrapped = new NexusGatewayError("Execution adapter failed", "ADAPTER_EXECUTION_FAILED", error);
    emit(auditSink, createAuditEvent({ type: AuditEventType.ERROR, action, decision, errorCode: wrapped.code, correlationId }));
    throw wrapped;
  }
}
