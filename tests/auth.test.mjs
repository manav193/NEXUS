import test from "node:test";
import assert from "node:assert/strict";
import { AuthStatus, createMemoryAuthStore, createPasswordCredential, verifyPasswordCredential } from "../src/auth/auth.mjs";
import { createMemorySessionStore, createSession, isSessionActive } from "../src/auth/session.mjs";

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

test("locked and revoked accounts cannot authenticate", () => {
  const auth = createMemoryAuthStore();
  auth.register({ username:"student002", password:"A-very-long-test-password!" });
  assert.equal(auth.setStatus("student002", AuthStatus.LOCKED).status, AuthStatus.LOCKED);
  assert.equal(auth.authenticate({ username:"student002", password:"A-very-long-test-password!" }), null);
  assert.equal(auth.setStatus("student002", AuthStatus.REVOKED).status, AuthStatus.REVOKED);
  assert.equal(auth.authenticate({ username:"student002", password:"A-very-long-test-password!" }), null);
});

test("session is short-lived and active until expiry", () => {
  const identity = { id:"identity-1" };
  const session = createSession({ identity, ttlMs:1000, issuedAt:10000 });
  assert.equal(typeof session.token, "string");
  assert.equal(session.token.length >= 40, true);
  assert.equal(isSessionActive(session,{now:10500}), true);
  assert.equal(isSessionActive(session,{now:11001}), false);
});

test("session store never persists the raw bearer token", () => {
  const store = createMemorySessionStore();
  const session = createSession({ identity:{id:"identity-2"}, issuedAt:10000 });
  store.create(session);
  assert.equal(store.get(session.id).token, undefined);
  assert.equal(store.findByToken(session.token).id, session.id);
});

test("revoked session is inactive and cannot be resolved as active", () => {
  const store = createMemorySessionStore();
  const session = createSession({ identity:{id:"identity-3"}, issuedAt:10000 });
  store.create(session);
  const revoked = store.revoke(session.id, { revokedAt:10500 });
  assert.equal(isSessionActive(revoked,{now:10600}), false);
  assert.equal(store.findByToken(session.token).revokedAt, revoked.revokedAt);
});
