// Applies gravity + flap impulse to a Bird with fixed-step kinematics.
export class PhysicsSystem {
  constructor({ gravity, flapImpulse, maxFallSpeed, maxUpRotation, maxDownRotation }) {
    this.gravity = gravity;
    this.flapImpulse = flapImpulse;
    this.maxFallSpeed = maxFallSpeed;
    this.maxUpRotation = maxUpRotation;
    this.maxDownRotation = maxDownRotation;
  }

  reset() {
    // No internal mutable state beyond config; per-bird state lives on the entity.
  }

  update(bird, dt) {
    if (!bird.alive) return;
    bird.velocity += this.gravity * dt;
    if (bird.velocity > this.maxFallSpeed) bird.velocity = this.maxFallSpeed;
    bird.y += bird.velocity * dt;

    // Rotation follows velocity: up when rising, down when falling.
    if (bird.velocity < 0) {
      const t = Math.min(1, Math.abs(bird.velocity) / Math.abs(this.flapImpulse));
      bird.rotation = this.maxUpRotation * t;
    } else {
      const t = Math.min(1, bird.velocity / this.maxFallSpeed);
      bird.rotation = this.maxDownRotation * t;
    }
  }

  flap(bird) {
    bird.velocity = this.flapImpulse;
  }
}