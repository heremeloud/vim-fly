import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/**
 * How many canvas pixels are drawn per layout unit (1 to 3).
 *
 * All layout uses a 480x800 coordinate space (GAME_WIDTH x GAME_HEIGHT). If the canvas were also
 * 480x800 pixels, it would be stretched to fit the window and look soft on sharp (retina) screens
 * and big windows. Instead the canvas is RENDER_SCALE times bigger and every camera zooms by the same
 * amount, so layout stays the same while shapes and text are drawn at full sharpness.
 *
 * Decided once at start-up from the screen density and the size the game will be shown at.
 * In dev you can force it with ?scale=1 .. ?scale=3 to compare.
 */
export const RENDER_SCALE = computeScale();

function computeScale(): number {
  if (typeof window === 'undefined') return 1;
  if (import.meta.env.DEV) {
    const forced = Number(new URLSearchParams(window.location.search).get('scale'));
    if (forced >= 1 && forced <= 3) return Math.round(forced);
  }
  const density = window.devicePixelRatio || 1;
  const shownAt = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  // The backing canvas must have at least as many pixels as the browser uses to display it.
  // Rounding down makes even a small enlargement (for example 480px to 489px) upscale a
  // 1x canvas and soften the entire UI. Round up so Phaser always renders enough pixels.
  // Phones cap at 2: 3x means a 1440x2400 canvas, too heavy for iPhones (especially in Low Power Mode,
  // which limits them to 30 fps). Tablets and desktops keep up to 3.
  const phone = window.matchMedia('(pointer: coarse)').matches && Math.min(window.screen.width, window.screen.height) < 600;
  return Math.min(phone ? 2 : 3, Math.max(1, Math.ceil(density * shownAt)));
}

/** Make every Text object render at RENDER_SCALE resolution, so text is sharp too. Call once before the game starts. */
export function installTextResolution(): void {
  const factory = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.GameObjects.Text;
  };
  const original = factory.text;
  factory.text = function (this: unknown, x, y, text, style) {
    return original.call(this, x, y, text, { resolution: RENDER_SCALE, ...style });
  };
}

/**
 * Zoom a scene's main camera so the 480x800 layout fills the bigger canvas. Origin 0,0 keeps
 * layout coordinates anchored to the top-left corner. Called for every scene when it is created.
 */
export function applyRenderScale(scene: Phaser.Scene): void {
  scene.cameras.main.setOrigin(0, 0).setZoom(RENDER_SCALE);
}

/** Convert a pointer position in canvas pixels to layout units. */
export function toLayout(canvasPixels: number): number {
  return canvasPixels / RENDER_SCALE;
}
