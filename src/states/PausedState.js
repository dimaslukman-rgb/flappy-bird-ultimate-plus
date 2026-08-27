// PAUSED: freezes simulation while UI remains interactive. Overlay on PLAYING.
export class PausedState {
  constructor({ context }) {
    this.context = context;
  }

  async enter(ctx) {
    // Discard queued FLAP so a resume never double-flaps.
    ctx.input.clearFrame();
  }

  async exit() {}

  update(ctx) {
    // Simulation frozen intentionally: no gameplay systems advance here.
  }

  render(ctx, alpha) {
    const { renderer } = ctx;
    const W = renderer.logicalWidth;
    const H = renderer.logicalHeight;
    // Re-render the underlying scene is not available; draw a translucent veil.
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = 'rgba(5,5,15,0.75)';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 40px system-ui';
      r.fillText('PAUSED', W / 2, H * 0.4);
      r.fillStyle = '#9a9ac0';
      r.font = '18px system-ui';
      r.fillText('Tap to resume', W / 2, H * 0.48);
    });
    renderer.flush();
  }

  handleAction(ctx, action) {
    if (action.type === 'FLAP' || action.type === 'RESUME' || action.type === 'CONFIRM') {
      ctx.stateManager.change('PLAYING');
      return true;
    }
    if (action.type === 'PAUSE') {
      ctx.stateManager.change('PLAYING');
      return true;
    }
    return false;
  }
}