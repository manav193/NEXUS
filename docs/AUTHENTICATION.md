# NEXUS Authentication

NEXUS defines a shared-account authentication contract for the ecosystem.

## Phase 10 — Account & Session Lifecycle

The reference layer now includes account status transitions and an opaque bearer-session store.

- Accounts can be **ACTIVE**, **LOCKED**, or **REVOKED**.
- Locked/revoked accounts cannot authenticate.
- Sessions are short-lived and carry a high-entropy bearer token.
- The raw bearer token is returned only at session creation; the memory session store retains only its SHA-256 hash.
- Sessions can be revoked and enumerated by identity.
- Session activity checks include expiry, revocation, and an identity-active signal.

## Shared account model

A user creates one NEXUS account with a unique username and password. ToolVerse, Prompt-Aii, NIMO-WEB, AutoLab, and other applications should authenticate through NEXUS rather than maintaining unrelated password databases.

The application receives a NEXUS identity plus a short-lived session/authorization artifact and uses the identity ID when accessing user-owned resources.

## Password security

NEXUS does not store plaintext passwords. The reference implementation derives password material with Node.js scrypt and a per-credential salt. Production deployments should use a managed identity service or hardened authentication service with rate limiting, MFA/passkeys, recovery controls, breach monitoring, secure cookies/token handling, and secret management.

The memory auth/session stores are for tests/development only. They are not production account/session storage.

## Cross-application flow

1. User registers with NEXUS.
2. NEXUS creates a stable identity.
3. The application authenticates the user against NEXUS.
4. NEXUS creates a short-lived session.
5. The application uses the session to establish its own scoped authorization context.
6. User-owned data is accessed through NEXUS authorization, not by sharing database credentials between applications.
7. Logout/revocation invalidates the session without changing the underlying account identity.

## Production protocol boundary

For internet-facing production, use an established **OAuth 2.0 / OpenID Connect** provider instead of a custom cross-site password exchange. Prefer authorization-code + PKCE for public clients. Use secure, HttpOnly, SameSite cookies where appropriate, rotate/revoke refresh credentials, protect against CSRF, rate-limit authentication endpoints, and never place passwords, refresh tokens, or bearer credentials in URLs or logs.

NEXUS remains the policy/control boundary; the production identity provider can be an external hardened service or a dedicated identity subsystem behind this contract.
