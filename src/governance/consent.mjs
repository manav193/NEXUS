import { randomUUID } from "node:crypto";

export const ConsentStatus = Object.freeze({ GRANTED:"GRANTED", REVOKED:"REVOKED", EXPIRED:"EXPIRED" });

export function createConsent({ id = randomUUID(), identityId, purpose, resourceType = null, status = ConsentStatus.GRANTED, grantedAt = new Date().toISOString(), expiresAt = null } = {}) {
  if (!identityId || !purpose) throw new TypeError("Consent identityId and purpose are required");
  if (!Object.values(ConsentStatus).includes(status)) throw new TypeError("Invalid consent status");
  return Object.freeze({ id, identityId:String(identityId), purpose:String(purpose), resourceType:resourceType == null ? null : String(resourceType), status, grantedAt, expiresAt });
}

export function isConsentActive(consent, { now = Date.now() } = {}) {
  if (!consent || consent.status !== ConsentStatus.GRANTED) return false;
  return !consent.expiresAt || new Date(consent.expiresAt).getTime() > now;
}

export function hasConsent(consents, { identityId, purpose, resourceType = null, now = Date.now() } = {}) {
  return consents.some((c) =>
    c.identityId === String(identityId) &&
    c.purpose === String(purpose) &&
    (c.resourceType == null || c.resourceType === String(resourceType)) &&
    isConsentActive(c, { now }),
  );
}
