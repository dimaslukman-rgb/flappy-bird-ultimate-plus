// Loads/caches assets, reporting progress and distinguishing required vs optional.
// Fail-soft: missing images yield a null handle; render code draws procedural fallback.
import { ASSET_MANIFEST } from './manifest.js';
import { logger } from '../utils/logger.js';

export class AssetManager {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
    this.cache = new Map();
    this.status = new Map();
    this.manifest = ASSET_MANIFEST;
  }

  async preloadCritical() {
    return this.loadGroup('boot-critical').then(() => this.loadGroup('menu-critical'));
  }

  async loadGroup(groupId, onProgress) {
    const ids = this.manifest.groups[groupId] ?? [];
    const total = ids.length;
    let done = 0;
    for (const id of ids) {
      try {
        await this.loadOne(id);
      } catch {
        // Optional/missing asset: cache a null handle, continue.
        this.cache.set(id, null);
      }
      done++;
      const progress = total ? done / total : 1;
      onProgress?.(progress);
      this.eventBus?.emit('assets:progress', { id, group: groupId, progress });
    }
    this.eventBus?.emit('assets:ready', { group: groupId });
  }

  async loadOne(id) {
    if (this.cache.has(id)) return this.cache.get(id);
    const entry = this.manifest.entries[id];
    if (!entry) {
      logger.warn('AssetManager', `unknown asset ${id}`);
      this.cache.set(id, null);
      return null;
    }
    if (entry.type === 'image') {
      const img = await this.loadImage(entry.url);
      this.cache.set(id, img);
      return img;
    }
    this.cache.set(id, null);
    return null;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        // Fail soft: resolve null so game continues with procedural art.
        logger.warn('AssetManager', `image missing ${url}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  getImage(id) {
    return this.cache.get(id) ?? null;
  }

  getAudio(id) {
    return this.cache.get(id) ?? null;
  }

  has(id) {
    return this.cache.has(id) && this.cache.get(id) !== null;
  }

  releaseGroup(groupId) {
    for (const id of this.manifest.groups[groupId] ?? []) {
      this.cache.delete(id);
    }
  }
}