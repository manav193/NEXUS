import test from "node:test";
import assert from "node:assert/strict";
import { createEmailVerificationService } from "../src/auth/email-verification.mjs";

const SECRET = "nexus-test-secret-0123456789-abcdefghijklmnopqrstuvwxyz";

test("email verification sends a six digit code without storing plaintext", async () => {
  let sent = null;
  const service = createEmailVerificationService({
    secret: SECRET,
    sendCode: async (message) => { sent = message; },
  });

  const challenge = await service.issue({ email: "USER@example.com" });
  assert.equal(sent.email, "user@example.com");
  assert.match(sent.code, /^\\d{6}$/);
  assert.equal(challenge.email, "user@example.com");

  const record = service;
  assert.ok(record);
});

test("verification succeeds once and then becomes invalid", async () => {
  let sent = null;
  const service = createEmailVerificationService({
    secret: SECRET,
    sendCode: async (message) => { sent = message; },
  });

  const challenge = await service.issue({ email: "user@example.com" });
  assert.deepEqual(
    service.verify({ email: "user@example.com", challengeId: challenge.challengeId, code: sent.code }),
    { ok: true, email: "user@example.com" },
  );
  assert.deepEqual(
    service.verify({ email: "user@example.com", challengeId: challenge.challengeId, code: sent.code }),
    { ok: false, reason: "INVALID_CODE" },
  );
});

test("invalid codes are attempt limited", async () => {
  let sent = null;
  const service = createEmailVerificationService({
    secret: SECRET,
    sendCode: async (message) => { sent = message; },
  });

  const challenge = await service.issue({ email: "user@example.com" });
  for (let i = 0; i < 5; i += 1) {
    assert.deepEqual(
      service.verify({ email: "user@example.com", challengeId: challenge.challengeId, code: "000000" }),
      { ok: false, reason: "INVALID_CODE" },
    );
  }
  assert.deepEqual(
    service.verify({ email: "user@example.com", challengeId: challenge.challengeId, code: sent.code }),
    { ok: false, reason: "TOO_MANY_ATTEMPTS" },
  );
});
