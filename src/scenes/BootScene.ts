import Phaser from 'phaser';
import { SCENES } from '../core/constants';
import { ZONES, zoneTextureKey, type Zone } from '../core/zones';

const TILE_W = 480;
const TILE_H = 200;

/** Preloads assets then opens Home. Generates the placeholder backdrop textures, one per zone. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    // Real art/audio loads here later. See src/assets/README.md.
  }

  create(): void {
    for (const zone of ZONES) this.makeBackdrop(zone);
    this.scene.start(SCENES.home);
  }

  /** A 480x200 tile that repeats vertically; faint shapes make upward motion visible. */
  private makeBackdrop(zone: Zone): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(zone.base, 1).fillRect(0, 0, TILE_W, TILE_H);
    g.fillStyle(zone.accent, 1).fillRect(0, 0, TILE_W, 4); // tile seam line

    switch (zone.id) {
      case 'bakeryStreet':
        g.fillStyle(0xffecb3, 1).fillRect(60, 90, 90, 14).fillRect(300, 150, 120, 14);
        break;
      case 'rooftops':
        g.fillStyle(zone.accent, 1)
          .fillRect(20, 120, 70, 80)
          .fillRect(110, 90, 60, 110)
          .fillRect(330, 130, 80, 70)
          .fillRect(420, 100, 50, 100);
        break;
      case 'courthouse':
        g.fillStyle(zone.accent, 1).fillRect(50, 10, 36, 190).fillRect(222, 10, 36, 190).fillRect(394, 10, 36, 190);
        break;
      case 'clouds':
        g.fillStyle(zone.accent, 0.9)
          .fillEllipse(100, 70, 130, 40)
          .fillEllipse(360, 140, 160, 46)
          .fillEllipse(420, 40, 90, 30);
        break;
    }

    g.generateTexture(zoneTextureKey(zone), TILE_W, TILE_H);
    g.destroy();
  }
}
