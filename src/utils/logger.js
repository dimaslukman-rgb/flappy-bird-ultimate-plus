// Minimal logger with a mute switch enabled by production builds.
const LEVELS = ['debug', 'info', 'warn', 'error'];
let minLevel = 1; // info by default; config may raise/lower.

export const logger = {
  setLevel(level) {
    const idx = LEVELS.indexOf(level);
    if (idx >= 0) minLevel = idx;
  },
  debug(module, message, data) {
    if (minLevel <= 0) console.debug(`[${module}]`, message, data ?? '');
  },
  info(module, message, data) {
    if (minLevel <= 1) console.info(`[${module}]`, message, data ?? '');
  },
  warn(module, message, data) {
    if (minLevel <= 2) console.warn(`[${module}]`, message, data ?? '');
  },
  error(module, message, data) {
    if (minLevel <= 3) console.error(`[${module}]`, message, data ?? '');
  },
};