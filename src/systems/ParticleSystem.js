// Pooled additive particles; renders via draw commands. Fail-safe if empty.
import { ObjectPool } from '../core/ObjectPool.js';

function makeParticle() {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    size: 0,
    color: '#ffffff',
    active: false,
  };
}

export class ParticleSystem {
  constructor({ quality = 'medium', budget = { low: 40, medium: 100, high: 220 } }) {
    this.budget = budget;
    this.quality = quality;
    this.limit = budget[quality] ?? budget.medium;
    this.pool = new ObjectPool({ factory: makeParticle, resetter: (p) => (p.active = false) });
    this.active = [];
    this.colorOptions = ['#00e5ff', '#ff2ea6', '#7c4dff', '#39ff88'];
  }

  emit({ x, y, vx = 0, vy = -40, life = 0.5, size = 3, color }) {
    if (this.active.length >= this.limit) return;
    const p = this.pool.acquire();
    p.x = x;
    p.y = y;
    p.vx = vx + (Math.random() - 0.5) * 40;
    p.vy = vy + (Math.random() - 0.5) * 40;
    p.life = life;
    p.maxLife = life;
    p.size = size;
    p.color = color ?? this.colorOptions[(Math.random() * this.colorOptions.length) | 0];
    p.active = true;
    this.active.push(p);
  }

  burst({ x, y, count = 8, life = 0.5, size = 3 }) {
    for (let i = 0; i < count; i++) this.emit({ x, y, life, size });
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt; // subtle gravity
      if (p.life <= 0) {
        this.pool.release(p);
        this.active.splice(i, 1);
      }
    }
  }

  render(ctx, alpha) {
    for (const p of this.active) {
      const t = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, t);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear() {
    for (const p of this.active) this.pool.release(p);
    this.active.length = 0;
  }
}