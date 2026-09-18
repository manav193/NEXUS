# NEXUS QA — Phase 4

## Scope
Human approval lifecycle, one-time approval consumption, expiry, action binding, and gateway enforcement.

## Test matrix
- PENDING -> APPROVED -> CONSUMED
- APPROVED -> second consumption blocked
- expired approval -> EXPIRED and blocked
- approval bound to exact action
- DENIED approval blocked
- gateway adapter is never called when approval is invalid

## Verification
The Phase 4 test suite is implemented with Node's built-in test runner. GitHub integration here can write and inspect source files, but does not execute a local Node runtime, so runtime test execution must be performed in CI/local environment.

## Security notes
The current approval store is in-memory and not durable. Production deployment still needs authenticated approver identity, durable storage, cryptographic approval tokens, policy-version binding, concurrency/atomic consume, and tamper-evident audit storage.
