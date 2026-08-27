// Spawns, updates, recycles, and scores pipe pairs using an ObjectPool.
import { ObjectPool } from '../core/ObjectPool.js';
import { PipePair } from '../entities/PipePair.js';

export class PipeSystem {
  constructor({ config, random, eventBus }) {
    this.config = config;
    this.random = random;
    this.eventBus = eventBus;
    this.active = [];
    this.spawnTimer = 0;
    this.pool = new ObjectPool({
      factory: () => new PipePair(),
      resetter: (p) => {
        p.active = false;
        p.scored = false;
      },
    });
  }

  reset() {
    for (const pipe of this.active) this.pool.release(pipe);
    this.active.length = 0;
    this.spawnTimer = this.config.spawnInterval;
  }

  // dt is one fixed step (seconds); speed is px/s. groundY bounds gap placement.
  update({ dt, speed, groundY, logicalWidth }) {
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawn({ logicalWidth, groundY });
      this.spawnTimer += this.config.spawnInterval;
    }

    const step = speed * dt;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const pipe = this.active[i];
      pipe.move(step);
      if (pipe.isOffscreen()) {
        this.release(pipe);
      }
    }
  }

  spawn({ logicalWidth, groundY }) {
    const pipe = this.pool.acquire();
    const gap = this.config.initialGap;
    const margin = 80;
    const minGapY = margin + gap / 2;
    const maxGapY = groundY - margin - gap / 2;
    const gapY = this.random.range(minGapY, Math.max(maxGapY, minGapY + 1));
    pipe.spawn({
      x: logicalWidth + pipe.width,
      gapY,
      gap,
      width: this.config.width,
    });
    this.active.push(pipe);
    this.eventBus?.emit('pipe:spawned', { x: pipe.x, gapY });
    return pipe;
  }

  release(pipe) {
    const idx = this.active.indexOf(pipe);
    if (idx >= 0) this.active.splice(idx, 1);
    this.pool.release(pipe);
  }

  getActive() {
    return this.active;
  }
}