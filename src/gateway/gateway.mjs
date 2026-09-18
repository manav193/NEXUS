import { randomUUID } from "node:crypto";
import { Decision, createDecision } from "../core/types.mjs";
import { evaluateAction } from "../core/policy.mjs";
import { NexusGatewayError } from "./errors.mjs";
import { AuditEventType, createAuditEvent } from "../observability/audit.mjs";

function assertAdapter(adapter) { if (!adapter || typeof adapter.execute !== "function") throw new NexusGatewayError("Invalid execution adapter","INVALID_ADAPTER"); }
function emit(sink,event) { if(sink==null)return; if(typeof sink.append!=="function")throw new NexusGatewayError("Invalid audit sink","INVALID_AUDIT_SINK"); sink.append(event); }

export async function executeThroughGateway({
  action, policies=[], adapter, approval=false, approvalRequestId=null, approvalStore=null,
  auditSink=null, correlationId=randomUUID(), actor=action?.actor??"unknown", securityGuard=null,
  policyVersion="unversioned",
}) {
  if(!action) throw new NexusGatewayError("Action is required","INVALID_ACTION");
  assertAdapter(adapter);

  if(securityGuard) {
    const security=securityGuard.inspect(action);
    if(security.decision===Decision.DENY) {
      const blocked=createDecision({decision:Decision.DENY,risk:"CRITICAL",reasonCodes:security.reasonCodes,matchedPolicies:[],action});
      emit(auditSink,createAuditEvent({type:AuditEventType.BLOCKED,action,decision:blocked,correlationId,errorCode:security.reasonCodes[0]}));
      return Object.freeze({executed:false,decision:blocked,result:null,correlationId});
    }
  }

  const decision=evaluateAction(action,policies);
  emit(auditSink,createAuditEvent({type:AuditEventType.DECISION,action,decision,correlationId}));
  let authorized=decision.decision===Decision.ALLOW;

  if(decision.decision===Decision.DENY){
    emit(auditSink,createAuditEvent({type:AuditEventType.BLOCKED,action,decision,correlationId}));
    return Object.freeze({executed:false,decision,result:null,correlationId});
  }

  if(decision.decision===Decision.REQUIRE_APPROVAL){
    if(approvalStore&&approvalRequestId){
      const consumed=approvalStore.consume(approvalRequestId,{actor,action,policyVersion});
      authorized=consumed.approved===true;
      if(!authorized){
        emit(auditSink,createAuditEvent({type:AuditEventType.BLOCKED,action,decision,correlationId,errorCode:consumed.reason??"APPROVAL_NOT_VALID"}));
        return Object.freeze({executed:false,decision,result:null,correlationId,approvalRequest:consumed.request});
      }
    } else authorized=approval===true;

    if(!authorized){
      emit(auditSink,createAuditEvent({type:AuditEventType.BLOCKED,action,decision,correlationId}));
      return Object.freeze({executed:false,decision,result:null,correlationId});
    }
  }

  try{
    const result=await adapter.execute(action);
    emit(auditSink,createAuditEvent({type:AuditEventType.EXECUTION,action,decision,result,correlationId}));
    return Object.freeze({executed:true,decision,result:result??null,correlationId});
  }catch(error){
    const wrapped=new NexusGatewayError("Execution adapter failed","ADAPTER_EXECUTION_FAILED",error);
    emit(auditSink,createAuditEvent({type:AuditEventType.ERROR,action,decision,errorCode:wrapped.code,correlationId}));
    throw wrapped;
  }
}
