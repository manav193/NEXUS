# NIMO ↔ NEXUS Integration

NEXUS is the control plane; NIMO remains the intelligence layer.

## Contract

NIMO submits a canonical action:
`{ actor, tool, operation, resource, parameters }`

NEXUS evaluates security, policy, risk, and approval before an adapter executes anything.

NEXUS never needs model-internal reasoning or model credentials to make a decision.

## Flow

```
NIMO-CORE
   ↓ action
NEXUS SECURITY
   ↓
NEXUS POLICY/RISK
   ↓
HUMAN APPROVAL (when required)
   ↓
ADAPTER
   ↓
AUDIT
```

## Design rule

The NIMO integration uses the NEXUS gateway directly. The adapter is transport-only and must not become a second policy engine or silently execute actions.

## Example

```js
const bridge = createDefaultNimoBridge({
  adapter,
  policies,
  securityGuard,
  approvalStore,
  auditSink,
});

const result = await bridge.dispatch(action);
```
