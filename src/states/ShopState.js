// SHOP: offline skin shop stub. Full economy lands with Firebase (Part 4).
import { SKINS } from '../managers/SkinManager.js';

export class ShopState {
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
    renderer.beginFrame();
    renderer.draw(() => {
      const r = renderer.ctx;
      r.fillStyle = '#0a0a14';
      r.fillRect(0, 0, W, H);
      r.textAlign = 'center';
      r.fillStyle = '#e8e8ff';
      r.font = 'bold 32px system-ui';
      r.fillText('SHOP', W / 2, H * 0.2);
      r.fillStyle = '#9a9ac0';
      r.font = '15px system-ui';
      r.fillText('Skins (offline preview)', W / 2, H * 0.28);

      const skins = Object.values(SKINS);
      const owned = ctx.skins.getOwned();
      const selected = ctx.skins.getSelected();
      skins.forEach((skin, i) => {
        const y = H * 0.34 + i * 56;
        const ownedFlag = owned.includes(skin.id);
        r.fillStyle = skin.color;
        r.beginPath();
        r.arc(W / 2 - 100, y, 14, 0, Math.PI * 2);
        r.fill();
        r.fillStyle = ownedFlag ? '#e8e8ff' : '#5a5a7a';
        r.textAlign = 'left';
        r.font = '16px system-ui';
        r.fillText(`${skin.name}${skin.id === selected ? '  (selected)' : ''}`, W / 2 - 72, y + 6);
        if (!ownedFlag) {
          r.fillStyle = '#ffcf3d';
          r.fillText('🔒 locked', W / 2 + 120, y + 6);
        }
        r.textAlign = 'center';
      });
    });
    renderer.flush();

    // No tap-to-select wiring yet; Back returns to menu (see handleAction).
  }

  handleAction(ctx, action) {
    if (action.type === 'BACK' || action.type === 'PAUSE' || action.type === 'FLAP' || action.type === 'CONFIRM') {
      ctx.stateManager.change('MENU');
      return true;
    }
    return false;
  }
}