// Safe built-in defaults form the lowest config layer.
// Higher layers (env, remote, debug) override only in production-free paths.
export const DEFAULTS = Object.freeze({
  engine: {
    fixedStep: 1 / 60, // seconds per simulation step
    maxFrameDelta: 0.25, // clamp long browser frames
    maxSteps: 5, // max fixed updates per frame before spiral prevention
  },
  renderer: {
    logicalWidth: 390,
    logicalHeight: 844,
    maxPixelRatio: 2,
  },
  bird: {
    x: 96, // logical x anchor for the bird
    gravity: 1550, // px/s^2
    flapImpulse: -470, // px/s upward velocity on flap
    maxFallSpeed: 760, // px/s terminal fall
    maxUpRotation: -0.4, // radians, pointing up
    maxDownRotation: 1.4, // radians, diving
  },
  pipes: {
    width: 76,
    initialGap: 210,
    minimumGap: 150,
    speed: 170, // px/s scroll speed
    spawnInterval: 1.45, // seconds between pipe pairs
  },
  scoring: {
    pointsPerPipe: 1,
  },
  particles: {
    low: 40,
    medium: 100,
    high: 220,
  },
  audio: {
    maxSfxVoices: 8,
  },
  accessibility: {
    reducedMotionMultiplier: 0.35,
  },
});