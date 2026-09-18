import { randomUUID } from "node:crypto";

export function createSession({ identity, ttlMs = 3600000, issuedAt = Date.now() } = {}) {
  if (!identity?.id) throw new TypeError("Active identity is required");
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new TypeError("ttlMs must be positive");
  return Object.freeze({
    id: randomUUID(),
    identityId: identity.id,
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: new Date(issuedAt + ttlMs).toISOString(),
  });
}

export function isSessionActive(session, { now = Date.now() } = {}) {
  return Boolean(session?.identityId && new Date(session.expiresAt).getTime() > now);
}
