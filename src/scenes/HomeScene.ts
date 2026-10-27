import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';

/** Bakery storefront: the home screen. Placeholder until the ordering-app UI is built. */
export class HomeScene extends Phaser.Scene {
  constructor() {
    super(SCENES.home);
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 200, 'Vimmy Fly', { fontSize: '48px', color: '#5d4037' })
      .setOrigin(0.5);

    const btn = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 240, 70, 0xff7043)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Order now', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5);

    btn.on('pointerdown', () => this.scene.start(SCENES.game));
  }
}
