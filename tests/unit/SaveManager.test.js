import { describe, it, expect } from 'vitest';
import { SaveManager } from '../../src/managers/SaveManager.js';
import { MemoryStorageAdapter } from '../../src/storage/MemoryStorageAdapter.js';
import { SAVE_KEY, SAVE_BACKUP_KEY } from '../../src/storage/SaveSchema.js';

describe('SaveManager', () => {
  it('creates a fresh save when none exists', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    const snap = await sm.load();
    expect(snap.schemaVersion).toBe(1);
    expect(snap.progression.bestScore).toBe(0);
    expect(snap.inventory.ownedSkins).toContain('classic');
  });

  it('recovers from malformed primary using backup', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    await sm.load();
    // Corrupt primary, keep backup.
    await adapter.write(SAVE_KEY, '{invalid json');
    const snap = await sm.load();
    expect(snap.schemaVersion).toBe(1);
  });

  it('patch increments revision and persists', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    await sm.load();
    await sm.patch((s) => {
      s.progression.bestScore = 42;
    });
    expect(sm.getSnapshot().progression.bestScore).toBe(42);
    expect(sm.getSnapshot().revision).toBeGreaterThan(0);
    const raw = await adapter.read(SAVE_KEY);
    expect(JSON.parse(raw).progression.bestScore).toBe(42);
  });

  it('backup key is maintained after commit', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    await sm.load();
    await sm.patch((s) => {
      s.progression.coins = 10;
    });
    const backup = await adapter.read(SAVE_BACKUP_KEY);
    expect(backup).not.toBeNull();
  });

  it('sanitizes malformed inventory fields without crashing', async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.write(SAVE_KEY, JSON.stringify({
      schemaVersion: 1,
      inventory: { ownedSkins: null, selectedSkin: 42 },
    }));
    const sm = new SaveManager({ adapter });
    const snap = await sm.load();
    expect(snap.inventory.ownedSkins).toEqual(['classic']);
    expect(snap.inventory.selectedSkin).toBe('classic');
  });
});