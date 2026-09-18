import { RiskLevel } from "./types.mjs";

const CRITICAL_OPERATIONS = new Set([
  "delete_repository",
  "delete_file",
  "revoke_token",
  "wipe_data",
  "shutdown_system",
]);

const HIGH_OPERATIONS = new Set([
  "write_repository",
  "push_code",
  "deploy_production",
  "send_email",
  "execute_shell",
]);

const MEDIUM_OPERATIONS = new Set([
  "write_file",
  "create_issue",
  "update_issue",
  "http_request",
]);

export function classifyRisk(action) {
  if (CRITICAL_OPERATIONS.has(action.operation)) return RiskLevel.CRITICAL;
  if (HIGH_OPERATIONS.has(action.operation)) return RiskLevel.HIGH;
  if (MEDIUM_OPERATIONS.has(action.operation)) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}
