import test from "node:test";
import assert from "node:assert/strict";
import {
  createAction, Decision, evaluateAction, executeThroughGateway,
  createMemoryAdapter, createSecurityGuard, createKillSwitch,
  createMemoryApprovalStore, createApprovalRequest,
  createMemoryAuditSink, createIdentity, IdentityStatus,
  createResource, DataClass, ResourceOperation, canAccessResource,
  createConsent, hasConsent, createMemoryAuthStore,
  createSession, createMemorySessionStore, isSessionActive,
  evaluateRisk,
} from "../src/index.mjs";

test("QA: dangerous action cannot execute through default gateway", async () => {
  const adapter=createMemoryAdapter();
  const action=createAction({actor:"qa",tool:"github",operation:"delete_repository",resource:"demo"});
  const result=await executeThroughGateway({action,adapter});
  assert.equal(result.executed,false);
  assert.equal(result.decision.decision,Decision.REQUIRE_APPROVAL);
  assert.equal(adapter.calls.length,0);
});

test("QA: security DENY wins before policy approval", async () => {
  const adapter=createMemoryAdapter();
  const guard=createSecurityGuard({allowedTools:["github"]});
  const action=createAction({actor:"qa",tool:"shell",operation:"execute_shell"});
  const result=await executeThroughGateway({action,adapter,securityGuard:guard,approval:true,policies:[{id:"allow",effect:Decision.ALLOW}]});
  assert.equal(result.executed,false);
  assert.equal(result.decision.decision,Decision.DENY);
  assert.equal(adapter.calls.length,0);
});

test("QA: kill switch blocks execution immediately", async () => {
  const adapter=createMemoryAdapter();
  const kill=createKillSwitch({active:true});
  const guard=createSecurityGuard({killSwitch:kill});
  const action=createAction({actor:"qa",tool:"github",operation:"read_repository"});
  const result=await executeThroughGateway({action,adapter,securityGuard:guard});
  assert.equal(result.executed,false);
  assert.equal(result.decision.reasonCodes.includes("KILL_SWITCH_ACTIVE"),true);
});

test("QA: approval is bound to action and policy version", async () => {
  const store=createMemoryApprovalStore();
  const adapter=createMemoryAdapter();
  const action=createAction({actor:"qa",tool:"shell",operation:"execute_shell",parameters:{cmd:"safe"}});
  const request=createApprovalRequest({action,decision:{decision:Decision.REQUIRE_APPROVAL},requester:"qa",policyVersion:"v1"});
  store.create(request);
  store.decide(request.id,{approved:true,approver:"human"});
  const mismatch=await executeThroughGateway({action,adapter,approvalStore:store,approvalRequestId:request.id,policyVersion:"v2"});
  assert.equal(mismatch.executed,false);
  assert.equal(adapter.calls.length,0);
});

test("QA: audit trail records blocked security action", async () => {
  const audit=createMemoryAuditSink();
  const guard=createSecurityGuard({allowedTools:["github"]});
  const action=createAction({actor:"qa",tool:"shell",operation:"execute_shell"});
  await executeThroughGateway({action,adapter:createMemoryAdapter(),securityGuard:guard,auditSink:audit});
  const events=audit.list();
  assert.equal(events.some(e=>e.type==="BLOCKED"),true);
  assert.equal(events.every(e=>e.action && e.decision),true);
});

test("QA: cross-user resource access stays denied", () => {
  const identity=createIdentity({id:"user-a",subject:"qa:a"});
  const resource=createResource({ownerId:"user-b",type:"photo",dataClass:DataClass.PERSONAL,storageKey:"users/user-b/photo"});
  assert.equal(canAccessResource({identity,resource,operation:ResourceOperation.READ}).allowed,false);
});

test("QA: revoked identity cannot access resources", () => {
  const identity=createIdentity({id:"user-a",subject:"qa:a",status:IdentityStatus.REVOKED});
  const resource=createResource({ownerId:"user-a",type:"chat",storageKey:"users/user-a/chat"});
  assert.equal(canAccessResource({identity,resource,operation:ResourceOperation.READ}).allowed,false);
});

test("QA: revoked consent is not accepted", () => {
  const consent=createConsent({identityId:"user-a",purpose:"analysis",resourceType:"image",status:"REVOKED"});
  assert.equal(hasConsent([consent],{identityId:"user-a",purpose:"analysis",resourceType:"image"}),false);
});

test("QA: session revocation is enforced", () => {
  const session=createSession({identity:{id:"user-a"},ttlMs:60000});
  const store=createMemorySessionStore();
  store.create(session);
  store.revoke(session.id);
  assert.equal(isSessionActive(store.get(session.id)),false);
  assert.equal(store.findByToken(session.token).revokedAt != null,true);
});

test("QA: risk engine escalates multiple suspicious signals", () => {
  const action=createAction({actor:"qa",tool:"http",operation:"http_request"});
  const result=evaluateRisk({action,context:{knownBadIndicator:true,suspiciousInput:true,impossibleTravel:true}});
  assert.equal(result.risk.level,"CRITICAL");
  assert.equal(result.decision.decision,Decision.DENY);
});

test("QA: normal read remains low risk", () => {
  const action=createAction({actor:"qa",tool:"github",operation:"read_repository"});
  const result=evaluateRisk({action});
  assert.equal(result.risk.level,"LOW");
  assert.equal(result.decision.decision,Decision.ALLOW);
});
