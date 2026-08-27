// Web Audio SFX/music. Fail-soft: missing audio must never block gameplay.
export class AudioManager {
  constructor({ maxSfxVoices = 8, eventBus } = {}) {
    this.maxSfxVoices = maxSfxVoices;
    this.eventBus = eventBus;
    this.context = null;
    this.buffers = new Map();
    this.settings = { muted: false, sfxVolume: 0.8, musicVolume: 0.6 };
    this.activeVoices = 0;
  }

  unlock() {
    return new Promise((resolve) => {
      try {
        if (!this.context) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return resolve();
          this.context = new AC();
        }
        if (this.context.state === 'suspended') {
          this.context.resume().then(() => {
            this.eventBus?.emit('audio:unlocked', {});
            resolve();
          });
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  }

  playSfx(id, options = {}) {
    if (this.settings.muted || !this.context) return null;
    if (this.activeVoices >= this.maxSfxVoices) return null;
    this.activeVoices++;
    // Synthesize a short blip; real samples replace this via AssetManager later.
    try {
      const ctx = this.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = options.freq ?? 440;
      osc.type = options.type ?? 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(this.settings.sfxVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      const done = () => this.activeVoices--;
      osc.onended = done;
      setTimeout(done, 200);
      return { id, stop: () => osc.stop() };
    } catch {
      this.activeVoices--;
      return null;
    }
  }

  async playMusic(id = 'menu') {
    this.unlock();
    // No music loop implemented yet; return null handle. See ponytail note.
  }

  async stopMusic(_fadeSeconds = 0) {
    // No-op until a music stream is wired.
  }

  setMuted(value) {
    this.settings.muted = value;
  }

  setVolume(kind, value) {
    if (kind === 'sfx') this.settings.sfxVolume = value;
    if (kind === 'music') this.settings.musicVolume = value;
  }
}