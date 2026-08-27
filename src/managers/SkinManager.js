// Skin catalog + ownership/selection. Offline-first; cloud validation comes later.
export const SKINS = Object.freeze({
  classic: { id: 'classic', name: 'Classic', rarity: 'common', color: '#ffcf3d' },
  neon: { id: 'neon', name: 'Neon', rarity: 'rare', color: '#00e5ff' },
  golden: { id: 'golden', name: 'Golden', rarity: 'epic', color: '#ffd700' },
  retro: { id: 'retro', name: 'Retro', rarity: 'common', color: '#ff8c42' },
  dragon: { id: 'dragon', name: 'Dragon', rarity: 'legendary', color: '#7c4dff' },
});

export class SkinManager {
  constructor({ saveManager, eventBus }) {
    this.saveManager = saveManager;
    this.eventBus = eventBus;
  }

  getOwned() {
    return this.saveManager.getSnapshot()?.inventory?.ownedSkins ?? ['classic'];
  }

  getSelected() {
    return this.saveManager.getSnapshot()?.inventory?.selectedSkin ?? 'classic';
  }

  getSelectedSkin() {
    return SKINS[this.getSelected()] ?? SKINS.classic;
  }

  isOwned(id) {
    return this.getOwned().includes(id);
  }

  async select(id) {
    if (!this.isOwned(id)) throw new Error(`SkinManager: skin "${id}" not owned`);
    await this.saveManager.patch((save) => {
      save.inventory.selectedSkin = id;
    });
    this.eventBus?.emit('settings:changed', { selectedSkin: id });
  }

  async unlock(id) {
    await this.saveManager.patch((save) => {
      if (!save.inventory.ownedSkins.includes(id)) save.inventory.ownedSkins.push(id);
    });
  }
}