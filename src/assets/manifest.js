// Asset manifest. Git-tracked source URLs; content hash appended at build time.
// Groups control loading priority: boot-critical -> menu-critical -> gameplay-critical -> deferred.
export const ASSET_MANIFEST = Object.freeze({
  groups: {
    'boot-critical': ['ui.logo', 'ui.loading'],
    'menu-critical': ['bg.menu', 'bird.preview'],
    'gameplay-critical': ['bird.classic.sheet', 'pipe.classic', 'ground.classic', 'bg.far', 'bg.near'],
    deferred: ['bird.neon.sheet', 'bird.golden.sheet', 'bird.retro.sheet', 'bird.dragon.sheet'],
  },
  entries: {
    'ui.logo': { type: 'image', url: '/assets/sprites/ui/logo.svg', group: 'boot-critical' },
    'ui.loading': { type: 'image', url: '/assets/sprites/ui/loading.svg', group: 'boot-critical' },
    'bg.menu': { type: 'image', url: '/assets/backgrounds/neon/menu.svg', group: 'menu-critical' },
    'bird.preview': { type: 'image', url: '/assets/sprites/birds/classic.svg', group: 'menu-critical' },
    'bird.classic.sheet': { type: 'image', url: '/assets/sprites/birds/classic.svg', group: 'gameplay-critical' },
    'pipe.classic': { type: 'image', url: '/assets/sprites/pipes/classic.svg', group: 'gameplay-critical' },
    'ground.classic': { type: 'image', url: '/assets/sprites/ui/ground.svg', group: 'gameplay-critical' },
    'bg.far': { type: 'image', url: '/assets/backgrounds/classic/far.svg', group: 'gameplay-critical' },
    'bg.near': { type: 'image', url: '/assets/backgrounds/classic/near.svg', group: 'gameplay-critical' },
  },
});