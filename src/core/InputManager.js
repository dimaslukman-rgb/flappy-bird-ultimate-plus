// Normalizes raw pointer/keyboard input into gameplay actions.
const ACTIONS = ['FLAP', 'CONFIRM', 'BACK', 'PAUSE', 'RESUME', 'OPEN_SHOP', 'OPEN_SETTINGS', 'MUTE_TOGGLE'];

export class InputManager {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
    this.enabled = true;
    this.pendingActions = [];
    this.heldActions = new Set();
    this.bindings = {
      keys: {
        Space: 'FLAP',
        ArrowUp: 'FLAP',
        Enter: 'CONFIRM',
        Escape: 'PAUSE',
        p: 'PAUSE',
        P: 'PAUSE',
      },
    };
    this.screenToLogical = (x, y) => ({ x, y });
    this._handlers = {
      pointerdown: (e) => this._onPointerDown(e),
      keydown: (e) => this._onKeyDown(e),
      keyup: (e) => this._onKeyUp(e),
    };
  }

  attach(target) {
    target.addEventListener('pointerdown', this._handlers.pointerdown);
    window.addEventListener('keydown', this._handlers.keydown);
    window.addEventListener('keyup', this._handlers.keyup);
  }

  detach(target) {
    target.removeEventListener('pointerdown', this._handlers.pointerdown);
    window.removeEventListener('keydown', this._handlers.keydown);
    window.removeEventListener('keyup', this._handlers.keyup);
  }

  setCoordinateMapper(fn) {
    this.screenToLogical = fn;
  }

  _onPointerDown(e) {
    if (!this.enabled) return;
    e.preventDefault();
    const { x, y } = this.screenToLogical(e.clientX, e.clientY);
    this.pendingActions.push({
      type: 'FLAP',
      phase: 'pressed',
      pointerId: e.pointerId,
      x,
      y,
      timestamp: performance.now(),
      source: 'pointer',
    });
  }

  _onKeyDown(e) {
    if (!this.enabled) return;
    const actionType = this.bindings.keys[e.key];
    if (!actionType) return;
    if (e.repeat) return; // no repeated pressed from held keys
    if (!this.heldActions.has(actionType)) {
      this.heldActions.add(actionType);
      this.pendingActions.push({
        type: actionType,
        phase: 'pressed',
        pointerId: null,
        x: null,
        y: null,
        timestamp: performance.now(),
        source: 'keyboard',
      });
    }
  }

  _onKeyUp(e) {
    const actionType = this.bindings.keys[e.key];
    if (!actionType) return;
    this.heldActions.delete(actionType);
  }

  // Return true if a FLAP action is available (used greedily by states).
  consume(type = 'FLAP') {
    const idx = this.pendingActions.findIndex((a) => a.type === type);
    if (idx < 0) return null;
    return this.pendingActions.splice(idx, 1)[0];
  }

  consumeAll() {
    const actions = this.pendingActions;
    this.pendingActions = [];
    return actions;
  }

  isHeld(type) {
    return this.heldActions.has(type);
  }

  clearFrame() {
    this.pendingActions.length = 0;
  }

  setEnabled(value) {
    this.enabled = value;
  }
}

export { ACTIONS };