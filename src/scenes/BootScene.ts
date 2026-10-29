import Phaser from 'phaser';
import { SCENES } from '../core/constants';
import { devFlag } from '../core/devTools';
import { applyRenderScale } from '../core/render';
import { ZONES, zoneTextureKey, type Zone } from '../core/zones';
import { ZONE_ICONS } from '../core/zoneIcons';
import { emojiTextureKey } from '../core/emojiFile';
import { itemTextureKey } from '../items/itemSprite';

// Complete 32x32 flat-color item set with outlines (v6, built from v5 by scripts/make-items-v6.py).
const ITEM_PNGS = import.meta.glob('../assets/items-v6/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const VIMMY_PNGS = import.meta.glob('../assets/vimmy-v1/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// Optional hand-made backdrop tiles named <zoneId>.png; zones without one keep the emoji placeholder.
const BACKDROP_PNGS = import.meta.glob('../assets/backdrops/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// Google (Noto) emoji images, so the backdrops look the same on every device (see scripts/copy-emoji.mjs).
const EMOJI_PNGS = import.meta.glob('../assets/emoji/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const TILE_W = 480;
const TILE_H = 200;
const ICON_SIZE = 44;

/** Preloads assets then opens Home. Generates the placeholder backdrop textures, one per zone. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  init(): void {
    // Zoom every scene's camera when it is created (Boot itself draws nothing).
    for (const scene of this.game.scene.getScenes(false)) {
      scene.events.on(Phaser.Scenes.Events.CREATE, () => applyRenderScale(scene));
    }
  }

  preload(): void {
    for (const [path, url] of Object.entries(ITEM_PNGS)) {
      const id = path.split('/').pop()!.replace('.png', '');
      this.load.image(itemTextureKey(id), url);
    }
    for (const [path, url] of Object.entries(VIMMY_PNGS)) {
      const id = path.split('/').pop()!.replace('.png', '');
      this.load.image(`vimmy-${id}`, url);
    }
    for (const [path, url] of Object.entries(EMOJI_PNGS)) {
      this.load.image(`emoji-${path.split('/').pop()!.replace('.png', '')}`, url);
    }
    for (const zone of ZONES) {
      const url = Object.entries(BACKDROP_PNGS).find(([path]) => path.endsWith(`/${zone.id}.png`))?.[1];
      if (url) this.load.image(zoneTextureKey(zone), url);
    }
  }

  create(): void {
    // Pixel art stays crisp (no smoothing) without turning smoothing off for text, which shares the canvas.
    for (const key of this.textures.getTextureKeys()) {
      if (key.startsWith('item-') || key.startsWith('vimmy-')) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    for (const zone of ZONES) if (!this.textures.exists(zoneTextureKey(zone))) this.makeBackdrop(zone);
    this.scene.start(devFlag('sfx') ? SCENES.sfx : SCENES.home);
  }

  /** A 480x200 tile that repeats vertically: flat color, a seam line, and seven of the location's emoji (three above, four below). */
  private makeBackdrop(zone: Zone): void {
    const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;
    const tex = this.textures.createCanvas(zoneTextureKey(zone), TILE_W, TILE_H)!;
    const ctx = tex.getContext();
    ctx.fillStyle = hex(zone.base);
    ctx.fillRect(0, 0, TILE_W, TILE_H);
    ctx.globalAlpha = 0.4; // faint, so the seam doesn't strobe as the tile scrolls by
    ctx.fillStyle = hex(zone.accent);
    ctx.fillRect(0, 0, TILE_W, 4); // tile seam line

    const [upper, lower] = ZONE_ICONS[zone.id];
    ctx.globalAlpha = 0.4; // faint, so the backdrop stays behind the dog and items and doesn't flicker while scrolling
    const draw = (emoji: string, x: number, y: number): void => {
      const key = emojiTextureKey(emoji);
      if (!this.textures.exists(key)) return;
      ctx.drawImage(this.textures.get(key).getSourceImage() as CanvasImageSource, x - ICON_SIZE / 2, y - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
    };
    const row = (icons: string[], y: number): void => {
      const gap = TILE_W / icons.length;
      icons.forEach((emoji, i) => draw(emoji, gap * (i + 0.5), y));
    };
    row(upper, 56); // three
    row(lower, 142); // four
    tex.refresh();
  }
}
