import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

const CODE_LENGTH = 6;
const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_RESEND_MS = 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;

function normalizeEmail(email) {
  const value = String(email ?? "").trim().toLowerCase();
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) throw new TypeError("Invalid email");
  return value;
}

function digest(secret, challengeId, code) {
  return createHmac("sha256", secret).update(challengeId).update(":").update(code).digest();
}

export function createEmailVerificationService({
  secret,
  ttlMs = DEFAULT_TTL_MS,
  resendMs = DEFAULT_RESEND_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  now = () => Date.now(),
  sendCode,
  store = new Map(),
} = {}) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new TypeError("A 32+ character verification secret is required");
  }
  if (typeof sendCode !== "function") throw new TypeError("sendCode is required");

  return Object.freeze({
    async issue({ email } = {}) {
      const normalizedEmail = normalizeEmail(email);
      const current = store.get(normalizedEmail);
      const timestamp = now();
      if (current && timestamp - current.issuedAt < resendMs) {
        throw new Error("VERIFICATION_RESEND_COOLDOWN");
      }

      const challengeId = randomUUID();
      const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
      const record = Object.freeze({
        challengeId,
        email: normalizedEmail,
        issuedAt: timestamp,
        expiresAt: timestamp + ttlMs,
        attempts: 0,
        maxAttempts,
        digest: digest(secret, challengeId, code),
      });
      store.set(normalizedEmail, record);

      await sendCode({ email: normalizedEmail, code, expiresInMs: ttlMs });
      return Object.freeze({ challengeId, email: normalizedEmail, expiresAt: record.expiresAt });
    },

    verify({ email, challengeId, code } = {}) {
      const normalizedEmail = normalizeEmail(email);
      const record = store.get(normalizedEmail);
      if (!record || record.challengeId !== challengeId) return { ok: false, reason: "INVALID_CODE" };
      if (now() >= record.expiresAt) {
        store.delete(normalizedEmail);
        return { ok: false, reason: "CODE_EXPIRED" };
      }
      if (record.attempts >= record.maxAttempts) return { ok: false, reason: "TOO_MANY_ATTEMPTS" };

      const supplied = String(code ?? "");
      const expected = record.digest;
      const actual = digest(secret, challengeId, supplied);
      const valid = actual.length === expected.length && timingSafeEqual(actual, expected);

      if (!valid) {
        store.set(normalizedEmail, Object.freeze({ ...record, attempts: record.attempts + 1 }));
        return { ok: false, reason: "INVALID_CODE" };
      }

      store.delete(normalizedEmail);
      return { ok: true, email: normalizedEmail };
    },
  });
}

export const EmailVerificationDefaults = Object.freeze({
  CODE_LENGTH,
  TTL_MS: DEFAULT_TTL_MS,
  RESEND_MS: DEFAULT_RESEND_MS,
  MAX_ATTEMPTS: DEFAULT_MAX_ATTEMPTS,
});
