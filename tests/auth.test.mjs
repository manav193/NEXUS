import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryAuthStore, createPasswordCredential, verifyPasswordCredential } from "../src/auth/auth.mjs";
import { createSession, isSessionActive } from "../src/auth/session.mjs";

test("password credential stores a derived hash, never plaintext", () => {
  const credential = createPasswordCredential({ username:"Manav_Test", password:"A-very-long-test-password!" });
  assert.equal(credential.username, "manav_test");
  assert.equal(credential.passwordHash.hash.includes("A-very-long-test-password!"), false);
  assert.equal(verifyPasswordCredential("A-very-long-test-password!", credential), true);
  assert.equal(verifyPasswordCredential("wrong-password-value", credential), false);
});

test("memory auth store provides one account across applications", () => {
  const auth = createMemoryAuthStore();
  const identity = auth.register({ username:"student001", password:"A-very-long-test-password!" });
  assert.equal(auth.authenticate({ username:"STUDENT001", password:"A-very-long-test-password!" }).id, identity.id);
  assert.equal(auth.authenticate({ username:"student001", password:"wrong-password-value" }), null);
});

test("duplicate username is rejected", () => {
  const auth = createMemoryAuthStore();
  auth.register({ username:"student001", password:"A-very-long-test-password!" });
  assert.throws(() => auth.register({ username:"student001", password:"Another-long-password!" }), /USERNAME_ALREADY_EXISTS/);
});

test("session expires", () => {
  const identity = { id:"identity-1" };
  const session = createSession({ identity, ttlMs:1000, issuedAt:10000 });
  assert.equal(isSessionActive(session,{now:10500}), true);
  assert.equal(isSessionActive(session,{now:11001}), false);
});
