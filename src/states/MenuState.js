// Main menu with Play / Shop / Leaderboard / Settings (neon).
export class MenuState {
  constructor({ context }) {
    this.context = context;
    this.title = 'FLAPPY BIRD';
    this.subtitle = 'ULTIMATE+';
  }

  async enter(ctx) {
    // Unlock audio on first user gesture path.
    void ctx.audio.unlock();
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
      // Background.
      const grad = r.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0a14');
      grad.addColorStop(1, '#14142a');
      r.fillStyle = grad;
      r.fillRect(0, 0, W, H);

      // Title with neon glow.
      r.textAlign = 'center';
      r.shadowColor = '#00e5ff';
      r.shadowBlur = 20;
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 44px system-ui';
      r.fillText(this.title, W / 2, H * 0.28);
      r.shadowColor = '#ff2ea6';
      r.font = 'bold 24px system-ui';
      r.fillText(this.subtitle, W / 2, H * 0.34);
      r.shadowBlur = 0;

      // Best score.
      const best = ctx.save.getSnapshot()?.progression?.bestScore ?? 0;
      r.fillStyle = '#9a9ac0';
      r.font = '16px system-ui';
      r.fillText(`Best: ${best}`, W / 2, H * 0.42);
    });

    // Buttons (DOM-free: draw hit areas; input maps FLAP->play, etc.)
    renderer.draw(() => {
      const r = renderer.ctx;
      const labels = ['PLAY', 'SHOP', 'LEADERBOARD', 'SETTINGS'];
      const startY = H * 0.5;
      labels.forEach((label, i) => {
        const y = startY + i * 68;
        const w = 200;
        const x = W / 2 - w / 2;
        r.fillStyle = i === 0 ? '#00e5ff' : '#1e1e3a';
        r.strokeStyle = '#2a2a4a';
        r.lineWidth = 1;
        r.beginPath();
        r.roundRect(x, y, w, 52, 14);
        r.fill();
        r.stroke();
        r.fillStyle = i === 0 ? '#050510' : '#e8e8ff';
        r.font = 'bold 18px system-ui';
        r.fillText(label, W / 2, y + 34);
      });
      this.buttons = labels.map((label, i) => ({
        label,
        x: W / 2 - 100,
        y: startY + i * 68,
        width: 200,
        height: 52,
      }));
    });

    renderer.flush();
  }

  handleAction(ctx, action) {
    if (action.type === 'CONFIRM') {
      ctx.stateManager.change('PLAYING');
      return true;
    }
    if (action.type !== 'FLAP') return action.type === 'PAUSE';

    // Pointer taps carry logical coordinates; only activate a drawn button.
    if (action.source === 'pointer') {
      const button = this.buttons?.find(
        ({ x, y, width, height }) =>
          action.x >= x && action.x <= x + width && action.y >= y && action.y <= y + height,
      );
      if (!button) return false;
      const destinations = {
        PLAY: 'PLAYING',
        SHOP: 'SHOP',
        LEADERBOARD: 'LEADERBOARD',
        SETTINGS: 'SETTINGS',
      };
      ctx.stateManager.change(destinations[button.label]);
      return true;
    }

    ctx.stateManager.change('PLAYING');
    return true;
  }
}