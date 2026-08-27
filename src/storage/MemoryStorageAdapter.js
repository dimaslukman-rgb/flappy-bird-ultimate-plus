// In-memory adapter for tests and environments without localStorage.
export class MemoryStorageAdapter {
  constructor() {
    this.store = new Map();
  }

  async read(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async write(key, value) {
    this.store.set(key, value);
  }

  async remove(key) {
    this.store.delete(key);
  }

  async list(prefix) {
    return [...this.store.keys()].filter((k) => k.startsWith(prefix));
  }
}