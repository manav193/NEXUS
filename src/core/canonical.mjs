/**
 * Canonical serialization for stable action identity.
 * Keys are sorted recursively so equivalent actions produce the same fingerprint.
 */
import { createHash } from "node:crypto";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function canonicalizeAction(action) {
  if (!action || typeof action !== "object") throw new TypeError("Action is required");
  return canonicalize(action);
}

export function fingerprintAction(action) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizeAction(action)))
    .digest("hex");
}
