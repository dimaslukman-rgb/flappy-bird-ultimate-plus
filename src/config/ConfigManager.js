// ConfigManager: layer defaults + env + debug override, validate, deep-freeze.
import { DEFAULTS } from './defaults.js';
import { SCHEMA } from './schema.js';
import { deepFreeze } from '../utils/deepFreeze.js';
import { logger } from '../utils/logger.js';

function isNumeric(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function matches(type, value) {
  switch (type) {
    case 'number':
      return isNumeric(value);
    case 'positive-number':
      return isNumeric(value) && value > 0;
    case 'positive-integer':
      return Number.isInteger(value) && value > 0;
    default:
      return false;
  }
}

function mergeDeep(base, override) {
  const out = {};
  for (const key of Object.keys(base ?? {})) {
    const value = base[key];
    out[key] =
      value && typeof value === 'object'
        ? Array.isArray(value)
          ? [...value]
          : mergeDeep(value, {})
        : value;
  }
  for (const key of Object.keys(override ?? {})) {
    const b = base?.[key];
    const o = override[key];
    if (b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object') {
      out[key] = mergeDeep(b, o);
    } else if (o !== undefined) {
      out[key] = o;
    }
  }
  return out;
}

function validateNode(node, schema, path, defaults = {}) {
  for (const [key, type] of Object.entries(schema)) {
    const value = node[key];
    if (value === undefined) {
      if (defaults[key] !== undefined) node[key] = defaults[key];
      continue;
    }
    if (!matches(type, value)) {
      logger.warn('ConfigManager', `invalid value for ${path}.${key} (expected ${type})`, {
        value,
      });
      if (defaults[key] !== undefined) node[key] = defaults[key];
    }
  }
}

export class ConfigManager {
  constructor(defaults = DEFAULTS, schema = SCHEMA) {
    this.defaults = defaults;
    this.schema = schema;
    this.resolved = null;
    this.options = { production: false };
  }

  load({ env = {}, debug = {}, production = false } = {}) {
    this.options = { production };
    let merged = mergeDeep(this.defaults, env);
    // Debug overrides are only honored outside production.
    if (!production) merged = mergeDeep(merged, debug);
    this.validate(merged);
    this.resolved = deepFreeze(merged);
    return this.resolved;
  }

  validate(config) {
    for (const [section, sectionSchema] of Object.entries(this.schema)) {
      const node = config[section];
      if (!node || typeof node !== 'object' || Array.isArray(node)) {
        config[section] = mergeDeep(this.defaults[section] ?? {}, {});
        continue;
      }
      validateNode(node, sectionSchema, section, this.defaults[section] ?? {});
    }
    // Cross-field invariants.
    const pipes = config.pipes;
    if (pipes && pipes.minimumGap > pipes.initialGap) {
      logger.warn('ConfigManager', 'minimumGap exceeds initialGap; clamping', {});
      pipes.minimumGap = pipes.initialGap;
    }
    const engine = config.engine;
    if (engine && (!isNumeric(engine.fixedStep) || engine.fixedStep <= 0 || engine.fixedStep >= 1)) {
      throw new Error('ConfigManager: fixedStep out of supported boundaries');
    }
    const renderer = config.renderer;
    if (renderer && (!isNumeric(renderer.maxPixelRatio) || renderer.maxPixelRatio < 1)) {
      throw new Error('ConfigManager: maxPixelRatio out of supported boundaries');
    }
  }

  get(path) {
    if (!this.resolved) throw new Error('ConfigManager: config not loaded');
    return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), this.resolved);
  }

  snapshot() {
    if (!this.resolved) throw new Error('ConfigManager: config not loaded');
    return this.resolved;
  }
}

