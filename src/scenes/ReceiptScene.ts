import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';

/** Game-over receipt: collected items as line items, total = score. */
export class ReceiptScene extends Phaser.Scene {
  constructor() {
    super(SCENES.receipt);
  }

  create(data: { result?: RunResult }): void {
    const r = data.result ?? { heightMeters: 0, lines: [], total: 0, durationMs: 0 };
    const mono = { fontFamily: 'monospace', fontSize: '20px', color: '#4e342e' };
    const x = 60;
    let y = 90;

    this.add.text(GAME_WIDTH / 2, 50, 'RECEIPT', { ...mono, fontSize: '32px' }).setOrigin(0.5);

    const row = (left: string, right: string) => {
      this.add.text(x, y, left, mono);
      this.add.text(GAME_WIDTH - x, y, right, mono).setOrigin(1, 0);
      y += 30;
    };

    row('Height', `${r.heightMeters} m`);
    for (const l of r.lines.slice(0, 12)) {
      row(`${l.label} x${l.count}`, l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`);
    }
    y += 10;
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - x * 2, 2, 0x4e342e);
    y += 16;
    row('TOTAL', `${r.total}`);

    const btn = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 120, 240, 70, 0xff7043)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Order again', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start(SCENES.game));
  }
}
