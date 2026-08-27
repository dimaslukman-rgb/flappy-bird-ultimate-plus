import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
  it('on/emit delivers payload', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('x', fn);
    bus.emit('x', { a: 1 });
    expect(fn).toHaveBeenCalledWith({ a: 1 });
  });

  it('off unsubscribes', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    const unsub = bus.on('x', fn);
    unsub();
    bus.emit('x', {});
    expect(fn).not.toHaveBeenCalled();
  });

  it('once fires exactly once', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.once('y', fn);
    bus.emit('y', {});
    bus.emit('y', {});
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('listener added during emit does not run in same emit', () => {
    const bus = new EventBus();
    const late = vi.fn();
    bus.on('z', () => bus.on('z', late));
    bus.emit('z', {});
    expect(late).not.toHaveBeenCalled();
  });
});