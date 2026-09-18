# NEXUS

> A policy-driven control plane for AI agents: inspect, verify, gate, audit, and replay tool actions before they affect the outside world.

## Vision

NEXUS is an independent safety and observability layer for autonomous AI agents. It sits between an agent and external tools such as GitHub, MCP servers, APIs, filesystems, and device bridges.

NEXUS does not replace an AI model. It governs what the model is allowed to do.

## Design goals

- **Policy first:** actions are evaluated against explicit policies before execution.
- **Deny by default for dangerous operations:** destructive or sensitive actions require an explicit rule and/or approval.
- **Explainable decisions:** every decision includes a machine-readable reason and matched policy.
- **Auditable:** decisions and execution metadata are represented as structured events.
- **Provider agnostic:** NEXUS must work with multiple model/agent runtimes.
- **Minimal trust surface:** the control plane should not need model-internal reasoning or private credentials.
- **Composable:** adapters for GitHub, MCP, HTTP APIs, desktop agents, and future integrations live outside the core policy engine.

## Initial architecture

```
Agent / NIMO
     |
     v
+----------------------+
|       NEXUS           |
|-----------------------|
| Action Normalizer     |
| Policy Engine         |
| Risk Classifier       |
| Approval Gate         |
| Secret Boundary       |
| Audit/Event Recorder  |
+-----------+----------+
            |
            v
     Tool / API Gateway
            |
       External World
```

## Repository roadmap

### Phase 1 — Foundation
- Define canonical action/event contracts.
- Implement deterministic policy evaluation.
- Implement risk classification.
- Establish deny/allow/approval decision semantics.
- Add unit tests and security-oriented invariants.
- Add architecture and threat-model documentation.

### Phase 2 — Tool Gateway
- GitHub adapter.
- HTTP/API adapter.
- MCP-compatible adapter boundary.
- Safe parameter validation.
- Execution timeout and cancellation.

### Phase 3 — Observability
- Structured audit events.
- Session timelines.
- Correlation IDs.
- Replayable decision history.
- OpenTelemetry integration.

### Phase 4 — Human-in-the-loop
- Approval requests.
- Approval expiry.
- Policy escalation.
- Emergency kill switch.

### Phase 5 — Agent Security
- Prompt-injection signals.
- Secret/credential boundary.
- Tool abuse detection.
- Policy conflict detection.
- Security regression corpus.

### Phase 6 — NIMO integration
- NIMO-CORE adapter.
- NIMO-KNOWLEDGE evaluation/knowledge bridge.
- NIMO-AUTOLAB execution adapter.

## Non-goals

NEXUS is not:
- an LLM provider,
- a replacement for application authorization,
- a guarantee that every malicious instruction can be detected,
- a system that executes destructive actions without explicit policy.

## License

MIT
