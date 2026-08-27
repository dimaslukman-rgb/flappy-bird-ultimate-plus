// Bootstrap: build services, wire context, register states, start engine.
import { AppContext } from './AppContext.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { EventBus } from '../core/EventBus.js';
import { GameClock } from '../core/GameClock.js';
import { Engine } from '../core/Engine.js';
import { Renderer } from '../core/Renderer.js';
import { Camera } from '../core/Camera.js';
import { InputManager } from '../core/InputManager.js';
import { StateManager } from '../core/StateManager.js';
import { AssetManager } from '../assets/AssetLoader.js';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SettingsManager } from '../managers/SettingsManager.js';
import { SkinManager } from '../managers/SkinManager.js';
import { MemoryStorageAdapter } from '../storage/MemoryStorageAdapter.js';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter.js';

import { BootState } from '../states/BootState.js';
import { MenuState } from '../states/MenuState.js';
import { PlayingState } from '../states/PlayingState.js';
import { PausedState } from '../states/PausedState.js';
import { GameOverState } from '../states/GameOverState.js';
import { ShopState } from '../states/ShopState.js';
import { SettingsState } from '../states/SettingsState.js';
import { LeaderboardState } from '../states/LeaderboardState.js';
import { ErrorState } from '../states/ErrorState.js';

import { EventTypes } from '../events/EventTypes.js';

export async function bootstrap(canvas) {
  const context = new AppContext();

  const configManager = new ConfigManager();
  const config = configManager.load({ production: false });

  const eventBus = new EventBus();
  const clock = new GameClock({ maxFrameDelta: config.engine.maxFrameDelta });
  const renderer = new Renderer({ canvas, config: config.renderer, eventBus });
  const camera = new Camera();
  renderer.setCamera(camera);

  const input = new InputManager({ eventBus });
  input.setCoordinateMapper((x, y) => renderer.screenToLogical(x, y));

  const storageAdapter =
    typeof window !== 'undefined' && window.localStorage
      ? new LocalStorageAdapter()
      : new MemoryStorageAdapter();

  const save = new SaveManager({ adapter: storageAdapter, eventBus });
  const settings = new SettingsManager({ saveManager: save, eventBus });
  const skins = new SkinManager({ saveManager: save, eventBus });
  const assets = new AssetManager({ eventBus });
  const audio = new AudioManager({ maxSfxVoices: config.audio.maxSfxVoices, eventBus });

  const stateManager = new StateManager({ eventBus });

  const engine = new Engine({ clock, stateManager, config: config.engine, eventBus });

  // Fill context.
  Object.assign(context, {
    config: configManager,
    resolvedConfig: config,
    eventBus,
    renderer,
    input,
    assets,
    audio,
    save,
    settings,
    skins,
    stateManager,
    engine,
    camera,
    clock,
  });

  // Register states (pass context explicitly, they store their own ref).
  const boot = new BootState({ context });
  stateManager.register('BOOT', boot);
  stateManager.register('MENU', new MenuState({ context }));
  stateManager.register('PLAYING', new PlayingState({ context }));
  stateManager.register('PAUSED', new PausedState({ context }));
  stateManager.register('GAME_OVER', new GameOverState({ context }));
  stateManager.register('SHOP', new ShopState({ context }));
  stateManager.register('SETTINGS', new SettingsState({ context }));
  stateManager.register('LEADERBOARD', new LeaderboardState({ context }));
  stateManager.register('ERROR', new ErrorState({ context }));
  stateManager.setContext(context);

  // Attach input + resize + visibility auto-pause.
  input.attach(canvas);
  renderer.resize();
  window.addEventListener('resize', () => renderer.resize());
  window.addEventListener('orientationchange', () => setTimeout(() => renderer.resize(), 100));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && stateManager.getCurrentName() === 'PLAYING') {
      stateManager.change('PAUSED', { reason: 'auto' });
    }
  });

  // Forward input actions to the current state every fixed step.
  const originalUpdate = stateManager.update.bind(stateManager);
  stateManager.update = (dt) => {
    const actions = input.consumeAll();
    for (const action of actions) stateManager.handleAction(action);
    originalUpdate(dt);
  };

  // Start the loop.
  await stateManager.change('BOOT');
  engine.start();

  return { context, config };
}