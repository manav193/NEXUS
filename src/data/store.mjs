import { createResource } from "./resource.mjs";

export function createMemoryDataStore() {
  const resources = new Map();
  return Object.freeze({
    create(resource) {
      const value = createResource(resource);
      if (resources.has(value.id)) throw new Error("Resource already exists");
      resources.set(value.id, value);
      return value;
    },
    get(id) { return resources.get(id) ?? null; },
    listByOwner(ownerId) { return [...resources.values()].filter((r) => r.ownerId === String(ownerId)); },
    delete(id) { return resources.delete(id); },
  });
}
