// Boot: load config, save, critical assets, then transition to MENU.
import { logger } from '../utils/logger.js';

export class BootState {
  constructor({ context }) {
    this.context = context;
  }

  async enter(ctx) {
    const { config, save, assets, stateManager } = ctx;
    ctx.eventBus.emit('app:ready', {});
    try {
      await save.load();
      await assets.preloadCritical();
      stateManager.change('MENU');
    } catch (err) {
      logger.error('BootState', 'boot failed', err);
      stateManager.change('ERROR', { reason: 'boot', error: err });
    }
  }

  async exit() {}

  update() {}

  render(ctx) {
    // Loading screen fallback.
    const { renderer } = ctx;
    renderer.beginFrame();
    renderer.draw(() => {
      renderer.ctx.fillStyle = '#e8e8ff';
      renderer.ctx.font = '16px system-ui';
      renderer.ctx.textAlign = 'center';
      renderer.ctx.fillText('Loading…', renderer.logicalWidth / 2, renderer.logicalHeight / 2);
    });
    renderer.flush();
  }

  handleAction() {
    return false;
  }
}