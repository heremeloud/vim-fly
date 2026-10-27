import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';

/** Game-over receipt: line items and total. Placeholder showing only the score. */
export class ReceiptScene extends Phaser.Scene {
  constructor() {
    super(SCENES.receipt);
  }

  create(data: { score?: number }): void {
    const score = data.score ?? 0;
    this.add
      .text(GAME_WIDTH / 2, 240, `Total: ${score}`, { fontSize: '40px', color: '#5d4037' })
      .setOrigin(0.5);

    const btn = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 240, 70, 0xff7043)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Order again', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5);

    btn.on('pointerdown', () => this.scene.start(SCENES.game));
  }
}
