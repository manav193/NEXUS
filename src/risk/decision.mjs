import { Decision, RiskLevel, createDecision } from "../core/types.mjs";
export function riskDecision({action,risk,highRiskRequiresApproval=true}={}) {
  if(!action||!risk||!Object.values(RiskLevel).includes(risk.level))throw new TypeError("action and valid risk are required");
  const decision=risk.level===RiskLevel.CRITICAL?Decision.DENY:risk.level===RiskLevel.HIGH&&highRiskRequiresApproval?Decision.REQUIRE_APPROVAL:Decision.ALLOW;
  return createDecision({decision,risk:risk.level,reasonCodes:risk.signals,matchedPolicies:[],action});
}
