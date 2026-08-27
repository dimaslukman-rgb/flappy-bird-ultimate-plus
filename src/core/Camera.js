// Viewport transform. Logical coords, screen conversion.
// ponytail: screen-shake removed per user request ("tampilan biasa aja").
// Add back a shake({duration,magnitude}) + update(dt) countdown + offset in apply()
// when a kick-on-impact effect is wanted again; gate behind reduced-motion then.
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update() {}

  apply(ctx) {
    ctx.translate(this.x, this.y);
  }

  restore(ctx) {
    // Callers use ctx.save()/restore() around apply.
  }

  screenToWorld(sx, sy) {
    return { x: sx - this.x, y: sy - this.y };
  }
}
