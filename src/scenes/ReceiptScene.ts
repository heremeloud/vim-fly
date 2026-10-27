import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { COLORS } from '../ui/theme';
import { button, hitArea, label } from '../ui/widgets';

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
    if (r.zone) row('Reached', r.zone);
    for (const l of r.lines.slice(0, 12)) {
      row(`${l.label} x${l.count}`, l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`);
    }
    y += 10;
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - x * 2, 2, 0x4e342e);
    y += 16;
    row('TOTAL', `${r.total}`);

    // Two buttons side by side: play again, or go back to the menu (item guide).
    const by = GAME_HEIGHT - 110;
    button(this, 130, by, 200, 64, 'Order again', () => this.scene.start(SCENES.game));
    button(this, 350, by, 200, 64, 'Menu', () => this.scene.start(SCENES.menu), 'secondary');
    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Back to store', { size: 18, color: COLORS.muted })
      .setOrigin(0.5);
    hitArea(this, GAME_WIDTH / 2 - 80, GAME_HEIGHT - 58, 160, 36, () => this.scene.start(SCENES.home));
  }
}
