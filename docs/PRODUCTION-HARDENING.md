# Production Hardening

## Objective

Phase 7 makes approval and action identity safer without coupling NEXUS to any unfinished external repository.

## Action identity

NEXUS canonicalizes action objects recursively with sorted object keys and computes a SHA-256 fingerprint. Two structurally equivalent actions therefore receive the same identity even when their input object key order differs.

## Approval binding

An approval request stores:
- action fingerprint,
- policy version,
- requester,
- approver,
- correlation ID,
- expiry,
- one-time consumption state.

The gateway passes the current action and policy version into the approval store. A mismatch blocks execution before the adapter is called.

## Policy versioning

Integrations should supply an immutable policy version, commit SHA, configuration digest, or equivalent deployment identifier. Approvals must not silently carry across policy changes.

`unversioned` exists only as a compatibility default for development and tests. Production integrations should provide an explicit version.

## CI

GitHub Actions executes `npm test` against Node 20, 22, and 24 for pushes and pull requests targeting `main`.

## External repository independence

NEXUS depends on integration contracts rather than the internals of NIMO-CORE, NIMO-KNOWLEDGE, NIMO-AUTOLAB, NIMO-WEB, or other projects. This keeps those repositories free to evolve while preserving the NEXUS boundary.

## Remaining production work

The next hardening layer should replace in-memory infrastructure with:
1. durable audit storage,
2. durable approval storage with atomic consume,
3. authenticated requester/approver identities,
4. signed or cryptographically protected approval tokens,
5. adapter-level timeout/cancellation,
6. structured parameter schemas,
7. rate limits and replay-resistant request IDs,
8. real GitHub/MCP/HTTP adapters,
9. independent security testing and fuzzing.