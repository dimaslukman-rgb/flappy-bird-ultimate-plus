// Normalizes raw browser timestamps into clamped simulation time.
// Owns accumulator + simulation time; engine drives tick.
export class GameClock {
  constructor({ maxFrameDelta = 0.25 } = {}) {
    this.maxFrameDelta = maxFrameDelta;
    this.lastTimestamp = null;
    this.accumulator = 0;
    this.simulationTime = 0;
    this.timeScale = 1;
  }

  reset() {
    this.lastTimestamp = null;
    this.accumulator = 0;
    this.simulationTime = 0;
  }

  // timestamp is monotonic milliseconds.
  // Returns raw delta in seconds (already clamped), or 0 on first tick.
  tick(timestamp) {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
      return 0;
    }
    const rawMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    const rawSeconds = rawMs / 1000;
    return rawSeconds < 0 ? 0 : rawSeconds > this.maxFrameDelta ? this.maxFrameDelta : rawSeconds;
  }

  advance(fixedStep) {
    this.simulationTime += fixedStep;
  }

  accumulate(deltaSeconds) {
    this.accumulator += deltaSeconds * this.timeScale;
  }

  consume(fixedStep) {
    this.accumulator -= fixedStep;
  }

  getInterpolationAlpha(fixedStep) {
    const denom = fixedStep || 1 / 60;
    const alpha = this.accumulator / denom;
    return alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
  }
}