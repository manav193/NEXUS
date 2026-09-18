import { randomUUID } from "node:crypto";

export const DataClass = Object.freeze({
  PUBLIC: "PUBLIC",
  INTERNAL: "INTERNAL",
  PERSONAL: "PERSONAL",
  SENSITIVE: "SENSITIVE",
  RESTRICTED: "RESTRICTED",
});

export const ResourceOperation = Object.freeze({
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  EXPORT: "export",
});

export function createResource({ id = randomUUID(), ownerId, type, dataClass = DataClass.PERSONAL, storageKey, metadata = {} } = {}) {
  if (!ownerId || typeof ownerId !== "string") throw new TypeError("Resource.ownerId is required");
  if (!type || typeof type !== "string") throw new TypeError("Resource.type is required");
  if (!storageKey || typeof storageKey !== "string") throw new TypeError("Resource.storageKey is required");
  if (!Object.values(DataClass).includes(dataClass)) throw new TypeError("Invalid data classification");
  return Object.freeze({
    id: String(id), ownerId: String(ownerId), type: String(type), dataClass,
    storageKey: String(storageKey), metadata: Object.freeze({ ...metadata }),
  });
}

export function canAccessResource({ identity, resource, operation, policy = {} } = {}) {
  if (!identity || identity.status !== "ACTIVE") return Object.freeze({ allowed:false, reason:"IDENTITY_NOT_ACTIVE" });
  if (!resource) return Object.freeze({ allowed:false, reason:"RESOURCE_NOT_FOUND" });
  if (!Object.values(ResourceOperation).includes(operation)) return Object.freeze({ allowed:false, reason:"INVALID_OPERATION" });

  const isOwner = identity.id === resource.ownerId;
  if (!isOwner && policy.allowNonOwner !== true) {
    return Object.freeze({ allowed:false, reason:"RESOURCE_OWNERSHIP_REQUIRED" });
  }
  if (resource.dataClass === DataClass.RESTRICTED && policy.allowRestricted !== true) {
    return Object.freeze({ allowed:false, reason:"RESTRICTED_RESOURCE" });
  }
  if (operation === ResourceOperation.DELETE && policy.allowDelete !== true) {
    return Object.freeze({ allowed:false, reason:"DELETE_NOT_ALLOWED" });
  }
  if (operation === ResourceOperation.EXPORT && policy.allowExport !== true) {
    return Object.freeze({ allowed:false, reason:"EXPORT_NOT_ALLOWED" });
  }
  return Object.freeze({ allowed:true, reason:"AUTHORIZED" });
}
