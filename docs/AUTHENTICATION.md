# NEXUS Authentication

NEXUS now defines a shared-account authentication contract for the ecosystem.

## Shared account model

A user creates one NEXUS account with a unique username and password. An application such as ToolVerse, Prompt-Aii, NIMO-WEB, or AutoLab should authenticate through NEXUS instead of maintaining an unrelated local password database.

The application receives a NEXUS identity/session result and uses that identity ID when accessing user-owned resources.

## Password security

NEXUS does not store plaintext passwords. The reference implementation derives password material with Node.js scrypt and a per-credential salt. Production deployments should use a managed identity service or a hardened authentication service, with secure password policies, rate limiting, MFA/passkeys, recovery controls, breach monitoring, and secret management.

The memory auth store is for tests/development only. It is not production account storage.

## Cross-application flow

1. User registers with NEXUS.
2. NEXUS creates a stable identity.
3. ToolVerse authenticates the user against NEXUS.
4. NEXUS returns a short-lived session/authorization result.
5. Prompt-Aii, NIMO-WEB, AutoLab, and other applications accept the NEXUS identity through their integration contract.
6. User-owned data is accessed through NEXUS authorization, not by sharing database credentials between applications.

## Important boundary

Applications should never receive or store the user's NEXUS password. They should receive a short-lived, scoped authorization/session artifact instead.

For production, use an established authentication protocol such as OAuth 2.0 / OpenID Connect rather than inventing a custom cross-site password exchange protocol.
