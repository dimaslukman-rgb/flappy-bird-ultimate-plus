// Circle-vs-rect collision for bird vs pipes and world bounds. Read-only: does not mutate.
export class CollisionSystem {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
    this.contacts = [];
    this.bounds = { groundY: Infinity, ceilingY: -Infinity };
  }

  circleVsRect(cx, cy, r, rx, ry, rw, rh) {
    const nearestX = cx < rx ? rx : cx > rx + rw ? rx + rw : cx;
    const nearestY = cy < ry ? ry : cy > ry + rh ? ry + rh : cy;
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= r * r;
  }

  // Returns a result object {hit, type, pipe?}. Bounds = ceiling + ground.
  testBirdVsWorld(bird, pipes, bounds) {
    this.bounds = bounds;
    const result = { hit: false, type: null };

    // Ceiling is non-lethal in Flappy: bird may rise above; only ground kills
    // by default. Ground collision is lethal.
    if (bird.y + bird.radius >= bounds.groundY) {
      result.hit = true;
      result.type = 'ground';
      return result;
    }

    for (const pipe of pipes) {
      if (!pipe.active) continue;
      const top = { x: pipe.x, y: 0, w: pipe.width, h: pipe.topHeight };
      const bottom = { x: pipe.x, y: pipe.bottomTop, w: pipe.width, h: bounds.groundY - pipe.bottomTop };
      if (
        this.circleVsRect(bird.x, bird.y, bird.radius, top.x, top.y, top.w, top.h) ||
        this.circleVsRect(bird.x, bird.y, bird.radius, bottom.x, bottom.y, bottom.w, bottom.h)
      ) {
        result.hit = true;
        result.type = 'pipe';
        result.pipe = pipe;
        return result;
      }
    }
    return result;
  }

  getContacts() {
    return this.contacts;
  }
}