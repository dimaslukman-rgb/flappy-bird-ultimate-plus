// PLAYING: owns a live run. Wires bird + pipe + collision + score + particles.
import { Bird } from '../entities/Bird.js';
import { Ground } from '../entities/Ground.js';
import { BackgroundLayer } from '../entities/BackgroundLayer.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { PipeSystem } from '../systems/PipeSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { Random } from '../core/Random.js';
import { drawBird, drawPipe, drawGround } from '../rendering/draw.js';
import { LAYERS } from '../core/Renderer.js';

export class PlayingState {
  constructor({ context }) {
    this.context = context;
    this.unsubscribers = [];
  }

  async enter(ctx) {
    const c = ctx.resolvedConfig;
    this.random = new Random(12345);
    this.bird = new Bird({ x: c.bird.x });
    this.ground = new Ground({ height: 72 });
    this.far = new BackgroundLayer({ name: 'far', parallax: 0.2 });
    this.near = new BackgroundLayer({ name: 'near', parallax: 0.5, color: '#0a0a14' });

    this.physics = new PhysicsSystem({
      gravity: c.bird.gravity,
      flapImpulse: c.bird.flapImpulse,
      maxFallSpeed: c.bird.maxFallSpeed,
      maxUpRotation: c.bird.maxUpRotation,
      maxDownRotation: c.bird.maxDownRotation,
    });
    this.collision = new CollisionSystem({ eventBus: ctx.eventBus });
    this.pipes = new PipeSystem({ config: c.pipes, random: this.random, eventBus: ctx.eventBus });
    this.score = new ScoreSystem({ pointsPerPipe: c.scoring.pointsPerPipe, eventBus: ctx.eventBus });
    this.particles = new ParticleSystem({ quality: ctx.settings.quality, budget: c.particles });

    const { width, height } = ctx.renderer.getLogicalSize();
    this.logicalWidth = width;
    this.logicalHeight = height;

    this.bird.reset({ startY: height / 2 });
    this.ground.surfaceY(height);

    ctx.eventBus.emit('run:started', { seed: this.random.seed });

    // Subscribe to collision for game over.
    this.unsubscribers.push(
      ctx.eventBus.on('collision:detected', () => this._onCollision(ctx)),
    );
  }

  async exit(ctx) {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.pipes.reset();
    this.particles.clear();
    ctx.input.clearFrame();
  }

  handleAction(ctx, action) {
    if (action.type === 'FLAP') {
      this.physics.flap(this.bird);
      ctx.audio.playSfx('flap', { freq: 520, type: 'triangle' });
      ctx.eventBus.emit('bird:flapped', {});
      this.particles.emit({ x: this.bird.x - 8, y: this.bird.y, vy: 20, life: 0.3, size: 2, color: ctx.skins.getSelectedSkin().color });
      return true;
    }
    if (action.type === 'PAUSE') {
      ctx.stateManager.change('PAUSED', { reason: 'user' });
      return true;
    }
    return false;
  }

  update(ctx, dt) {
    const c = ctx.resolvedConfig;
    const groundY = this.ground.surfaceY(this.logicalHeight);

    if (this.bird.alive) {
      this.physics.update(this.bird, dt);
      this.pipes.update({
        dt,
        speed: c.pipes.speed,
        groundY,
        logicalWidth: this.logicalWidth,
      });

      // Scoring: pipe crossed when bird.x passes pipe trailing edge.
      for (const pipe of this.pipes.getActive()) {
        if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
          pipe.scored = true;
          this.score.markPipePassed();
          ctx.audio.playSfx('score', { freq: 880, type: 'square' });
        }
      }

      // Collision.
      const result = this.collision.testBirdVsWorld(this.bird, this.pipes.getActive(), { groundY, ceilingY: 0 });
      if (result.hit) {
        this.bird.alive = false;
        ctx.eventBus.emit('collision:detected', { type: result.type });
      }

      // Trail particle for neon feel.
      this.particles.emit({ x: this.bird.x - 6, y: this.bird.y, vx: -60, life: 0.25, size: 2, color: ctx.skins.getSelectedSkin().color });
    }

    this.particles.update(dt);
    this.far.scroll(c.pipes.speed);
    this.near.scroll(c.pipes.speed);
    this.ground.scroll(c.pipes.speed);

    // Ground death via falling (already captured by collision system).
  }

  _onCollision(ctx) {
    ctx.audio.playSfx('hit', { freq: 120, type: 'sawtooth' });
    // Finalize result exactly once, then transition.
    ctx.stateManager.change('GAME_OVER', { result: this._finalizeResult(ctx) });
  }

  _finalizeResult(ctx) {
    const result = {
      score: this.score.getScore(),
      seed: this.random.seed,
      duration: 0,
      // Replay metadata will include input log; placeholder for Part 1.
    };
    return result;
  }

  render(ctx, alpha) {
    const { renderer } = ctx;
    const W = this.logicalWidth;
    const H = this.logicalHeight;
    renderer.beginFrame();

    // Background.
    renderer.draw(() => {
      const r = renderer.ctx;
      const grad = r.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#05050f');
      grad.addColorStop(1, '#14142a');
      r.fillStyle = grad;
      r.fillRect(0, 0, W, H);
    });

    // Pipes.
    renderer.draw(() => {
      const r = renderer.ctx;
      for (const pipe of this.pipes.getActive()) drawPipe(r, pipe);
    });

    // Particles behind bird.
    this.particles.render(renderer.ctx, alpha);

    // Bird.
    renderer.draw(() => {
      drawBird(renderer.ctx, this.bird, ctx.skins.getSelectedSkin());
    });

    // Ground.
    renderer.draw(() => {
      drawGround(renderer.ctx, this.ground, H);
    });

    // HUD: score.
    renderer.draw(() => {
      const r = renderer.ctx;
      r.textAlign = 'center';
      r.fillStyle = '#e8e8ff';
      r.shadowColor = '#00e5ff';
      r.shadowBlur = 12;
      r.font = 'bold 52px system-ui';
      r.fillText(String(this.score.getScore()), W / 2, H * 0.16);
      r.shadowBlur = 0;
    });

    renderer.flush();
  }
}