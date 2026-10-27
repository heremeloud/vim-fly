import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { ZONES, zoneLabel } from '../core/zones';
import { itemName, t } from '../i18n';
import { runStore } from '../leaderboard/runStore';
import { watchPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { button, hitArea, label } from '../ui/widgets';

// The receipt has three zones, so it can never overlap itself however many items there are:
//   fixed header  (title, height, location)      y 0 .. LIST_TOP
//   scrolling item lines                          y LIST_TOP .. FOOTER_TOP
//   fixed footer  (total, new best, thanks, buttons)  y FOOTER_TOP .. bottom
const X = 50;
const LIST_TOP = 160;
const FOOTER_TOP = 452;
const ROW_MIN = 32;

/** Game-over receipt: collected items as line items, total = score. Also saves the run to the order history. */
export class ReceiptScene extends Phaser.Scene {
  constructor() {
    super(SCENES.receipt);
  }

  create(data: { result?: RunResult }): void {
    const r = data.result ?? { heightMeters: 0, lines: [], total: 0, durationMs: 0 };
    const mono = { fontFamily: '"Noto Sans Thai", ui-monospace, Menlo, monospace', fontSize: '20px', color: '#4e342e', padding: { top: 3, bottom: 3 } };

    // Save once per run. The receipt is only opened with a result right after a run ends.
    let isBest = false;
    if (data.result) {
      isBest = runStore.add({
        playedAt: new Date().toISOString(),
        score: r.total,
        heightMeters: r.heightMeters,
        zoneId: r.zone ?? ZONES[0].id,
        durationMs: r.durationMs,
        itemCount: r.lines.reduce((n, l) => n + l.count, 0),
      }).isBest;
    }

    /** One receipt line: the name on the left (wrapping if long), the amount on the right. Returns its height. */
    const addRow = (y: number, left: string, right: string, into?: Phaser.GameObjects.Container): number => {
      const rightText = this.add.text(GAME_WIDTH - X, y, right, mono).setOrigin(1, 0);
      const room = GAME_WIDTH - X * 2 - rightText.width - 14;
      const leftText = this.add.text(X, y, left, { ...mono, wordWrap: { width: room, useAdvancedWrap: true } });
      if (into) into.add([leftText, rightText]);
      return Math.max(ROW_MIN, Math.ceil(leftText.height) + 4);
    };

    // The item lines scroll behind opaque header and footer panels: the list sits at depth -1 and everything
    // else (the panels, then the texts and buttons created after them) is at the default depth 0.
    const list = new ScrollList(this, LIST_TOP, FOOTER_TOP);
    list.container.setDepth(-1);
    let listY = 0;
    for (const l of r.lines) {
      const points = l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`;
      listY += addRow(listY, `${itemName(l.id, l.label)} x${l.count}`, points, list.container);
    }
    list.setContentHeight(listY + 8);

    // Fixed header.
    this.add.rectangle(0, 0, GAME_WIDTH, LIST_TOP, COLORS.background).setOrigin(0);
    this.add.text(GAME_WIDTH / 2, 50, t('receipt.title'), { ...mono, fontSize: '32px' }).setOrigin(0.5);
    let hy = 90;
    hy += addRow(hy, t('receipt.height'), `${r.heightMeters} m`);
    const zone = ZONES.find((z) => z.id === r.zone);
    if (zone) addRow(hy, t('receipt.reached'), zoneLabel(zone));

    // Fixed footer.
    this.add.rectangle(0, FOOTER_TOP, GAME_WIDTH, GAME_HEIGHT - FOOTER_TOP, COLORS.background).setOrigin(0);
    this.add.rectangle(GAME_WIDTH / 2, FOOTER_TOP + 8, GAME_WIDTH - X * 2, 2, 0x4e342e);
    addRow(FOOTER_TOP + 18, t('receipt.total'), `฿${r.total}`);
    if (isBest) {
      label(this, GAME_WIDTH / 2, FOOTER_TOP + 58, `★ ${t('receipt.newBest')}`, { size: 22, bold: true, color: COLORS.accent }).setOrigin(0.5, 0);
    }
    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 250, t('receipt.thanks'), { size: 16, color: COLORS.muted }).setOrigin(0.5);

    // Hype: play the pilot in a window right where players feel good about their score.
    button(this, GAME_WIDTH / 2, GAME_HEIGHT - 195, 420, 52, t('receipt.watchPilot'), () => watchPilot(), 'secondary');

    // Two buttons side by side: play again, or go back to the menu (item guide).
    const by = GAME_HEIGHT - 110;
    button(this, 130, by, 200, 64, t('receipt.orderAgain'), () => this.scene.start(SCENES.game));
    button(this, 350, by, 200, 64, t('receipt.menu'), () => this.scene.start(SCENES.menu), 'secondary');
    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, t('receipt.backToStore'), { size: 18, color: COLORS.muted }).setOrigin(0.5);
    hitArea(this, GAME_WIDTH / 2 - 80, GAME_HEIGHT - 58, 160, 36, () => this.scene.start(SCENES.home));
  }
}
