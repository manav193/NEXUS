import { executeThroughGateway } from "../gateway/gateway.mjs";

export function createNimoBridge({ gateway, adapter, policies = [], securityGuard = null, approvalStore = null, auditSink = null } = {}) {
  if (typeof gateway !== "function") throw new TypeError("gateway must be a function");
  if (!adapter) throw new TypeError("adapter is required");

  return Object.freeze({
    async dispatch(action, options = {}) {
      return gateway({
        action,
        policies,
        adapter,
        securityGuard,
        approvalStore,
        auditSink,
        ...options,
      });
    },
  });
}

export function createDefaultNimoBridge(options = {}) {
  return createNimoBridge({ gateway: executeThroughGateway, ...options });
}
