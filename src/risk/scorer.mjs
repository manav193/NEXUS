import { RiskLevel } from "../core/types.mjs";
import { RiskSignal } from "./signals.mjs";
const WEIGHTS=Object.freeze({
  [RiskSignal.NEW_IDENTITY]:20,[RiskSignal.NEW_DEVICE]:15,[RiskSignal.UNUSUAL_IP]:15,
  [RiskSignal.FAILED_LOGIN_VELOCITY]:20,[RiskSignal.REQUEST_VELOCITY]:25,
  [RiskSignal.SENSITIVE_ACTION]:30,[RiskSignal.SUSPICIOUS_INPUT]:30,
  [RiskSignal.KNOWN_BAD_INDICATOR]:50,[RiskSignal.IMPOSSIBLE_TRAVEL]:25,
});
export function scoreRisk(signals=[]) {
  const unique=[...new Set(signals)];
  const score=Math.min(100,unique.reduce((sum,s)=>sum+(WEIGHTS[s]??0),0));
  const level=score>=80?RiskLevel.CRITICAL:score>=60?RiskLevel.HIGH:score>=30?RiskLevel.MEDIUM:RiskLevel.LOW;
  return Object.freeze({score,level,signals:Object.freeze(unique),reasons:Object.freeze(unique.map(s=>({signal:s,weight:WEIGHTS[s]??0})))});
}
