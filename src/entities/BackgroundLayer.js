// Parallax background layer. Renders as (sparse) distant animation.
export class BackgroundLayer {
  constructor({ name = 'far', parallax = 0.2, color = '#1a1a3a', height = 600 } = {}) {
    this.name = name;
    this.parallax = parallax;
    this.color = color;
    this.height = height;
    this.offset = 0;
  }

  scroll(speed) {
    this.offset = (this.offset + speed * this.parallax) % 100000;
  }

  reset() {
    this.offset = 0;
  }
}