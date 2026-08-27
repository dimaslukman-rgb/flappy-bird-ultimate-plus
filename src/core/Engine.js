// Owns the browser animation loop + fixed-step accumulator.
// Renders once per frame; simulation may run 0..maxSteps times.
export class Engine {
  constructor({ clock, stateManager, config, eventBus } = {}) {
    if (!clock || !stateManager || !config) {
      throw new Error('Engine: clock, stateManager, and config are required');
    }
    this.clock = clock;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.fixedStep = config.fixedStep;
    this.maxSteps = config.maxSteps;
    this.running = false;
    this.rafId = null;
    this.boundFrame = this.frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.reset();
    this.rafId = requestAnimationFrame((t) => {
      this.clock.tick(t); // prime timestamp
      this.boundFrame(t);
    });
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  frame(timestamp) {
    if (!this.running) return;
    const rawDelta = this.clock.tick(timestamp);
    this.clock.accumulate(rawDelta);

    let steps = 0;
    while (this.clock.accumulator >= this.fixedStep && steps < this.maxSteps) {
      this.stateManager.update(this.fixedStep);
      this.clock.advance(this.fixedStep);
      this.clock.consume(this.fixedStep);
      steps++;
    }

    if (steps === this.maxSteps && this.clock.accumulator >= this.fixedStep) {
      // Spiral prevention: drop accumulated time so we never run away.
      this.clock.accumulator %= this.fixedStep;
      this.eventBus?.emit('engine:spiralPrevented', {});
    }

    const alpha = this.clock.getInterpolationAlpha(this.fixedStep);
    this.stateManager.render(alpha);

    this.rafId = requestAnimationFrame(this.boundFrame);
  }
}