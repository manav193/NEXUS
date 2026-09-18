# NEXUS Threat Model

## Assets

- API credentials and access tokens
- User data
- Repository contents
- Files and device control
- Agent permissions
- Audit integrity

## Threats

### T1 — Destructive tool misuse
An agent attempts a delete, revoke, reset, or irreversible operation.

Mitigation:
- explicit operation classification
- high/critical risk
- deny or approval policy

### T2 — Prompt injection
Untrusted content attempts to override the agent's intended instructions.

Mitigation:
- treat external content as untrusted input
- never derive authorization from content alone
- keep policy evaluation outside the model

### T3 — Credential exfiltration
An agent tries to read or transmit secrets.

Mitigation:
- secret boundary
- deny rules for known secret resources
- redaction in events and errors

### T4 — Policy bypass
An adapter executes an action that bypasses the NEXUS decision.

Mitigation:
- execution adapters require an approved decision token/context
- integration tests verify the gateway boundary

### T5 — Audit tampering
An actor attempts to alter the decision history.

Mitigation:
- append-oriented events
- correlation IDs
- external durable storage in later phases

### T6 — Fail-open behavior
A policy/evaluation error causes an unsafe action to be allowed.

Mitigation:
- evaluation errors fail closed
- explicit tests for malformed policies and unknown operations

## Trust boundaries

```
Untrusted agent/model output
          |
          | trust boundary
          v
      NEXUS core
          |
          | authorization boundary
          v
     Tool adapter
          |
          v
   External resources
```
