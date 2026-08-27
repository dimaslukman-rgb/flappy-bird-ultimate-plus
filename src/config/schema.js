// Structural schema used by ConfigManager.validate to reject malformed overrides.
// Lists the keys expected at each node; unknown keys are tolerated by type check.
export const SCHEMA = Object.freeze({
  engine: {
    fixedStep: 'positive-number',
    maxFrameDelta: 'positive-number',
    maxSteps: 'positive-integer',
  },
  renderer: {
    logicalWidth: 'positive-integer',
    logicalHeight: 'positive-integer',
    maxPixelRatio: 'positive-number',
  },
  bird: {
    x: 'number',
    gravity: 'positive-number',
    flapImpulse: 'number',
    maxFallSpeed: 'positive-number',
    maxUpRotation: 'number',
    maxDownRotation: 'number',
  },
  pipes: {
    width: 'positive-number',
    initialGap: 'positive-number',
    minimumGap: 'positive-number',
    speed: 'positive-number',
    spawnInterval: 'positive-number',
  },
  scoring: {
    pointsPerPipe: 'positive-number',
  },
  particles: {
    low: 'positive-integer',
    medium: 'positive-integer',
    high: 'positive-integer',
  },
  audio: {
    maxSfxVoices: 'positive-integer',
  },
  accessibility: {
    reducedMotionMultiplier: 'number',
  },
});