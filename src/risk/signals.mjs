export const RiskSignal = Object.freeze({
  NEW_IDENTITY:"NEW_IDENTITY", NEW_DEVICE:"NEW_DEVICE", UNUSUAL_IP:"UNUSUAL_IP",
  FAILED_LOGIN_VELOCITY:"FAILED_LOGIN_VELOCITY", REQUEST_VELOCITY:"REQUEST_VELOCITY",
  SENSITIVE_ACTION:"SENSITIVE_ACTION", SUSPICIOUS_INPUT:"SUSPICIOUS_INPUT",
  KNOWN_BAD_INDICATOR:"KNOWN_BAD_INDICATOR", IMPOSSIBLE_TRAVEL:"IMPOSSIBLE_TRAVEL",
});
export function collectRiskSignals(context = {}) {
  const signals=[];
  if(context.newIdentity)signals.push(RiskSignal.NEW_IDENTITY);
  if(context.newDevice)signals.push(RiskSignal.NEW_DEVICE);
  if(context.unusualIp)signals.push(RiskSignal.UNUSUAL_IP);
  if((context.failedLogins??0)>=5)signals.push(RiskSignal.FAILED_LOGIN_VELOCITY);
  if((context.requestsLastMinute??0)>=60)signals.push(RiskSignal.REQUEST_VELOCITY);
  if(context.sensitiveAction)signals.push(RiskSignal.SENSITIVE_ACTION);
  if(context.suspiciousInput)signals.push(RiskSignal.SUSPICIOUS_INPUT);
  if(context.knownBadIndicator)signals.push(RiskSignal.KNOWN_BAD_INDICATOR);
  if(context.impossibleTravel)signals.push(RiskSignal.IMPOSSIBLE_TRAVEL);
  return Object.freeze([...new Set(signals)]);
}
