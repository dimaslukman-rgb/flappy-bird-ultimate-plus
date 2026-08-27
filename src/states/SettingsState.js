// SETTINGS: volume/mute/vibration toggles (persisted via SettingsManager).
export class SettingsState {
  constructor({ context }) {
    this.context = context;
  }

  async enter() {}

  async exit() {}

  update() {}

  render(ctx) {
    const { renderer } = ctx;
    const W = renderer.logicalWidth;
    const H = renderer.logicalHeight;
    const s = ctx.settings.get();
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = '#0a0a14';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 32px system-ui';
      r.fillText('SETTINGS', W / 2, H * 0.2);

      const rows = [
        ['Muted', s.muted ? 'ON' : 'OFF'],
        ['Quality', s.quality],
        ['SFX Volume', Math.round(s.sfxVolume * 100) + '%'],
        ['Music Volume', Math.round(s.musicVolume * 100) + '%'],
      ];
      rows.forEach(([label, value], i) => {
        const y = H * 0.32 + i * 52;
        r.fillStyle = '#9a9ac0';
        r.textAlign = 'left';
        r.font = '18px system-ui';
        r.fillText(label, W / 2 - 120, y);
        r.fillStyle = '#e8e8ff';
        r.textAlign = 'right';
        r.fillText(String(value), W / 2 + 120, y);
        r.textAlign = 'center';
      });

      r.fillStyle = '#5a5a7a';
      r.font = '15px system-ui';
      r.fillText('Back to menu', W / 2, H * 0.8);
    });
    renderer.flush();
  }

  async handleAction(ctx, action) {
    if (action.type === 'MUTE_TOGGLE') {
      const cur = ctx.settings.get().muted;
      await ctx.settings.set({ muted: !cur });
      ctx.audio.setMuted(!cur);
      return true;
    }
    if (action.type === 'BACK' || action.type === 'PAUSE' || action.type === 'FLAP' || action.type === 'CONFIRM') {
      ctx.stateManager.change('MENU');
      return true;
    }
    return false;
  }
}