// A pair of pipes (top + bottom) with a gap, spawning from the right edge.
export class PipePair {
  constructor() {
    this.x = 0; // leading edge x
    this.width = 76;
    this.gapY = 0; // vertical center of the gap
    this.gap = 210;
    this.scored = false;
    this.active = false;
  }

  spawn({ x, gapY, gap, width }) {
    this.x = x;
    this.gapY = gapY;
    this.gap = gap;
    this.width = width;
    this.scored = false;
    this.active = true;
  }

  // Advance the pipe left by scroll speed (px).
  move(speed) {
    this.x -= speed;
  }

  get topHeight() {
    return this.gapY - this.gap / 2;
  }

  get bottomTop() {
    return this.gapY + this.gap / 2;
  }

  // Whether the pipe has fully exited the left side.
  isOffscreen() {
    return this.x + this.width < 0;
  }
}