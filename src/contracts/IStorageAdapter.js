// Storage adapter contract: read/write/remove/list over an async key-value store.
// Implementations: LocalStorageAdapter, MemoryStorageAdapter.
export const IStorageAdapterContract = Object.freeze({
  methods: ['read', 'write', 'remove', 'list'],
});