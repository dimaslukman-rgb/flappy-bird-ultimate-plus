// Recursively freeze a value so resolved config and save snapshots are immutable.
export function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  // Ignore objects whose prototype indicates host objects (Map, Set, etc.).
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) {
    deepFreeze(value[key]);
  }
  return value;
}