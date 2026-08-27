// Validates and executes state transitions against an explicit policy map.
// States implement async enter/exit and sync update/render/handleAction.
const STATES = ['BOOT', 'MENU', 'PLAYING', 'PAUSED', 'GAME_OVER', 'SHOP', 'SETTINGS', 'LEADERBOARD', 'ERROR'];

const TRANSITIONS = {
  BOOT: ['MENU', 'ERROR'],
  MENU: ['PLAYING', 'SHOP', 'SETTINGS', 'LEADERBOARD', 'ERROR'],
  PLAYING: ['PAUSED', 'GAME_OVER', 'MENU', 'ERROR'],
  PAUSED: ['PLAYING', 'MENU', 'SETTINGS', 'ERROR'],
  GAME_OVER: ['PLAYING', 'MENU', 'SHOP', 'LEADERBOARD', 'ERROR'],
  SHOP: ['MENU', 'ERROR'],
  SETTINGS: ['MENU', 'PAUSED', 'ERROR'],
  LEADERBOARD: ['MENU', 'GAME_OVER', 'ERROR'],
  ERROR: ['BOOT', 'MENU'],
};

export class StateManager {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
    this.registry = new Map();
    this.current = null;
    this.currentName = null;
    this.transitioning = false;
    this.pendingTransitions = [];
  }

  register(name, state) {
    if (!STATES.includes(name)) throw new Error(`StateManager.register: unknown state "${name}"`);
    if (!state || typeof state.enter !== 'function') {
      throw new Error(`StateManager.register: "${name}" must implement enter()`);
    }
    this.registry.set(name, state);
  }

  canTransition(from, to) {
    return (TRANSITIONS[from] || []).includes(to);
  }

  async change(to, payload = {}) {
    if (!STATES.includes(to)) throw new Error(`StateManager.change: unknown state "${to}"`);
    if (this.transitioning) {
      return new Promise((resolve, reject) => {
        this.pendingTransitions.push({ to, payload, resolve, reject });
      });
    }
    const from = this.currentName;
    if (from && !this.canTransition(from, to)) {
      throw new Error(`StateManager.change: illegal transition ${from} -> ${to}`);
    }

    this.transitioning = true;
    this.eventBus?.emit('state:changing', { from, to, reason: payload.reason });
    try {
      if (this.current) {
        await this.current.exit(this.context, to);
      }
      const next = this.registry.get(to);
      if (!next) throw new Error(`StateManager.change: state "${to}" not registered`);
      this.current = next;
      this.currentName = to;
      await next.enter(this.context, payload);
      this.eventBus?.emit('state:changed', { from, to, reason: payload.reason });
    } finally {
      this.transitioning = false;
      const pending = this.pendingTransitions.shift();
      if (pending) {
        this.change(pending.to, pending.payload).then(pending.resolve, pending.reject);
      }
    }
  }

  update(dt) {
    if (this.current?.update) this.current.update(this.context, dt);
  }

  render(alpha) {
    if (this.current?.render) this.current.render(this.context, alpha);
  }

  handleAction(action) {
    if (this.current?.handleAction) return this.current.handleAction(this.context, action);
    return false;
  }

  setContext(context) {
    this.context = context;
  }

  getCurrentName() {
    return this.currentName;
  }
}