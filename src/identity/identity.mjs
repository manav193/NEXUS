import { randomUUID } from "node:crypto";

export const IdentityStatus = Object.freeze({ ACTIVE:"ACTIVE", SUSPENDED:"SUSPENDED", REVOKED:"REVOKED" });

export function createIdentity({ id = randomUUID(), provider = "local", subject, displayName = null, status = IdentityStatus.ACTIVE, metadata = {} } = {}) {
  if (!subject || typeof subject !== "string") throw new TypeError("Identity.subject is required");
  if (!Object.values(IdentityStatus).includes(status)) throw new TypeError("Invalid identity status");
  return Object.freeze({
    id: String(id), provider: String(provider), subject: String(subject),
    displayName: displayName == null ? null : String(displayName),
    status, metadata: Object.freeze({ ...metadata }),
  });
}

export function isIdentityActive(identity) {
  return identity?.status === IdentityStatus.ACTIVE;
}
