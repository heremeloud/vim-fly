import Phaser from 'phaser';
import '@fontsource/noto-sans-thai/thai-400.css';
import '@fontsource/noto-sans-thai/thai-700.css';
import '@fontsource/sacramento/latin-400.css';
import { initSfx } from './audio/sfx';
import { GAME_WIDTH, GAME_HEIGHT } from './core/constants';
import { RENDER_SCALE, installTextResolution } from './core/render';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { MenuScene } from './scenes/MenuScene';
import { OrdersScene } from './scenes/OrdersScene';
import { PromosScene } from './scenes/PromosScene';
import { GameScene } from './scenes/GameScene';
import { ReceiptScene } from './scenes/ReceiptScene';

installTextResolution();

// iOS Safari ignores user-scalable=no, so block the pinch gesture itself. Without this an accidental
// pinch zooms the page and it can't be shrunk back.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(type, (e) => e.preventDefault());

function startGame(): void {
  // The canvas is RENDER_SCALE times the layout size for sharpness; see src/core/render.ts.
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH * RENDER_SCALE,
    height: GAME_HEIGHT * RENDER_SCALE,
    backgroundColor: '#fff3e0',
    // Phaser normally clamps the first 120 frames after startup/focus to a 60 Hz delta. iOS often supplies rAF at
    // 30 Hz (especially in Low Power Mode), so those frames make the whole game run at half speed for about 4 seconds.
    // GameScene already guards its physics delta against tab-switch spikes, and Phaser resets its clock on resume.
    fps: { smoothStep: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, HomeScene, MenuScene, OrdersScene, PromosScene, GameScene, ReceiptScene],
  });
  initSfx(game);
  // Tapping into the YouTube player (or coming back from a page it opened) takes keyboard focus away from the
  // window, and Phaser stops running the game until the window regains it. Keep the game running in those cases.
  const resume = (): void => {
    game.events.emit(Phaser.Core.Events.FOCUS);
  };
  game.events.on(Phaser.Core.Events.BLUR, () => {
    if (document.activeElement instanceof HTMLIFrameElement) resume();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resume();
  });
  window.addEventListener('pageshow', resume);
  // Dev only: lets you poke at the game from the browser console (window.__game).
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
}

// Text on the canvas is drawn once, so the Thai font must be ready before the first scene draws it.
// Don't wait forever: if the font is slow or fails, start anyway with the device font.
const THAI_FONTS = ['400 16px "Noto Sans Thai"', '700 16px "Noto Sans Thai"'];
const fontsReady = Promise.all([
  ...THAI_FONTS.map((f) => document.fonts.load(f, 'ก')),
  document.fonts.load('400 16px "Sacramento"', 'a'), // receipt tagline
]);
const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
Promise.race([fontsReady, timeout]).then(startGame, startGame);
