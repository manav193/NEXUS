# NEXUS Observability

Phase 3 adds a dependency-free audit/event foundation.

## Event model
Each event has a unique event id, ISO timestamp, correlation id, event type, action snapshot, decision snapshot, optional result/error code, and schema version.

Event types: DECISION, EXECUTION, BLOCKED, ERROR.

## Correlation
A gateway request accepts a caller-supplied correlation id or generates one. This lets future tooling reconstruct an agent session timeline.

## Replay
replayDecision() re-evaluates recorded DECISION events against a supplied policy set. It is deterministic decision replay, not re-execution of external side effects.

## Security boundary
The memory sink is a development adapter. It is not durable or tamper-proof. Secret/PII redaction, integrity chaining, retention, authenticated readers, and durable storage are later hardening work.
