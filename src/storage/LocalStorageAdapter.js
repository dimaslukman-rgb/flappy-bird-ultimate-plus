// Browser localStorage adapter implementing IStorageAdapter.
export class LocalStorageAdapter {
  async read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota/private-mode failures are non-fatal; caller falls back to memory.
      throw new Error(`LocalStorageAdapter: write failed for ${key}`);
    }
  }

  async remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  async list(prefix) {
    const keys = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
    } catch {
      // ignore
    }
    return keys;
  }
}