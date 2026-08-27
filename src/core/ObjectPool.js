// Reuse short-lived objects; reports utilization without exposing internals.
export class ObjectPool {
  constructor({ factory, resetter, initialSize = 0 } = {}) {
    if (typeof factory !== 'function') throw new Error('ObjectPool: factory is required');
    this.factory = factory;
    this.resetter = resetter || (() => {});
    this.free = [];
    this.active = new Set();
    this.misses = 0;
    if (initialSize > 0) this.prewarm(initialSize);
  }

  acquire() {
    let obj;
    if (this.free.length > 0) {
      obj = this.free.pop();
    } else {
      obj = this.factory();
      this.misses++;
    }
    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (!this.active.delete(obj)) return;
    this.resetter(obj);
    this.free.push(obj);
  }

  prewarm(count) {
    for (let i = 0; i < count; i++) {
      this.free.push(this.factory());
    }
  }

  clear() {
    this.free.length = 0;
    this.active.clear();
    this.misses = 0;
  }

  stats() {
    return {
      free: this.free.length,
      active: this.active.size,
      misses: this.misses,
    };
  }
}