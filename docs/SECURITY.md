# NEXUS Agent Security — Phase 5

Phase 5 adds a pre-execution security guard.

Controls:
- Tool and operation capability allowlists.
- Immediate deny-all kill switch.
- Prompt-injection heuristic detection.
- Secret/token/private-key detection.
- Secret redaction.
- Deterministic SHA-256 action fingerprints.

A security DENY must not be overridden by policy approval. Pattern detection is heuristic; production hardening still needs structured validation, sandboxing, secret managers, authenticated identities, rate limits, and independent security testing.
