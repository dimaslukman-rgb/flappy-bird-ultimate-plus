// Small deterministic math helpers. No Date.now / Math.random here; callers own those.
export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Interpolation factor clamped to [0,1] for render alpha safety.
export function clampAlpha(alpha) {
  return clamp(alpha, 0, 1);
}