// Owns Canvas2D config and ordered render passes with DPR scaling.
const LAYERS = {
  BACKGROUND_FAR: 0,
  BACKGROUND_NEAR: 10,
  WORLD_PIPES: 20,
  WORLD_PARTICLES_BEHIND: 30,
  WORLD_BIRD: 40,
  WORLD_PARTICLES_FRONT: 50,
  HUD: 60,
  OVERLAY: 70,
  MODAL: 80,
  DEBUG: 90,
};

export class Renderer {
  constructor({ canvas, config, eventBus } = {}) {
    if (!canvas) throw new Error('Renderer: canvas is required');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.eventBus = eventBus;
    this.pixelRatio = 1;
    this.logicalWidth = config.logicalWidth;
    this.logicalHeight = config.logicalHeight;
    this.camera = null;
    this.queues = new Map();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  resize() {
    const vw = window.visualViewport?.width || window.innerWidth;
    const vh = window.visualViewport?.height || window.innerHeight;
    // Contain logical resolution within viewport, preserving aspect.
    const scale = Math.min(vw / this.logicalWidth, vh / this.logicalHeight);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.config.maxPixelRatio);
    const cssW = Math.floor(this.logicalWidth * scale);
    const cssH = Math.floor(this.logicalHeight * scale);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.floor(cssW * this.pixelRatio);
    this.canvas.height = Math.floor(cssH * this.pixelRatio);
    this.scale = scale * this.pixelRatio;
    this.eventBus?.emit('renderer:resized', { cssW, cssH, scale });
  }

  beginFrame() {
    const ctx = this.ctx;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  // Apply camera then run a draw function within save/restore.
  draw(fn) {
    const ctx = this.ctx;
    ctx.save();
    if (this.camera) this.camera.apply(ctx);
    fn(ctx);
    ctx.restore();
  }

  // Submit a draw command into a layer queue.
  queue(layer, z, draw) {
    let list = this.queues.get(layer);
    if (!list) {
      list = [];
      this.queues.set(layer, list);
    }
    list.push({ z, draw });
  }

  submit() {
    // Sort each layer by z ascending.
    for (const [, list] of this.queues) {
      list.sort((a, b) => a.z - b.z);
    }
  }

  flush() {
    const sorted = [...this.queues.keys()].sort((a, b) => a - b);
    for (const layer of sorted) {
      for (const { draw } of this.queues.get(layer)) {
        draw(this.ctx);
      }
    }
    this.queues.clear();
  }

  endFrame() {
    // no-op: transformations are managed per draw with save/restore
  }

  getLogicalSize() {
    return { width: this.logicalWidth, height: this.logicalHeight };
  }

  screenToLogical(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const cssScale = rect.width / this.logicalWidth || 1;
    return { x: (x - rect.left) / cssScale, y: (y - rect.top) / cssScale };
  }
}

export { LAYERS };