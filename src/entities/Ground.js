// Scrolling ground strip; loops its texture offset. Collision handled by CollisionSystem.
export class Ground {
  constructor({ height = 72, width = 390 }) {
    this.height = height;
    this.width = width;
    this.offset = 0; // px scroll accumulator for rendering loop
  }

  // Advance ground scroll; tiles width so offset wraps.
  scroll(speed) {
    this.offset = (this.offset + speed) % this.width;
  }

  // y coordinate of the ground surface (bottom of playable space).
  surfaceY(logicalHeight) {
    return logicalHeight - this.height;
  }

  reset() {
    this.offset = 0;
  }
}