import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Phaser is large; one chunk is fine for a static game.
    chunkSizeWarningLimit: 2000,
  },
});
