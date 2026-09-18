import { NexusGatewayError } from "../../gateway/errors.mjs";

export function createNimoAdapter({ send } = {}) {
  if (send != null && typeof send !== "function") {
    throw new NexusGatewayError("Invalid NIMO transport", "INVALID_NIMO_TRANSPORT");
  }

  return Object.freeze({
    async execute(action) {
      if (!send) {
        throw new NexusGatewayError("NIMO transport is not configured", "NIMO_TRANSPORT_NOT_CONFIGURED");
      }
      return send({
        type: "NEXUS_ACTION",
        action,
      });
    },
  });
}

export function createNimoKnowledgeBridge({ evaluate } = {}) {
  if (evaluate != null && typeof evaluate !== "function") {
    throw new NexusGatewayError("Invalid knowledge evaluator", "INVALID_KNOWLEDGE_EVALUATOR");
  }

  return Object.freeze({
    async evaluateAction({ action, context = null }) {
      if (!evaluate) {
        throw new NexusGatewayError("NIMO-KNOWLEDGE evaluator is not configured", "KNOWLEDGE_EVALUATOR_NOT_CONFIGURED");
      }
      return evaluate({ action, context });
    },
  });
}
