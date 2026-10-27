import Phaser from 'phaser';
import { SCENES } from '../core/constants';

/** Preloads assets (none yet: the base uses placeholder shapes) then opens Home. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    // Real art/audio loads here later. See src/assets/README.md.
  }

  create(): void {
    this.scene.start(SCENES.home);
  }
}
