// Fail fast on programmer errors; production still throws a typed error.
export class ProgrammerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProgrammerError';
  }
}

export function invariant(condition, message) {
  if (!condition) {
    throw new ProgrammerError(`Invariant violated: ${message}`);
  }
}