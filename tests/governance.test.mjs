import test from "node:test";
import assert from "node:assert/strict";
import { createIdentity, IdentityStatus } from "../src/identity/identity.mjs";
import { createResource, DataClass, ResourceOperation, canAccessResource } from "../src/data/resource.mjs";
import { createMemoryDataStore } from "../src/data/store.mjs";
import { createConsent, hasConsent, ConsentStatus } from "../src/governance/consent.mjs";

test("active identity owns and can read personal resource", () => {
  const identity = createIdentity({ id:"student-1", subject:"college:user:1" });
  const resource = createResource({ ownerId:"student-1", type:"lab_report", dataClass:DataClass.PERSONAL, storageKey:"users/student-1/labs/report-1" });
  assert.deepEqual(canAccessResource({identity, resource, operation:ResourceOperation.READ}), {allowed:true, reason:"AUTHORIZED"});
});

test("inactive identity is denied", () => {
  const identity = createIdentity({ id:"student-1", subject:"college:user:1", status:IdentityStatus.SUSPENDED });
  const resource = createResource({ ownerId:"student-1", type:"chat", storageKey:"users/student-1/chats/1" });
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.READ}).allowed, false);
});

test("cross-user access is denied by default", () => {
  const identity = createIdentity({ id:"student-1", subject:"college:user:1" });
  const resource = createResource({ ownerId:"student-2", type:"image", storageKey:"users/student-2/images/1" });
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.READ}).reason, "RESOURCE_OWNERSHIP_REQUIRED");
});

test("restricted resources require explicit policy", () => {
  const identity = createIdentity({ id:"student-1", subject:"college:user:1" });
  const resource = createResource({ ownerId:"student-1", type:"identity_document", dataClass:DataClass.RESTRICTED, storageKey:"users/student-1/docs/id" });
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.READ}).allowed, false);
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.READ, policy:{allowRestricted:true}}).allowed, true);
});

test("delete and export require explicit policy", () => {
  const identity = createIdentity({ id:"student-1", subject:"college:user:1" });
  const resource = createResource({ ownerId:"student-1", type:"photo", storageKey:"users/student-1/images/1" });
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.DELETE}).allowed, false);
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.EXPORT}).allowed, false);
  assert.equal(canAccessResource({identity, resource, operation:ResourceOperation.DELETE, policy:{allowDelete:true}}).allowed, true);
});

test("consent can be purpose and resource-type scoped", () => {
  const consent = createConsent({ identityId:"student-1", purpose:"reverse_image_analysis", resourceType:"image" });
  assert.equal(hasConsent([consent], {identityId:"student-1", purpose:"reverse_image_analysis", resourceType:"image"}), true);
  assert.equal(hasConsent([consent], {identityId:"student-1", purpose:"training", resourceType:"image"}), false);
  assert.equal(hasConsent([{...consent,status:ConsentStatus.REVOKED}], {identityId:"student-1", purpose:"reverse_image_analysis", resourceType:"image"}), false);
});

test("memory store isolates resources by owner", () => {
  const store = createMemoryDataStore();
  store.create({ownerId:"student-1",type:"chat",storageKey:"users/student-1/chats/1"});
  store.create({ownerId:"student-2",type:"chat",storageKey:"users/student-2/chats/1"});
  assert.equal(store.listByOwner("student-1").length, 1);
  assert.equal(store.listByOwner("student-1")[0].ownerId, "student-1");
});
