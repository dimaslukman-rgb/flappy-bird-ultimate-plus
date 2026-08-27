import { describe, it, expect, vi } from 'vitest';
import { MenuState } from '../../src/states/MenuState.js';

describe('MenuState navigation', () => {
  it('routes pointer taps to the matching menu screen', () => {
    const change = vi.fn();
    const menu = new MenuState({ context: {} });
    menu.buttons = [
      { label: 'PLAY', y: 100 },
      { label: 'SHOP', y: 168 },
      { label: 'LEADERBOARD', y: 236 },
      { label: 'SETTINGS', y: 304 },
    ];
    const ctx = { stateManager: { change } };

    expect(menu.handleAction(ctx, { type: 'FLAP', source: 'pointer', x: 195, y: 180 })).toBe(true);
    expect(change).toHaveBeenCalledWith('SHOP');
  });

  it('ignores pointer taps outside drawn buttons', () => {
    const change = vi.fn();
    const menu = new MenuState({ context: {} });
    menu.buttons = [{ label: 'PLAY', y: 100 }];

    expect(menu.handleAction({ stateManager: { change } }, {
      type: 'FLAP',
      source: 'pointer',
      x: 20,
      y: 110,
    })).toBe(false);
    expect(change).not.toHaveBeenCalled();
  });
});
