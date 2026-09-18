import { randomUUID } from "node:crypto";
import { fingerprintAction } from "../core/canonical.mjs";

export const ApprovalStatus = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
  EXPIRED: "EXPIRED",
  CONSUMED: "CONSUMED",
});

function nowMs(clock) { return clock ? clock() : Date.now(); }

export function createApprovalRequest({
  action, decision, requester = "unknown", ttlMs = 300000, correlationId = randomUUID(),
  id = randomUUID(), createdAt = new Date().toISOString(), policyVersion = "unversioned",
}) {
  if (!action || !decision) throw new TypeError("Approval request requires action and decision");
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new TypeError("ttlMs must be a positive safe integer");
  return Object.freeze({
    id, action, actionFingerprint: fingerprintAction(action), decision,
    requester: String(requester), policyVersion: String(policyVersion), correlationId: String(correlationId),
    status: ApprovalStatus.PENDING, createdAt,
    expiresAt: new Date(new Date(createdAt).getTime() + ttlMs).toISOString(),
    consumedAt: null, approver: null,
  });
}

export function createMemoryApprovalStore({ clock = Date.now } = {}) {
  const requests = new Map();
  return Object.freeze({
    create(request) {
      if (requests.has(request.id)) throw new Error("Approval request already exists");
      requests.set(request.id, request);
      return request;
    },
    get(id) { return requests.get(id) ?? null; },
    list() { return [...requests.values()]; },
    decide(id, { approved, approver = "unknown" } = {}) {
      const current = requests.get(id);
      if (!current) throw new Error("Approval request not found");
      if (current.status !== ApprovalStatus.PENDING) return current;
      if (new Date(current.expiresAt).getTime() <= nowMs(clock)) {
        const expired = Object.freeze({ ...current, status: ApprovalStatus.EXPIRED });
        requests.set(id, expired);
        return expired;
      }
      const next = Object.freeze({
        ...current,
        status: approved === true ? ApprovalStatus.APPROVED : ApprovalStatus.DENIED,
        approver: String(approver),
      });
      requests.set(id, next);
      return next;
    },
    consume(id, { actor = "unknown", action = null, policyVersion = "unversioned" } = {}) {
      const current = requests.get(id);
      if (!current) throw new Error("Approval request not found");
      if (current.status !== ApprovalStatus.APPROVED) return { approved: false, request: current };
      if (new Date(current.expiresAt).getTime() <= nowMs(clock)) {
        const expired = Object.freeze({ ...current, status: ApprovalStatus.EXPIRED });
        requests.set(id, expired);
        return { approved: false, request: expired };
      }
      if (action && fingerprintAction(action) !== current.actionFingerprint) {
        return { approved: false, request: current, reason: "APPROVAL_ACTION_MISMATCH" };
      }
      if (String(policyVersion) !== current.policyVersion) {
        return { approved: false, request: current, reason: "APPROVAL_POLICY_VERSION_MISMATCH" };
      }
      const consumed = Object.freeze({
        ...current, status: ApprovalStatus.CONSUMED,
        consumedAt: new Date(nowMs(clock)).toISOString(), consumedBy: String(actor),
      });
      requests.set(id, consumed);
      return { approved: true, request: consumed };
    },
  });
}
