// Viewport transform + shake. Logical coords, screen conversion.
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.shakeTime = 0;
    this.shakeDuration = 0;
    this.shakeMagnitude = 0;
  }

  update(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) {
        this.shakeTime = 0;
        this.shakeMagnitude = 0;
      }
    }
  }

  shake({ duration = 0.15, magnitude = 6 } = {}) {
    this.shakeTime = duration;
    this.shakeDuration = duration;
    this.shakeMagnitude = magnitude;
  }

  // Returns a deterministic-ish offset based on elapsed (caller supplies noise).
  getShakeOffset() {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    const t = this.shakeTime / Math.max(this.shakeDuration, 0.001);
    const mag = this.shakeMagnitude * t;
    return {
      x: (Math.random() - 0.5) * 2 * mag,
      y: (Math.random() - 0.5) * 2 * mag,
    };
  }

  apply(ctx) {
    const { x, y } = this.getShakeOffset();
    ctx.translate(this.x + x, this.y + y);
  }

  restore(ctx) {
    // Callers use ctx.save()/restore() around apply.
  }

  screenToWorld(sx, sy) {
    return { x: sx - this.x, y: sy - this.y };
  }
}