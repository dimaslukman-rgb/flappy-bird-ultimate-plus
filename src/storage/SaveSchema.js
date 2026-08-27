// Save schema constants + default factory. Single source for save shape.
export const SAVE_KEY = 'fbuplus.save';
export const SAVE_BACKUP_KEY = 'fbuplus.save.backup';
export const SCHEMA_VERSION = 1;

export const DEFAULT_PROFILE = {
  playerId: '',
  nickname: 'Player',
  createdAt: '',
};

export function createDefaultSave() {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    updatedAt: '',
    profile: { ...DEFAULT_PROFILE },
    progression: {
      bestScore: 0,
      lifetimeScore: 0,
      gamesPlayed: 0,
      coins: 0,
      gems: 0,
      level: 1,
      xp: 0,
    },
    inventory: {
      ownedSkins: ['classic'],
      selectedSkin: 'classic',
    },
    achievements: { unlocked: {} },
    settings: {
      musicVolume: 0.6,
      sfxVolume: 0.8,
      muted: false,
      vibration: true,
      quality: 'medium',
    },
    sync: {
      cloudRevision: 0,
      pendingOperations: [],
    },
  };
}

// Ensures a loaded object has all optional fields (deep-merge safe defaults).
export function sanitizeSave(raw) {
  const base = createDefaultSave();
  if (!raw || typeof raw !== 'object') return base;

  const out = {
    ...base,
    ...raw,
    profile: { ...base.profile, ...(raw.profile ?? {}) },
    progression: { ...base.progression, ...(raw.progression ?? {}) },
    inventory: { ...base.inventory, ...(raw.inventory ?? {}) },
    achievements: { unlocked: { ...(raw.achievements?.unlocked ?? {}) } },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    sync: { ...base.sync, ...(raw.sync ?? {}) },
  };

  // Enforce numeric ranges.
  const p = out.progression;
  p.bestScore = clampInt(p.bestScore, 0);
  p.lifetimeScore = clampInt(p.lifetimeScore, 0);
  p.gamesPlayed = clampInt(p.gamesPlayed, 0);
  p.coins = clampInt(p.coins, 0);
  p.gems = clampInt(p.gems, 0);

  // Deduplicate owned skins; malformed saves must not block boot.
  const ownedSkins = Array.isArray(out.inventory.ownedSkins) ? out.inventory.ownedSkins : [];
  out.inventory.ownedSkins = [...new Set(ownedSkins.filter((s) => typeof s === 'string'))];
  if (typeof out.inventory.selectedSkin !== 'string') out.inventory.selectedSkin = 'classic';
  if (!out.inventory.ownedSkins.includes(out.inventory.selectedSkin)) {
    out.inventory.ownedSkins.push(out.inventory.selectedSkin);
  }

  return out;
}

function clampInt(v, min) {
  const n = Number.isFinite(v) ? Math.floor(v) : min;
  return n < min ? min : n;
}