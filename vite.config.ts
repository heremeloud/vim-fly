import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';

// The version is 0.1.<number of commits>, so it goes up with every push without anyone editing it.
let commits = '0';
try {
  commits = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch {
  // not a git checkout (for example a source download): fall back to 0
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(`0.1.${commits}`) },
  build: {
    // Phaser is large; one chunk is fine for a static game.
    chunkSizeWarningLimit: 2000,
  },
});
