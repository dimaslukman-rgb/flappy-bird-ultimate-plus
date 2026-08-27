// LEADERBOARD: offline local best. Global leaderboard lands with Firebase (Part 2).
export class LeaderboardState {
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
    const best = ctx.save.getSnapshot()?.progression?.bestScore ?? 0;
    const games = ctx.save.getSnapshot()?.progression?.gamesPlayed ?? 0;
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = '#0a0a14';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 32px system-ui';
      r.fillText('LEADERBOARD', W / 2, H * 0.2);
      r.fillStyle = '#9a9ac0';
      r.font = '16px system-ui';
      r.fillText('Local (offline)', W / 2, H * 0.3);

      r.fillStyle = '#00e5ff';
      r.font = 'bold 40px system-ui';
      r.fillText(String(best), W / 2, H * 0.42);
      r.fillStyle = '#9a9ac0';
      r.font = '18px system-ui';
      r.fillText('Best score', W / 2, H * 0.5);
      r.fillText(`Games played: ${games}`, W / 2, H * 0.56);
    });
    renderer.flush();
  }

  handleAction(ctx, action) {
    if (action.type === 'BACK' || action.type === 'PAUSE' || action.type === 'FLAP' || action.type === 'CONFIRM') {
      ctx.stateManager.change('MENU');
      return true;
    }
    return false;
  }
}