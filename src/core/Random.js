// Seedable deterministic PRNG (mulberry32) for obstacle generation and replays.
export class Random {
  constructor(seed = 1) {
    this.seed = seed;
    this.state = seed >>> 0;
  }

  next() {
    // mulberry32: fast, good-enough distribution for gameplay.
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    // Inclusive integer in [min, max].
    return Math.floor(this.range(min, max + 1));
  }

  pick(array) {
    if (!array || array.length === 0) return undefined;
    return array[this.int(0, array.length - 1)];
  }

  snapshot() {
    return { seed: this.seed, state: this.state };
  }

  restore(snap) {
    this.seed = snap.seed;
    this.state = snap.state;
  }
}