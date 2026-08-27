// Sequential save migrations. Each entry upgrades from one version to the next.
// Add new migrations only; never rewrite history.
export const MIGRATIONS = Object.freeze([
  {
    version: 1,
    up(save) {
      // Baseline: current schema version 1 needs no transformation.
      save.schemaVersion = 1;
      return save;
    },
  },
]);

export function migrate(save) {
  let current = save;
  for (const migration of MIGRATIONS) {
    if (current.schemaVersion < migration.version) {
      current = migration.up(current);
    }
  }
  return current;
}