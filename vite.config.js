import { defineConfig } from 'vite';

// Vite dev server + build config for the PWA game.
export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
    sourcemap: false,
    // Output ES modules directly; no legacy bundle needed for modern targets.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['firebase/app'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});