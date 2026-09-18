import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

export const AuthStatus = Object.freeze({ ACTIVE:"ACTIVE", LOCKED:"LOCKED", REVOKED:"REVOKED" });

function hashPassword(password, salt = randomUUID()) {
  if (typeof password !== "string" || password.length < 12) throw new TypeError("Password must be at least 12 characters");
  const derived = scryptSync(password, salt, 32);
  return { salt, hash: derived.toString("base64") };
}

function verifyPassword(password, record) {
  if (typeof password !== "string" || !record?.salt || !record?.hash) return false;
  const derived = scryptSync(password, record.salt, 32);
  const expected = Buffer.from(record.hash, "base64");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function createPasswordCredential({ username, password } = {}) {
  if (!username || typeof username !== "string") throw new TypeError("Username is required");
  const normalizedUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,64}$/.test(normalizedUsername)) throw new TypeError("Invalid username");
  const credential = hashPassword(password);
  return Object.freeze({
    username: normalizedUsername,
    passwordHash: Object.freeze(credential),
    algorithm: "scrypt",
    version: 1,
  });
}

export function verifyPasswordCredential(password, credential) {
  return verifyPassword(password, credential?.passwordHash ? credential : null);
}

export function createMemoryAuthStore() {
  const accounts = new Map();
  return Object.freeze({
    register({ username, password } = {}) {
      const credential = createPasswordCredential({ username, password });
      if (accounts.has(credential.username)) throw new Error("USERNAME_ALREADY_EXISTS");
      const identity = Object.freeze({
        id: randomUUID(),
        username: credential.username,
        status: AuthStatus.ACTIVE,
      });
      accounts.set(credential.username, Object.freeze({ identity, credential }));
      return identity;
    },
    authenticate({ username, password } = {}) {
      const key = String(username ?? "").trim().toLowerCase();
      const account = accounts.get(key);
      if (!account || account.identity.status !== AuthStatus.ACTIVE) return null;
      return verifyPasswordCredential(password, account.credential) ? account.identity : null;
    },
    get(username) {
      return accounts.get(String(username ?? "").trim().toLowerCase())?.identity ?? null;
    },
  });
}
