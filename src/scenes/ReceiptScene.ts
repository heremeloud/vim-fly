import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { ZONES, zoneLabel } from '../core/zones';
import { itemName, t } from '../i18n';
import { runStore } from '../leaderboard/runStore';
import { watchPilot } from '../promo/pilot';
import { COLORS } from '../ui/theme';
import { button, hitArea, label } from '../ui/widgets';

/** Game-over receipt: collected items as line items, total = score. Also saves the run to the order history. */
export class ReceiptScene extends Phaser.Scene {
  constructor() {
    super(SCENES.receipt);
  }

  create(data: { result?: RunResult }): void {
    const r = data.result ?? { heightMeters: 0, lines: [], total: 0, durationMs: 0 };
    const mono = { fontFamily: '"Noto Sans Thai", ui-monospace, Menlo, monospace', fontSize: '20px', color: '#4e342e', padding: { top: 3, bottom: 3 } };
    const x = 50;
    let y = 90;

    // Save once per run. The receipt is only opened with a result right after a run ends.
    let isBest = false;
    if (data.result) {
      const zoneId = r.zone ?? ZONES[0].id;
      isBest = runStore.add({
        playedAt: new Date().toISOString(),
        score: r.total,
        heightMeters: r.heightMeters,
        zoneId,
        durationMs: r.durationMs,
        itemCount: r.lines.reduce((n, l) => n + l.count, 0),
      }).isBest;
    }

    this.add.text(GAME_WIDTH / 2, 50, t('receipt.title'), { ...mono, fontSize: '32px' }).setOrigin(0.5);

    const row = (left: string, right: string) => {
      this.add.text(x, y, left, mono);
      this.add.text(GAME_WIDTH - x, y, right, mono).setOrigin(1, 0);
      y += 32;
    };

    row(t('receipt.height'), `${r.heightMeters} m`);
    const zone = ZONES.find((z) => z.id === r.zone);
    if (zone) row(t('receipt.reached'), zoneLabel(zone));
    const MAX_LINES = 9;
    for (const l of r.lines.slice(0, MAX_LINES)) {
      row(`${itemName(l.id, l.label)} x${l.count}`, l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`);
    }
    if (r.lines.length > MAX_LINES) row(t('receipt.more', { n: r.lines.length - MAX_LINES }), '');
    y += 10;
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - x * 2, 2, 0x4e342e);
    y += 16;
    row(t('receipt.total'), `฿${r.total}`);

    if (isBest) {
      label(this, GAME_WIDTH / 2, y + 8, `★ ${t('receipt.newBest')}`, { size: 22, bold: true, color: COLORS.accent }).setOrigin(0.5, 0);
    }
    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 250, t('receipt.thanks'), { size: 16, color: COLORS.muted }).setOrigin(0.5);

    // Hype: a link to the pilot right where players feel good about their score.
    button(this, GAME_WIDTH / 2, GAME_HEIGHT - 195, 420, 52, t('receipt.watchPilot'), () => watchPilot(), 'secondary');

    // Two buttons side by side: play again, or go back to the menu (item guide).
    const by = GAME_HEIGHT - 110;
    button(this, 130, by, 200, 64, t('receipt.orderAgain'), () => this.scene.start(SCENES.game));
    button(this, 350, by, 200, 64, t('receipt.menu'), () => this.scene.start(SCENES.menu), 'secondary');
    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, t('receipt.backToStore'), { size: 18, color: COLORS.muted }).setOrigin(0.5);
    hitArea(this, GAME_WIDTH / 2 - 80, GAME_HEIGHT - 58, 160, 36, () => this.scene.start(SCENES.home));
  }
}
