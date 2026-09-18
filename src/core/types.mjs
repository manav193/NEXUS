/**
 * Canonical NEXUS action and decision contracts.
 * No external dependencies.
 */

export const Decision = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY",
  REQUIRE_APPROVAL: "REQUIRE_APPROVAL",
});

export const RiskLevel = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
});

export function createAction(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("Action must be an object");
  }

  const { actor = "unknown", tool, operation, resource = null, parameters = {} } = input;

  if (!tool || typeof tool !== "string") throw new TypeError("Action.tool is required");
  if (!operation || typeof operation !== "string") throw new TypeError("Action.operation is required");
  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    throw new TypeError("Action.parameters must be a plain object");
  }

  return Object.freeze({
    actor: String(actor),
    tool: String(tool),
    operation: String(operation),
    resource: resource == null ? null : String(resource),
    parameters: Object.freeze({ ...parameters }),
  });
}

export function createDecision({ decision, risk, reasonCodes = [], matchedPolicies = [], action }) {
  if (!Object.values(Decision).includes(decision)) throw new TypeError("Invalid decision");
  if (!Object.values(RiskLevel).includes(risk)) throw new TypeError("Invalid risk");
  if (!action) throw new TypeError("Decision.action is required");

  return Object.freeze({
    decision,
    risk,
    reasonCodes: Object.freeze([...reasonCodes]),
    matchedPolicies: Object.freeze([...matchedPolicies]),
    action,
    engineVersion: "0.1.0",
  });
}
