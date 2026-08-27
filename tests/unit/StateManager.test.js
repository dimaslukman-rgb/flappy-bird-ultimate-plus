import { describe, it, expect } from 'vitest';
import { StateManager } from '../../src/core/StateManager.js';

function makeState(name) {
  return { enter: () => {}, exit: () => {}, update: () => {}, render: () => {}, handleAction: () => false, name };
}

describe('StateManager', () => {
  it('registers and changes to a valid state', async () => {
    const sm = new StateManager();
    sm.setContext({});
    sm.register('MENU', makeState('menu'));
    sm.register('PLAYING', makeState('playing'));
    await sm.change('MENU');
    expect(sm.getCurrentName()).toBe('MENU');
    await sm.change('PLAYING');
    expect(sm.getCurrentName()).toBe('PLAYING');
  });

  it('rejects illegal transition', async () => {
    const sm = new StateManager();
    sm.setContext({});
    for (const s of ['MENU', 'PLAYING', 'GAME_OVER']) sm.register(s, makeState(s));
    await sm.change('MENU');
    await expect(sm.change('GAME_OVER')).rejects.toThrow(/illegal transition/);
  });

  it('queues a transition requested during enter', async () => {
    const sm = new StateManager();
    sm.setContext({});
    const boot = makeState('boot');
    boot.enter = () => {
      void sm.change('MENU');
    };
    sm.register('BOOT', boot);
    sm.register('MENU', makeState('menu'));

    await sm.change('BOOT');
    await Promise.resolve();
    expect(sm.getCurrentName()).toBe('MENU');
  });
});