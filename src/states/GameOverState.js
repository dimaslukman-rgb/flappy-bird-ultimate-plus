// GAME_OVER: finalizes a run result, persists best/totals, shows result panel.
export class GameOverState {
  constructor({ context }) {
    this.context = context;
    this.result = { score: 0 };
  }

  async enter(ctx, payload = {}) {
    this.result = payload.result ?? { score: 0 };
    // Persist best score + totals exactly once.
    await ctx.save.patch((save) => {
      const p = save.progression;
      p.gamesPlayed += 1;
      p.lifetimeScore += this.result.score;
      if (this.result.score > p.bestScore) p.bestScore = this.result.score;
      // Simple XP: 1 xp per point, level every 10.
      p.xp += this.result.score;
      save.progression.level = Math.floor(p.xp / 10) + 1;
      p.coins += this.result.score; // raw coin accrual for now (economy in Part 4)
    });
    ctx.eventBus.emit('run:ended', { ...this.result });
  }

  async exit() {}

  update() {}

  render(ctx) {
    const { renderer } = ctx;
    const W = renderer.logicalWidth;
    const H = renderer.logicalHeight;
    const best = ctx.save.getSnapshot()?.progression?.bestScore ?? 0;
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = 'rgba(5,5,15,0.85)';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#ff4d6d';
      r.shadowColor = '#ff4d6d';
      r.shadowBlur = 16;
      r.font = 'bold 40px system-ui';
      r.fillText('GAME OVER', W / 2, H * 0.3);
      r.shadowBlur = 0;
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 64px system-ui';
      r.fillText(String(this.result.score), W / 2, H * 0.42);
      r.fillStyle = '#9a9ac0';
      r.font = '18px system-ui';
      r.fillText(`Best: ${best}`, W / 2, H * 0.5);
      r.fillText('Tap to retry', W / 2, H * 0.6);
    });
    renderer.flush();
  }

  handleAction(ctx, action) {
    if (action.type === 'FLAP' || action.type === 'CONFIRM') {
      ctx.stateManager.change('PLAYING');
      return true;
    }
    if (action.type === 'BACK') {
      ctx.stateManager.change('MENU');
      return true;
    }
    return false;
  }
}