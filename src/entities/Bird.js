// Bird entity: owns position/velocity/rotation, mutates only through PhysicsSystem.
export class Bird {
  constructor({ x, radius = 16 }) {
    this.x = x;
    this.y = 0;
    this.radius = radius;
    this.velocity = 0; // px/s
    this.rotation = 0; // radians
    this.alive = true;
  }

  reset({ startY }) {
    this.y = startY;
    this.velocity = 0;
    this.rotation = 0;
    this.alive = true;
  }
}