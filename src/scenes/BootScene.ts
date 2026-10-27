import Phaser from 'phaser';
import { SCENES } from '../core/constants';

/** Preloads assets then opens Home. Generates the placeholder background texture. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    // Real art/audio loads here later. See src/assets/README.md.
  }

  create(): void {
    // A 480x200 tile with faint lines so upward motion is visible.
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xfff3e0, 1).fillRect(0, 0, 480, 200);
    g.fillStyle(0xffe0b2, 1).fillRect(0, 0, 480, 4);
    g.fillStyle(0xffecb3, 1).fillRect(60, 90, 90, 14).fillRect(300, 150, 120, 14);
    g.generateTexture('bg', 480, 200);
    g.destroy();

    this.scene.start(SCENES.home);
  }
}
