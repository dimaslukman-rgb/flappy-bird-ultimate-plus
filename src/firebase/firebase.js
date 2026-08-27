// Firebase integration layer. FAIL-SOFT: every call returns a safe offline
// fallback until REAL credentials are injected. Never blocks gameplay.
//
// To go live: create a Firebase project, enable Anonymous Auth + Firestore,
// then set the values in a local .env (Vite exposes VITE_* vars):
//   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
//   VITE_FIREBASE_APP_ID. Import and call initializeFirebase().

let firebaseApp = null;
let configured = false;

export function isConfigured() {
  return configured;
}

export async function initializeFirebase() {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (!cfg.apiKey || !cfg.projectId) {
    configured = false;
    return null; // offline mode
  }
  try {
    const { initializeApp } = await import('firebase/app');
    firebaseApp = initializeApp(cfg);
    configured = true;
    return firebaseApp;
  } catch {
    configured = false;
    return null;
  }
}

// Anonymous login: resolves a fake id offline, or a real uid online.
export async function signInAnonymously() {
  if (!configured) return { uid: 'offline-anonymous', anonymous: true };
  try {
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const auth = getAuth(firebaseApp);
    const cred = await signInAnonymously(auth);
    return { uid: cred.user.uid, anonymous: true };
  } catch {
    return { uid: 'offline-anonymous', anonymous: true };
  }
}

// Leaderboard submit: offline returns an echo, no write.
export async function submitScore(_score) {
  if (!configured) return { ok: true, offline: true };
  // Real Firestore write lands here in Part 2.
  return { ok: true, offline: false };
}

// Global leaderboard fetch: offline returns empty.
export async function fetchGlobalLeaderboard() {
  if (!configured) return { offline: true, entries: [] };
  return { offline: false, entries: [] };
}

// Cloud save push/pull: offline no-op.
export async function pushCloudSave(_snapshot) {
  return { ok: true, offline: !configured };
}

export async function pullCloudSave() {
  return configured ? { ok: true, offline: false, snapshot: null } : { ok: false, offline: true };
}

// Anti-cheat is server-authoritative by design (Part 7). Client only signs.
export function computeClientSignature(score, seed) {
  // Deliberately weak: real validation runs in Cloud Functions.
  return `${score}:${seed}`;
}