import { createHash, randomBytes, randomUUID } from "node:crypto";

function hashToken(token) {
  return createHash("sha256").update(token).digest("base64url");
}

export function createSession({ identity, ttlMs = 3600000, issuedAt = Date.now() } = {}) {
  if (!identity?.id) throw new TypeError("Active identity is required");
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new TypeError("ttlMs must be positive");
  const token = randomBytes(32).toString("base64url");
  return Object.freeze({
    id: randomUUID(),
    identityId: identity.id,
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: new Date(issuedAt + ttlMs).toISOString(),
    token,
    tokenHash: hashToken(token),
    version: 1,
  });
}

export function isSessionActive(session, { now = Date.now(), identityActive = true } = {}) {
  return Boolean(identityActive && session?.identityId && new Date(session.expiresAt).getTime() > now && !session.revokedAt);
}

export function createMemorySessionStore() {
  const sessions = new Map();
  return Object.freeze({
    create(session) {
      if (!session?.id || !session?.tokenHash) throw new TypeError("Valid session is required");
      if (sessions.has(session.id)) throw new Error("SESSION_ALREADY_EXISTS");
      const stored = Object.freeze({ ...session, token: undefined });
      sessions.set(session.id, stored);
      return session;
    },
    get(id) { return sessions.get(String(id)) ?? null; },
    revoke(id, { revokedAt = Date.now() } = {}) {
      const current = sessions.get(String(id));
      if (!current) return null;
      const revoked = Object.freeze({ ...current, revokedAt: new Date(revokedAt).toISOString() });
      sessions.set(current.id, revoked);
      return revoked;
    },
    findByToken(token) {
      if (typeof token !== "string" || !token) return null;
      const tokenHash = hashToken(token);
      for (const session of sessions.values()) {
        if (session.tokenHash === tokenHash) return session;
      }
      return null;
    },
    listByIdentity(identityId) {
      return [...sessions.values()].filter((session) => session.identityId === String(identityId));
    },
  });
}
