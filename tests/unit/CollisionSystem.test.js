import { describe, it, expect } from 'vitest';
import { CollisionSystem } from '../../src/systems/CollisionSystem.js';
import { Bird } from '../../src/entities/Bird.js';

describe('CollisionSystem', () => {
  it('circleVsRect detects overlap', () => {
    const cs = new CollisionSystem();
    expect(cs.circleVsRect(10, 10, 5, 8, 8, 4, 4)).toBe(true);
    expect(cs.circleVsRect(100, 100, 5, 8, 8, 4, 4)).toBe(false);
  });

  it('ground collision is lethal', () => {
    const cs = new CollisionSystem();
    const bird = new Bird({ x: 96 });
    bird.radius = 16;
    bird.y = 400; // ground at 300
    const res = cs.testBirdVsWorld(bird, [], { groundY: 300, ceilingY: 0 });
    expect(res.hit).toBe(true);
    expect(res.type).toBe('ground');
  });

  it('bird above ground is not hit', () => {
    const cs = new CollisionSystem();
    const bird = new Bird({ x: 96 });
    bird.y = 100;
    const res = cs.testBirdVsWorld(bird, [], { groundY: 300, ceilingY: 0 });
    expect(res.hit).toBe(false);
  });
});