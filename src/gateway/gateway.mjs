import { Decision } from "../core/types.mjs";
import { evaluateAction } from "../core/policy.mjs";
import { NexusGatewayError } from "./errors.mjs";

function assertAdapter(adapter) {
  if (!adapter || typeof adapter.execute !== "function") {
    throw new NexusGatewayError("Invalid execution adapter", "INVALID_ADAPTER");
  }
}

export async function executeThroughGateway({ action, policies = [], adapter, approval = false }) {
  if (!action) throw new NexusGatewayError("Action is required", "INVALID_ACTION");
  assertAdapter(adapter);

  const decision = evaluateAction(action, policies);

  if (decision.decision === Decision.DENY) {
    return Object.freeze({ executed: false, decision, result: null });
  }

  if (decision.decision === Decision.REQUIRE_APPROVAL && approval !== true) {
    return Object.freeze({ executed: false, decision, result: null });
  }

  try {
    const result = await adapter.execute(action);
    return Object.freeze({
      executed: true,
      decision,
      result: result ?? null,
    });
  } catch (error) {
    throw new NexusGatewayError(
      "Execution adapter failed",
      "ADAPTER_EXECUTION_FAILED",
      error,
    );
  }
}
