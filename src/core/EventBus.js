// Synchronous pub/sub with safe unsubscribe during emit.
// Listeners added during emit do not run in that emit; removals are skipped safely.
export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.emittingDepth = 0;
    this.pendingRemovals = [];
  }

  on(type, listener) {
    if (typeof listener !== 'function') throw new Error('EventBus.on: listener must be a function');
    let list = this.listeners.get(type);
    if (!list) {
      list = [];
      this.listeners.set(type, list);
    }
    list.push(listener);
    return () => this.off(type, listener);
  }

  once(type, listener) {
    const wrapped = (...args) => {
      this.off(type, wrapped);
      listener(...args);
    };
    return this.on(type, wrapped);
  }

  off(type, listener) {
    const list = this.listeners.get(type);
    if (!list) return;
    if (this.emittingDepth > 0) {
      // Defer removals so current emit iterates a stable snapshot.
      this.pendingRemovals.push([type, listener]);
      return;
    }
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) this.listeners.delete(type);
  }

  emit(type, payload = {}) {
    const list = this.listeners.get(type);
    if (!list || list.length === 0) return;
    this.emittingDepth++;
    try {
      // Snapshot so mid-emit adds do not run.
      for (const listener of [...list]) {
        if (this.pendingRemovals.some(([t, l]) => t === type && l === listener)) continue;
        try {
          listener(payload);
        } catch (err) {
          // Report but do not stop remaining listeners unless critical.
          console.error(`[EventBus] listener for "${type}" threw`, err);
        }
      }
    } finally {
      this.emittingDepth--;
      if (this.emittingDepth === 0 && this.pendingRemovals.length > 0) {
        const removals = this.pendingRemovals;
        this.pendingRemovals = [];
        for (const [t, l] of removals) this.off(t, l);
      }
    }
  }

  clear() {
    this.listeners.clear();
    this.pendingRemovals = [];
  }
}