# Flappy Bird Ultimate+

Production-ready Flappy Bird clone — HTML5 Canvas, vanilla ES modules, Vite, Firebase (optional), Capacitor.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

## Test

```bash
npm test
```

## Build & preview

```bash
npm run build
npm run preview
```

## Deploy Android (Capacitor)

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android   # build APK in Android Studio
```

## Deploy iOS (macOS only)

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

## Firebase setup (optional — game runs offline without it)

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Anonymous**.
3. Enable **Firestore** in production mode (rules come later).
4. Create `.env` in project root:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Restart `npm run dev`.

Without credentials the game runs fully offline (local save, local leaderboard).

## Architecture

- `src/core` — Engine (fixed-step loop), GameClock, EventBus, StateManager, Random, ObjectPool, Camera, Renderer, InputManager.
- `src/entities` — Bird, PipePair, Ground, BackgroundLayer.
- `src/systems` — Physics, Collision, Pipe, Score, Particle.
- `src/states` — BOOT / MENU / PLAYING / PAUSED / GAME_OVER / SHOP / SETTINGS / LEADERBOARD / ERROR.
- `src/managers` — Save, Settings, Skin, Audio.
- `src/firebase` — fail-soft online services.

## Adding things

- **State**: create `src/states/XState.js`, register in `Bootstrap.js`, add to transition map in `StateManager.js`.
- **Skin**: add entry to `SKINS` in `managers/SkinManager.js`.
- **Asset group**: add to `assets/manifest.js`, load via `AssetManager.loadGroup`.
- **Save field**: extend `storage/SaveSchema.js`; old saves are sanitized on load.