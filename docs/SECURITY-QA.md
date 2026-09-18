# NEXUS QA — Phase 5

Security regression coverage:
- capability allowlist blocks unknown tools
- operation allowlist blocks unauthorized operations
- kill switch creates immediate DENY
- prompt-injection heuristic produces DENY
- secret detection produces DENY
- secret redaction removes sensitive values
- deterministic action fingerprint
- gateway security DENY happens before policy evaluation and adapter execution

Runtime note: source and test files are verified on GitHub. This integration cannot execute the local Node test runner, so CI/local execution remains the runtime verification step.
