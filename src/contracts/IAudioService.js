// Audio service contract. Missing audio must fail soft (never block gameplay).
// Methods: unlock, playSfx(id, options), playMusic(id), stopMusic(fade), setMuted, setVolume.
export const IAudioServiceContract = Object.freeze({
  methods: ['unlock', 'playSfx', 'playMusic', 'stopMusic', 'setMuted', 'setVolume'],
});