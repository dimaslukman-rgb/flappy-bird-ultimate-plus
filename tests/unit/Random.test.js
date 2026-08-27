import { describe, it, expect } from 'vitest';
import { Random } from '../../src/core/Random.js';

describe('Random', () => {
  it('is deterministic for a given seed', () => {
    const a = new Random(42);
    const b = new Random(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it('different seeds diverge', () => {
    expect(new Random(1).next()).not.toBe(new Random(2).next());
  });

  it('range stays within bounds', () => {
    const r = new Random(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.range(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });

  it('int is inclusive', () => {
    const r = new Random(3);
    const seen = new Set();
    for (let i = 0; i < 100; i++) seen.add(r.int(0, 2));
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });
});