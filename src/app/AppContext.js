// Composition root: holds shared service references for states + systems.
export class AppContext {
  constructor() {
    this.config = null;
    this.eventBus = null;
    this.renderer = null;
    this.input = null;
    this.assets = null;
    this.audio = null;
    this.save = null;
    this.settings = null;
    this.skins = null;
    this.stateManager = null;
    this.engine = null;
    this.camera = null;
    this.clock = null;
  }
}