import Phaser from 'phaser';
import '@fontsource/noto-sans-thai/thai-400.css';
import '@fontsource/noto-sans-thai/thai-700.css';
import { GAME_WIDTH, GAME_HEIGHT } from './core/constants';
import { RENDER_SCALE, installTextResolution } from './core/render';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { MenuScene } from './scenes/MenuScene';
import { ComingSoonScene } from './scenes/ComingSoonScene';
import { OrdersScene } from './scenes/OrdersScene';
import { PromosScene } from './scenes/PromosScene';
import { GameScene } from './scenes/GameScene';
import { ReceiptScene } from './scenes/ReceiptScene';

installTextResolution();

function startGame(): void {
  // The canvas is RENDER_SCALE times the layout size for sharpness; see src/core/render.ts.
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH * RENDER_SCALE,
    height: GAME_HEIGHT * RENDER_SCALE,
    backgroundColor: '#fff3e0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, HomeScene, MenuScene, OrdersScene, PromosScene, ComingSoonScene, GameScene, ReceiptScene],
  });
  // Dev only: lets you poke at the game from the browser console (window.__game).
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
}

// Text on the canvas is drawn once, so the Thai font must be ready before the first scene draws it.
// Don't wait forever: if the font is slow or fails, start anyway with the device font.
const THAI_FONTS = ['400 16px "Noto Sans Thai"', '700 16px "Noto Sans Thai"'];
const fontsReady = Promise.all(THAI_FONTS.map((f) => document.fonts.load(f, 'ก')));
const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
Promise.race([fontsReady, timeout]).then(startGame, startGame);
