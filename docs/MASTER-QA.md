# NEXUS Master QA — Phase 12

## Scope

Phase 12 audits the complete reference implementation layer-by-layer and adds cross-layer regression coverage.

## QA matrix

| Layer | Checks |
|---|---|
| Core contracts | action validation, risk classification, policy precedence, fail-closed malformed policies |
| Canonical identity | deterministic recursive canonicalization and SHA-256 fingerprints |
| Gateway | adapter boundary, deny enforcement, approval enforcement, controlled adapter errors |
| Security | capability allowlist, kill switch, injection/secret signals, redaction |
| Approval | expiry, one-time consumption, action fingerprint binding, policy-version binding |
| Observability | structured events, correlation IDs, replay semantics |
| Identity | active/suspended/revoked lifecycle |
| Data governance | ownership, classification, restricted/delete/export controls |
| Consent | purpose/resource scope and revocation/expiry |
| Authentication | password derivation, duplicate usernames, lock/revoke states |
| Sessions | short-lived tokens, hashed storage, revocation, identity lookup |
| Risk engine | signal collection, deduplication, deterministic score, escalation |
| NIMO | transport boundary and security non-bypass |
| CI | Node 20/22/24 test matrix |

## Security invariants

1. No DENY path may invoke an adapter.
2. Security DENY cannot be overridden by approval or policy.
3. Approval must match both the action fingerprint and policy version.
4. Expired/revoked sessions must not be treated as active.
5. Cross-owner resource access is denied by default.
6. Restricted/delete/export operations require explicit authorization.
7. Raw passwords and bearer session tokens must not be persisted by memory stores.
8. AI-generated actions remain untrusted until they pass the NEXUS control boundary.
9. Risk signals are evidence, not proof that an actor is fraudulent.
10. External adapters must remain dependency-injected and cannot bypass gateway controls.

## Findings and remediation

The Phase 12 audit found one stale integration path: src/integration/nimo.mjs and its old createDefaultNimoBridge test contract conflicted with the current src/integrations/nimo.mjs API. The stale implementation was removed and the integration regression test was rewritten against the current gateway + adapter boundary.

## Runtime status

Source-level QA and GitHub-side verification were performed. The assistant environment cannot directly execute the repository's Node.js process, so runtime test results must come from GitHub Actions CI. No runtime pass is claimed without a CI result.

## Production gaps

The reference implementation still needs durable storage, real OIDC/OAuth2 identity infrastructure, rate limiting, MFA/passkeys, durable audit storage, atomic approval consumption, structured parameter schemas, real threat-intelligence adapters, and independent security testing before production security claims are made.
