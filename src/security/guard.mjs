import { createHash } from "node:crypto";
import { Decision } from "../core/types.mjs";

export const SecurityReason = Object.freeze({ KILL_SWITCH_ACTIVE:"KILL_SWITCH_ACTIVE", TOOL_NOT_ALLOWED:"TOOL_NOT_ALLOWED", OPERATION_NOT_ALLOWED:"OPERATION_NOT_ALLOWED", SECRET_DETECTED:"SECRET_DETECTED", PROMPT_INJECTION_PATTERN:"PROMPT_INJECTION_PATTERN" });
const INJECTION_PATTERNS = [/ignore\s+(all|any|the)\s+(previous|prior|above)\s+instructions/i, /disregard\s+(all|any|the)\s+(previous|prior|above)/i, /system\s+prompt/i, /reveal\s+(the\s+)?(system|developer)\s+instructions/i, /bypass\s+(security|policy|approval)/i, /disable\s+(safety|security|policy)/i];
const SECRET_PATTERNS = [/(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{12,}/i, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /ghp_[A-Za-z0-9]{20,}/, /sk-[A-Za-z0-9]{20,}/];
function containsPattern(value, patterns) { const text = typeof value === "string" ? value : JSON.stringify(value); return patterns.some((p) => p.test(text)); }
export function createSecurityGuard({ allowedTools = [], allowedOperations = {}, killSwitch = null } = {}) {
 const tools = new Set(allowedTools.map(String));
 const operations = new Map(Object.entries(allowedOperations).map(([tool, ops]) => [String(tool), new Set(ops.map(String))]));
 return Object.freeze({ inspect(action) {
   const reasons = [];
   if (killSwitch?.isActive?.()) reasons.push(SecurityReason.KILL_SWITCH_ACTIVE);
   if (tools.size && !tools.has(action.tool)) reasons.push(SecurityReason.TOOL_NOT_ALLOWED);
   const allowed = operations.get(action.tool); if (allowed && !allowed.has(action.operation)) reasons.push(SecurityReason.OPERATION_NOT_ALLOWED);
   if (containsPattern(action.parameters, SECRET_PATTERNS)) reasons.push(SecurityReason.SECRET_DETECTED);
   if (containsPattern(action.parameters, INJECTION_PATTERNS)) reasons.push(SecurityReason.PROMPT_INJECTION_PATTERN);
   return Object.freeze({ allowed: reasons.length === 0, decision: reasons.length ? Decision.DENY : Decision.ALLOW, reasonCodes: Object.freeze(reasons) });
 } });
}
export function createKillSwitch({ active = false } = {}) { let state = Boolean(active); return Object.freeze({ activate(){state=true;}, deactivate(){state=false;}, isActive(){return state;} }); }
export function redactSecrets(value) {
 if (typeof value === "string") return value.replace(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,"[REDACTED_PRIVATE_KEY]").replace(/(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*(['"]?)[A-Za-z0-9_\-./+=]{12,}\1/gi,"$1[REDACTED_SECRET]$1").replace(/ghp_[A-Za-z0-9]{20,}/g,"[REDACTED_GITHUB_TOKEN]").replace(/sk-[A-Za-z0-9]{20,}/g,"[REDACTED_API_KEY]");
 if (Array.isArray(value)) return value.map(redactSecrets);
 if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,/secret|token|password|api[_-]?key/i.test(k)?"[REDACTED_SECRET]":redactSecrets(v)]));
 return value;
}
export function fingerprintAction(action) { return createHash("sha256").update(JSON.stringify(action)).digest("hex"); }