import Phaser from 'phaser';
import { SCENES } from '../core/constants';
import { applyRenderScale } from '../core/render';
import { ZONES, zoneTextureKey, type Zone } from '../core/zones';
import { itemTextureKey } from '../items/itemSprite';

// The story-specific v2 sprite set is hand-authored on exact 16x16 grids.
const ITEM_PNGS = import.meta.glob(['../assets/items-v2/*.png', '!../assets/items-v2/_preview.png'], { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const ZONE_PNGS = import.meta.glob(['../assets/zones-v2/*.png', '!../assets/zones-v2/_preview.png'], { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const TILE_W = 480;
const TILE_H = 200;

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
      if (!id.startsWith('_')) this.load.image(itemTextureKey(id), url);
    }
    for (const [path, url] of Object.entries(ZONE_PNGS)) {
      const id = path.split('/').pop()!.replace('.png', '');
      if (!id.startsWith('_')) this.load.image(`bg-${id}`, url);
    }
  }

  create(): void {
    // Pixel art stays crisp (no smoothing) without turning smoothing off for text, which shares the canvas.
    for (const key of this.textures.getTextureKeys()) {
      if (key.startsWith('item-') || key.startsWith('bg-')) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    // Keep the old procedural renderer as a safe fallback if a zone PNG is absent.
    for (const zone of ZONES) if (!this.textures.exists(zoneTextureKey(zone))) this.makeBackdrop(zone);
    this.scene.start(SCENES.home);
  }

  /** A 480x200 tile that repeats vertically; faint shapes make upward motion visible. */
  private makeBackdrop(zone: Zone): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(zone.base, 1).fillRect(0, 0, TILE_W, TILE_H);
    g.fillStyle(zone.accent, 1).fillRect(0, 0, TILE_W, 4); // tile seam line

    g.fillStyle(zone.accent, 1);
    switch (zone.id) {
      case 'ruralRoad': // golden rice stalks and a dirt road edge
        for (let x = 20; x < TILE_W; x += 44) g.fillRect(x, 60 + ((x * 7) % 60), 4, 40);
        g.fillStyle(0xbcaaa4, 1).fillRect(0, 0, 14, TILE_H).fillRect(TILE_W - 14, 0, 14, TILE_H);
        break;
      case 'bakery': // shelves with loaves
        g.fillRect(40, 70, 160, 8).fillRect(280, 150, 160, 8);
        g.fillStyle(0xffb74d, 1).fillEllipse(70, 62, 30, 16).fillEllipse(120, 62, 30, 16).fillEllipse(310, 142, 30, 16).fillEllipse(370, 142, 30, 16);
        break;
      case 'cafes': // coffee cups
        g.fillRect(60, 90, 40, 34).fillRect(320, 40, 40, 34).fillCircle(112, 106, 10).fillCircle(372, 56, 10);
        break;
      case 'mall': // popcorn dots and shop frames
        g.fillRect(40, 20, 90, 60).fillRect(340, 120, 90, 60);
        g.fillStyle(0xffee58, 1);
        for (let i = 0; i < 10; i++) g.fillCircle(180 + ((i * 53) % 120), 60 + ((i * 37) % 110), 8);
        break;
      case 'lawOffice': // window grid
        for (let x = 40; x < TILE_W; x += 110) g.fillRect(x, 40, 70, 50).fillRect(x, 120, 70, 50);
        break;
      case 'gym': // dumbbells
        g.fillRect(70, 100, 90, 8).fillRect(60, 86, 14, 36).fillRect(156, 86, 14, 36);
        g.fillRect(310, 40, 90, 8).fillRect(300, 26, 14, 36).fillRect(396, 26, 14, 36);
        break;
      case 'courtroom': // wooden pillars and a gavel block
        g.fillRect(50, 0, 30, TILE_H).fillRect(400, 0, 30, TILE_H).fillRect(200, 120, 90, 30);
        break;
      case 'beach': // waves
        for (let y = 30; y < TILE_H; y += 60) g.fillEllipse(110, y, 160, 14).fillEllipse(340, y + 30, 200, 14);
        break;
      case 'residence': // gate bars
        for (let x = 30; x < TILE_W; x += 40) g.fillRect(x, 0, 6, TILE_H);
        g.fillRect(0, 90, TILE_W, 8);
        break;
      case 'bakeLove': // hearts
        for (const [x, y] of [[90, 60], [330, 130], [420, 40]]) {
          g.fillCircle(x - 9, y, 11).fillCircle(x + 9, y, 11).fillTriangle(x - 20, y + 4, x + 20, y + 4, x, y + 28);
        }
        break;
    }

    g.generateTexture(zoneTextureKey(zone), TILE_W, TILE_H);
    // Flat shapes stay crisp (hard edges) when the camera zooms them up, instead of going soft.
    this.textures.get(zoneTextureKey(zone)).setFilter(Phaser.Textures.FilterMode.NEAREST);
    g.destroy();
  }
}
