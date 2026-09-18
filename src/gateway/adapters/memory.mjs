export function createMemoryAdapter() {
  const calls = [];

  return {
    calls,
    async execute(action) {
      calls.push(structuredClone(action));
      return {
        ok: true,
        adapter: "memory",
        operation: action.operation,
      };
    },
  };
}
