# NEXUS Architecture

## Control-plane model

NEXUS separates **decision** from **execution**.

```
ActionRequest
    |
    v
Normalize
    |
    v
Policy evaluation
    |
    +----> DENY
    |
    +----> REQUIRE_APPROVAL
    |
    +----> ALLOW
              |
              v
          Execution adapter
              |
              v
          ActionResult
```

The core must remain deterministic for identical input, policy set, and policy context.

## Core modules

### 1. Action contract

Canonical representation of an intended tool action:

- actor
- tool
- operation
- resource
- parameters
- requested capabilities
- correlation/session identifiers
- timestamp metadata

### 2. Policy engine

Policies are evaluated in a deterministic order.

The initial implementation supports:
- explicit allow
- explicit deny
- approval requirement
- default decision

A policy should match on observable action properties only.

### 3. Risk classifier

Risk is a separate concept from the final decision.

Initial levels:

`LOW | MEDIUM | HIGH | CRITICAL`

Risk explains why an action deserves scrutiny; policy determines what happens.

### 4. Decision object

Every evaluated action produces:

- decision
- risk
- reason codes
- matched policy IDs
- normalized action
- evaluation timestamp
- engine version

### 5. Execution boundary

The core evaluator never directly performs an external side effect.

Adapters consume an approved decision and perform the actual operation.

## Invariants

1. Evaluation never executes a tool.
2. Unknown operations are not implicitly considered safe.
3. Missing policy context cannot silently upgrade a denied action to allowed.
4. Every decision is serializable.
5. Secret values must never be included in decision reasons or audit metadata.
