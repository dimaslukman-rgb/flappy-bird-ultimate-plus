// Error state: recoverable failure with retry to MENU or BOOT.
export class ErrorState {
  constructor({ context }) {
    this.context = context;
    this.reason = 'unknown';
  }

  async enter(ctx, payload = {}) {
    this.reason = payload.reason ?? payload.error?.message ?? 'unknown';
  }

  async exit() {}

  update() {}

  render(ctx) {
    const { renderer } = ctx;
    const W = renderer.logicalWidth;
    const H = renderer.logicalHeight;
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = '#0a0a14';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#ff4d6d';
      r.font = 'bold 32px system-ui';
      r.fillText('ERROR', W / 2, H * 0.4);
      r.fillStyle = '#9a9ac0';
      r.font = '16px system-ui';
      r.fillText(this.reason, W / 2, H * 0.48);
      r.fillText('Tap to return to menu', W / 2, H * 0.58);
    });
    renderer.flush();
  }

  handleAction(ctx, action) {
    if (action.type === 'FLAP' || action.type === 'CONFIRM') {
      ctx.stateManager.change('MENU');
      return true;
    }
    return false;
  }
}