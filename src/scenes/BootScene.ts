import Phaser from 'phaser';
import { SCENES } from '../core/constants';
import { applyRenderScale } from '../core/render';
import { ZONES, zoneTextureKey, type Zone } from '../core/zones';
import { ZONE_ICONS } from '../core/zoneIcons';
import { itemTextureKey } from '../items/itemSprite';

// Complete 32x32 flat-color item set with outlines (v6, built from v5 by scripts/make-items-v6.py).
const ITEM_PNGS = import.meta.glob('../assets/items-v6/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const VIMMY_PNGS = import.meta.glob('../assets/vimmy-v1/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

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
  }

  create(): void {
    // Pixel art stays crisp (no smoothing) without turning smoothing off for text, which shares the canvas.
    for (const key of this.textures.getTextureKeys()) {
      if (key.startsWith('item-') || key.startsWith('vimmy-')) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    for (const zone of ZONES) this.makeBackdrop(zone);
    this.scene.start(SCENES.home);
  }

  /** A 480x200 tile that repeats vertically: flat color, a seam line, and two staggered rows of the location's emoji. */
  private makeBackdrop(zone: Zone): void {
    const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;
    const tex = this.textures.createCanvas(zoneTextureKey(zone), TILE_W, TILE_H)!;
    const ctx = tex.getContext();
    ctx.fillStyle = hex(zone.base);
    ctx.fillRect(0, 0, TILE_W, TILE_H);
    ctx.fillStyle = hex(zone.accent);
    ctx.fillRect(0, 0, TILE_W, 4); // tile seam line

    const [upper, lower] = ZONE_ICONS[zone.id];
    ctx.font = `${ICON_SIZE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.6; // soft, so the backdrop stays behind the dog and items
    [70, 230, 390].forEach((x, i) => ctx.fillText(upper[i], x, 56));
    [150, 310, 430].forEach((x, i) => ctx.fillText(lower[i], x, 142));
    tex.refresh();
  }
}
