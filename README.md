# NEXUS

> A policy-driven control plane for AI agents: inspect, verify, gate, audit, and replay tool actions before they affect the outside world.

## Vision

NEXUS is an independent safety and observability layer for autonomous AI agents. It sits between an agent and external tools such as GitHub, MCP servers, APIs, filesystems, and device bridges.

NEXUS does not replace an AI model. It governs what the model is allowed to do.

## Design goals

- **Policy first:** actions are evaluated against explicit policies before execution.
- **Deny by default for dangerous operations:** destructive or sensitive actions require explicit authorization and/or approval.
- **Explainable decisions:** every decision includes machine-readable reason codes and matched policies.
- **Auditable:** decisions and execution metadata are represented as structured events.
- **Provider agnostic:** NEXUS works with multiple model/agent runtimes.
- **Minimal trust surface:** the control plane does not need model-internal reasoning or private credentials.
- **Composable:** external integrations live behind adapters and do not redefine the core security boundary.

## Architecture

```
Agent / NIMO
     |
     v
+---------------------------+
|          NEXUS            |
|---------------------------|
| Canonical Action Identity |
| Security Guard             |
| Policy Engine              |
| Risk Classifier            |
| Approval Gate              |
| Audit / Replay             |
+-------------+-------------+
              |
              v
        Adapter Boundary
     /       |       |      \
  GitHub    MCP     HTTP   AutoLab
              |
              v
       External Systems
```

## Current implementation

### Phase 1 — Foundation ✅
- Canonical action and decision contracts.
- Deterministic risk classification.
- Deterministic policy evaluation.
- Fail-closed malformed-policy handling.
- Architecture and threat-model documentation.

### Phase 2 — Tool Gateway ✅
- Adapter boundary with no external I/O in core.
- Gateway decision enforcement.
- Adapter error isolation.
- Memory adapter for deterministic tests.
- External GitHub/HTTP/MCP adapters remain integration work, not core dependencies.

### Phase 3 — Observability + Replay Foundation ✅
- Structured audit events.
- Correlation IDs.
- Decision/execution/blocked/error event types.
- Decision replay against current policies.
- Memory audit sink for tests.

### Phase 4 — Human Approval + QA ✅
- Approval lifecycle and TTL.
- One-time consumption.
- Exact action identity binding.
- Policy-version binding.
- Gateway enforcement.
- Approval-focused QA tests.

### Phase 5 — Agent Security + QA ✅
- Tool and operation capability allowlists.
- Kill switch.
- Prompt-injection signals.
- Secret detection and redaction helpers.
- Canonical SHA-256 action fingerprints.
- Security regression tests.
- Security denial is evaluated before policy approval.

### Phase 6 — NIMO Integration + T&C ✅
- NIMO execution adapter boundary.
- NIMO-KNOWLEDGE evaluator boundary.
- NIMO-AUTOLAB integration contract.
- Terms & Conditions and operator responsibility.

### Phase 7 — Production Hardening ✅
- Stable canonical action fingerprints independent of object key order.
- Approval requests bind to action fingerprint and policy version.
- Gateway verifies approval bindings before adapter execution.
- CI runs the test suite on Node 20, 22, and 24.
- Broken legacy export removed from the public entrypoint.
- Version bumped to 0.2.0.

## Integration stability

NEXUS is intentionally **contract-first**. NIMO-CORE, NIMO-KNOWLEDGE, NIMO-AUTOLAB, NIMO-WEB, ToolVerse, and other projects can evolve independently.

Only the adapter contract should need to change when an external project changes its internal implementation. Do not import another project's internal modules into NEXUS core.

## Security limitations

NEXUS is a control layer, not a proof of safety. Prompt-injection and secret detection are heuristic signals. Production deployments should additionally use authenticated identities, durable approval storage, atomic one-time consumption, structured parameter validation, sandboxing, rate limits, secret managers, and independent security testing.

## Non-goals

NEXUS is not:
- an LLM provider,
- a replacement for application authorization,
- a guarantee that malicious instructions can always be detected,
- a system that executes destructive actions without explicit authorization.

## License

MIT\n### Phase 8 — Identity & Data Governance ✅\n- Provider-agnostic user identity model.\n- Per-resource ownership and tenant-style isolation boundary.\n- Data classification and purpose-scoped consent.\n- Explicit read/write/delete/export access operations.\n- Memory storage abstraction for deterministic tests.\n
### Phase 9 — Shared Authentication Foundation ✅
- One NEXUS identity can be used across ecosystem applications.
- Username normalization and password-derived credential storage.
- No plaintext password storage in the reference implementation.
- Short-lived session contract.
- Shared authentication tests and production protocol guidance.

### Phase 10 — Account & Session Lifecycle Hardening ✅
- ACTIVE / LOCKED / REVOKED account states.
- Locked/revoked accounts cannot authenticate.
- High-entropy short-lived bearer sessions.
- Memory session store retains only token hashes, never raw bearer tokens.
- Session revocation and identity-scoped session listing.
- Authentication documentation updated with production OIDC/OAuth2 + PKCE guidance.

### Phase 11 — Risk & Abuse Intelligence ✅
- Explainable suspicious-activity signals.
- Deterministic 0–100 risk scoring.
- LOW / MEDIUM / HIGH / CRITICAL risk levels.
- High-risk approval and critical-risk denial mapping.
- Risk-engine regression tests and production roadmap.

### Phase 12 — Master QA & Regression Gate 🔍
- Full layer-by-layer QA matrix added.
- Cross-layer security invariant tests added.
- Stale NIMO integration path removed.
- Current NIMO adapter/gateway contract verified.
- Runtime results intentionally delegated to GitHub Actions CI; no unverified pass claim.
