<div align="center">

# 🐦 Flappy Bird Ultimate+

**HTML5 Canvas · Vanilla ES Modules · Vite · Capacitor · Firebase**

[![Build Android APK](https://github.com/dimaslukman-rgb/flappy-bird-ultimate-plus/actions/workflows/android-build.yml/badge.svg)](https://github.com/dimaslukman-rgb/flappy-bird-ultimate-plus/actions/workflows/android-build.yml)
[![Deploy Pages](https://github.com/dimaslukman-rgb/flappy-bird-ultimate-plus/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/dimaslukman-rgb/flappy-bird-ultimate-plus/actions/workflows/deploy-pages.yml)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20iOS-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

> Flappy Bird clone production-ready — berjalan di browser, bisa di-install sebagai PWA, dan bisa di-export jadi APK Android via Capacitor. Zero dependency runtime di luar Firebase (opsional).

### 🌐 [▶ Main Sekarang — Live Demo](https://dimaslukman-rgb.github.io/flappy-bird-ultimate-plus/)

> Tap / klik / spasi untuk terbang. Works di browser mobile & desktop.

</div>

---

## ✨ Fitur

| Fitur | Status |
|---|---|
| 🎮 Game loop fixed-step 60 FPS | ✅ |
| 🖼️ HTML5 Canvas Renderer | ✅ |
| 🐦 5 skin burung (Common → Legendary) | ✅ |
| 🏪 Shop + sistem unlock skin | ✅ |
| 🏆 Leaderboard lokal (best score, games played) | ✅ |
| ⚙️ Settings (audio, reduced motion) | ✅ |
| 💾 Auto-save + migrasi save antar versi | ✅ |
| 💥 Particle system (low / medium / high) | ✅ |
| 📱 PWA (installable, offline support) | ✅ |
| 🤖 Build APK Android via GitHub Actions | ✅ |
| 🔥 Firebase (Auth anonymous + Firestore) | ⚙️ Opsional |
| 🌐 Global leaderboard | 🔜 Part 2 |
| ☁️ Cloud save | 🔜 Part 4 |
| 🛡️ Anti-cheat server-side | 🔜 Part 7 |

---

## 🐦 Skin Burung

| ID | Nama | Rarity | Warna |
|---|---|---|---|
| `classic` | Classic | Common | 🟡 |
| `retro` | Retro | Common | 🟠 |
| `neon` | Neon | Rare | 🩵 |
| `golden` | Golden | Epic | 💛 |
| `dragon` | Dragon | Legendary | 🟣 |

---

## 🚀 Quickstart

```bash
# Clone
git clone https://github.com/dimaslukman-rgb/flappy-bird-ultimate-plus.git
cd flappy-bird-ultimate-plus

# Install
npm install

# Jalankan lokal
npm run dev        # http://localhost:5173
```

---

## 📦 Scripts

```bash
npm run dev        # Dev server (HMR)
npm run build      # Production build → dist/
npm run preview    # Preview build
npm test           # Vitest unit tests
npm run lint       # ESLint
npm run format     # Prettier
```

---

## 📱 Build APK Android

### Otomatis (GitHub Actions — Gratis)

Setiap push ke `main` → APK build otomatis.

1. Buka tab **Actions** di repo
2. Pilih run terbaru **Build Android APK**
3. Scroll ke bawah → **Artifacts** → download `flappy-ultimate-plus-debug`
4. Extract zip → install `app-debug.apk` di HP Android

> Aktifkan **"Install from unknown sources"** di pengaturan Android sebelum install.

### Manual (butuh Android Studio + JDK 17)

```bash
npm run build
npx cap sync android
npx cap open android   # Build APK di Android Studio
```

---

## 🍎 Build iOS (macOS only)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios       # Build di Xcode
```

---

## 🔥 Firebase Setup (Opsional)

Game berjalan penuh **offline tanpa Firebase**. Untuk fitur online:

1. Buat project di [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Anonymous**
3. Enable **Firestore** (production mode)
4. Buat file `.env` di root project:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Restart `npm run dev`

> Tanpa `.env`, game otomatis masuk **offline mode** — semua fitur gameplay tetap jalan normal.

---

## 🏗️ Arsitektur

```
src/
├── app/            # Bootstrap, AppContext
├── core/           # Engine (fixed-step), GameClock, EventBus,
│                   # StateManager, Renderer, InputManager,
│                   # Camera, ObjectPool, Random
├── entities/       # Bird, PipePair, Ground, BackgroundLayer
├── systems/        # Physics, Collision, Pipe, Score, Particle
├── states/         # BOOT → MENU → PLAYING → PAUSED
│                   # → GAME_OVER → SHOP → SETTINGS
│                   # → LEADERBOARD → ERROR
├── managers/       # Save, Settings, Skin, Audio
├── firebase/       # Fail-soft online services
├── storage/        # LocalStorage adapter, schema, migrasi
├── config/         # Defaults, schema, ConfigManager
└── utils/          # Logger, math, invariant, deepFreeze
```

### State Machine

```
BOOT ──► MENU ──► PLAYING ──► PAUSED
                    │              │
                    ▼              ▼
               GAME_OVER ◄────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
        SHOP   SETTINGS  LEADERBOARD
```

### Game Loop (Fixed-step 60 FPS)

```
frame(dt)
  └─ clamp dt → maxFrameDelta (0.25s)
       └─ accumulate → tick per fixedStep (1/60s)
            └─ Physics → Collision → Pipe → Score → Particle
                 └─ Renderer.flush()
```

---

## ⚙️ Konfigurasi Gameplay

Semua konstanta ada di `src/config/defaults.js`:

| Parameter | Default | Keterangan |
|---|---|---|
| `engine.fixedStep` | `1/60` s | Simulasi per tick |
| `bird.gravity` | `1550` px/s² | Tarikan gravitasi |
| `bird.flapImpulse` | `-470` px/s | Kecepatan ke atas saat tap |
| `bird.maxFallSpeed` | `760` px/s | Kecepatan jatuh maksimal |
| `pipes.initialGap` | `210` px | Celah awal antar pipa |
| `pipes.minimumGap` | `150` px | Celah terkecil (makin susah) |
| `pipes.speed` | `170` px/s | Kecepatan scroll |
| `pipes.spawnInterval` | `1.45` s | Interval kemunculan pipa |

---

## 🧪 Testing

```bash
npm test
```

Unit tests dengan **Vitest** di `tests/unit/`:

- `CollisionSystem` — deteksi tabrakan
- `EventBus` — pub/sub events
- `MenuState` — transisi state
- `Random` — seeded RNG
- `SaveManager` — save/load + migrasi
- `StateManager` — mesin state

---

## 🗂️ Extend Proyek

### Tambah State Baru
1. Buat `src/states/XState.js`
2. Register di `Bootstrap.js`
3. Tambah ke transition map di `StateManager.js`

### Tambah Skin
```js
// src/managers/SkinManager.js
export const SKINS = Object.freeze({
  // ... existing skins
  myskin: { id: 'myskin', name: 'My Skin', rarity: 'rare', color: '#ff0000' },
});
```

### Tambah Save Field
1. Extend `src/storage/SaveSchema.js`
2. Tambah migrasi di `src/storage/SaveMigrations.js`
3. Save lama di-sanitize otomatis saat load

---

## 📋 Tech Stack

| Layer | Tech |
|---|---|
| Game engine | Vanilla JS (ES Modules) |
| Renderer | HTML5 Canvas 2D |
| Bundler | Vite 5 |
| Testing | Vitest |
| Mobile wrapper | Capacitor 6 |
| Backend (opsional) | Firebase 10 |
| CI/CD | GitHub Actions |
| Linting | ESLint 9 + Prettier 3 |

---

## 📄 License

MIT © [dimaslukman-rgb](https://github.com/dimaslukman-rgb)
