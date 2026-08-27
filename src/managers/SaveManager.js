// Coordinates serialized profile persistence, migrations, backup, and recovery.
import { SAVE_KEY, SAVE_BACKUP_KEY, sanitizeSave, SCHEMA_VERSION } from '../storage/SaveSchema.js';
import { migrate } from '../storage/SaveMigrations.js';
import { logger } from '../utils/logger.js';

export class SaveManager {
  constructor({ adapter, eventBus, now = () => new Date().toISOString() } = {}) {
    if (!adapter) throw new Error('SaveManager: adapter is required');
    this.adapter = adapter;
    this.eventBus = eventBus;
    this.now = now; // injectable clock for tests
    this.schemaVersion = SCHEMA_VERSION;
    this.snapshot = null;
    this.dirty = false;
  }

  async load() {
    let raw = null;
    let recovered = false;
    try {
      const primary = await this.adapter.read(SAVE_KEY);
      raw = primary ? JSON.parse(primary) : null;
    } catch {
      raw = null;
    }

    if (!raw || typeof raw !== 'object' || !raw.schemaVersion) {
      // Try backup.
      try {
        const backup = await this.adapter.read(SAVE_BACKUP_KEY);
        raw = backup ? JSON.parse(backup) : null;
        if (raw && raw.schemaVersion) recovered = true;
      } catch {
        raw = null;
      }
    }

    if (!raw || typeof raw !== 'object' || !raw.schemaVersion) {
      this.snapshot = sanitizeSave(null);
      this.eventBus?.emit('save:loaded', { recovered: false, fresh: true });
      await this.save();
      return this.snapshot;
    }

    const migrated = migrate(raw);
    this.snapshot = sanitizeSave(migrated);
    this.dirty = false;
    this.eventBus?.emit('save:loaded', { recovered, fresh: false });
    return this.snapshot;
  }

  // Apply a patch (immutable merge) and commit to storage.
  async patch(mutator) {
    if (!this.snapshot) await this.load();
    const next = structuredCloneSafe(this.snapshot);
    mutator(next);
    next.revision = (next.revision || 0) + 1;
    next.updatedAt = this.now();
    this.snapshot = sanitizeSave(next);
    this.dirty = true;
    await this.commit();
    return this.snapshot;
  }

  async save() {
    if (!this.snapshot) this.snapshot = sanitizeSave(null);
    await this.commit();
    return this.snapshot;
  }

  async commit() {
    const serialized = JSON.stringify(this.snapshot);
    if (serialized.length > 512 * 1024) {
      throw new Error('SaveManager: serialized save exceeds size limit');
    }
    // Backup current valid primary (if any) before overwrite.
    const existing = await this.adapter.read(SAVE_KEY);
    if (existing) {
      try {
        await this.adapter.write(SAVE_BACKUP_KEY, existing);
      } catch {
        logger.warn('SaveManager', 'backup write failed');
      }
    }
    await this.adapter.write(SAVE_KEY, serialized);
    this.dirty = false;
    this.eventBus?.emit('save:committed', { revision: this.snapshot.revision });
  }

  async reset() {
    this.snapshot = sanitizeSave(null);
    this.dirty = true;
    await this.commit();
    return this.snapshot;
  }

  exportData() {
    return JSON.stringify(this.snapshot);
  }

  async importData(json) {
    let parsed;
    try {
      parsed = JSON.parse(json);
      if (json.length > 512 * 1024) throw new Error('too large');
    } catch (err) {
      throw new Error(`SaveManager: invalid import (${err.message})`);
    }
    this.snapshot = sanitizeSave(migrate(parsed));
    await this.commit();
    return this.snapshot;
  }

  getSnapshot() {
    return this.snapshot;
  }
}

function structuredCloneSafe(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}