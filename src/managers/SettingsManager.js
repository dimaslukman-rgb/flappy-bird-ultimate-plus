// Thin wrapper over save.settings; emits settings:changed on mutation.
export class SettingsManager {
  constructor({ saveManager, eventBus }) {
    this.saveManager = saveManager;
    this.eventBus = eventBus;
  }

  get() {
    return this.saveManager.getSnapshot()?.settings ?? {};
  }

  async set(patch) {
    await this.saveManager.patch((save) => {
      Object.assign(save.settings, patch);
    });
    this.eventBus?.emit('settings:changed', this.get());
    return this.get();
  }

  get muted() {
    return this.get().muted;
  }

  get quality() {
    return this.get().quality;
  }
}