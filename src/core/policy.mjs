import { Decision, createDecision } from "./types.mjs";
import { classifyRisk } from "./risk.mjs";

function matches(match, action) {
  if (!match) return true;
  return Object.entries(match).every(([key, expected]) => {
    if (key === "parameters") return false;
    return action[key] === expected;
  });
}

export function evaluateAction(action, policies = []) {
  const risk = classifyRisk(action);
  const matched = [];

  for (const policy of policies) {
    if (!policy || typeof policy !== "object") {
      return createDecision({
        decision: Decision.DENY,
        risk,
        reasonCodes: ["INVALID_POLICY"],
        matchedPolicies: matched,
        action,
      });
    }

    if (!policy.id || !policy.effect || !Object.values(Decision).includes(policy.effect)) {
      return createDecision({
        decision: Decision.DENY,
        risk,
        reasonCodes: ["INVALID_POLICY"],
        matchedPolicies: matched,
        action,
      });
    }

    if (!matches(policy.match, action)) continue;

    matched.push(policy.id);

    if (policy.effect === Decision.DENY) {
      return createDecision({
        decision: Decision.DENY,
        risk,
        reasonCodes: policy.reasonCodes ?? ["POLICY_DENY"],
        matchedPolicies: matched,
        action,
      });
    }

    if (policy.effect === Decision.REQUIRE_APPROVAL) {
      return createDecision({
        decision: Decision.REQUIRE_APPROVAL,
        risk,
        reasonCodes: policy.reasonCodes ?? ["POLICY_APPROVAL_REQUIRED"],
        matchedPolicies: matched,
        action,
      });
    }

    if (policy.effect === Decision.ALLOW) {
      return createDecision({
        decision: Decision.ALLOW,
        risk,
        reasonCodes: policy.reasonCodes ?? ["POLICY_ALLOW"],
        matchedPolicies: matched,
        action,
      });
    }
  }

  // Secure default: non-trivial actions do not fail open.
  const fallback =
    risk === "LOW" ? Decision.ALLOW : Decision.REQUIRE_APPROVAL;

  return createDecision({
    decision: fallback,
    risk,
    reasonCodes: [fallback === Decision.ALLOW ? "DEFAULT_LOW_RISK" : "DEFAULT_REVIEW_REQUIRED"],
    matchedPolicies: matched,
    action,
  });
}
