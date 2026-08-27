// Entry point: mount canvas, inject styles, bootstrap the game.
import './styles/reset.css';
import './styles/tokens.css';
import './styles/app.css';
import { bootstrap } from './app/Bootstrap.js';

async function main() {
  const appEl = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Flappy Bird Ultimate+ game canvas');
  appEl.appendChild(canvas);

  try {
    await bootstrap(canvas);
    // Register service worker for PWA (best-effort, non-blocking).
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  } catch (err) {
    console.error('[main] bootstrap failed', err);
    appEl.textContent = 'Failed to start: ' + err.message;
  }
}

main();