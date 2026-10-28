import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Semantic version: major.minor come from package.json (change them by hand for a bigger release), and the
// patch is the number of commits, so it goes up with every push without anyone editing it.
const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };
const [major, minor] = version.split('.');
let commits = '0';
try {
  commits = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch {
  // not a git checkout (for example a source download): fall back to 0
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(`${major}.${minor}.${commits}`) },
  build: {
    // Phaser is large; one chunk is fine for a static game.
    chunkSizeWarningLimit: 2000,
  },
});
