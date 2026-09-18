import { collectRiskSignals } from "./signals.mjs";
import { scoreRisk } from "./scorer.mjs";
import { riskDecision } from "./decision.mjs";
export function evaluateRisk({action,context={},highRiskRequiresApproval=true}={}) {
  const signals=collectRiskSignals({...context,sensitiveAction:context.sensitiveAction??false});
  const risk=scoreRisk(signals);
  return Object.freeze({signals,risk,decision:riskDecision({action,risk,highRiskRequiresApproval})});
}
