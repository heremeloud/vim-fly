import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { ZONES, zoneLabel } from '../core/zones';
import { itemName, t } from '../i18n';
import { addItemSprite } from '../items/itemSprite';
import { submitFinishedRun } from '../leaderboard/client';
import { getPlayerName } from '../leaderboard/playerName';
import { runStore } from '../leaderboard/runStore';
import { embedPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { button, label } from '../ui/widgets';

// The receipt has three zones, so it can never overlap itself however many items there are:
//   fixed header  (title, height, location)      y 0 .. LIST_TOP
//   scrolling item lines                          y LIST_TOP .. FOOTER_TOP
//   fixed footer  (total, new best, the pilot player, thanks, buttons)  y FOOTER_TOP .. bottom
const X = 50;
const LIST_TOP = 118;
const FOOTER_TOP = 300;
/** The pilot player: 16:9, centered, under the total. */
const VIDEO = { x: 20, y: 408, w: 440, h: 248 };
const ROW_MIN = 30;
/** Native-size item icon beside each receipt line. */
const ICON = 32;

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
    const addRow = (y: number, left: string, right: string, into?: Phaser.GameObjects.Container, itemId?: string): number => {
      const rightText = this.add.text(GAME_WIDTH - X, y, right, mono).setOrigin(1, 0);
      const indent = itemId ? ICON + 8 : 0;
      const room = GAME_WIDTH - X * 2 - rightText.width - 14 - indent;
      const leftText = this.add.text(X + indent, y, left, { ...mono, wordWrap: { width: room, useAdvancedWrap: true } });
      // Header rows must stay one line (they sit above the list), so shrink a label that would wrap on a wider phone font.
      if (!into) {
        let size = 20;
        while (size > 12 && leftText.setFontSize(size).height > size * 1.6) size -= 2; // 1.6 em: more than one line
      }
      const height = Math.max(ROW_MIN, Math.ceil(leftText.height) + 4);
      if (into) into.add([leftText, rightText]);
      if (itemId && into) into.add(addItemSprite(this, X + ICON / 2, y + height / 2 - 2, { id: itemId, color: 0xd7ccc8 }, ICON));
      return height;
    };

    // The item lines scroll behind opaque header and footer panels: the list sits at depth -1 and everything
    // else (the panels, then the texts and buttons created after them) is at the default depth 0.
    const list = new ScrollList(this, LIST_TOP, FOOTER_TOP);
    list.container.setDepth(-1);
    let listY = 0;
    for (const l of r.lines) {
      const points = l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`;
      listY += addRow(listY, `${itemName(l.id, l.label)} x${l.count}`, points, list.container, l.id);
    }
    list.setContentHeight(listY + 8);

    // Fixed header.
    this.add.rectangle(0, 0, GAME_WIDTH, LIST_TOP, COLORS.background).setOrigin(0);
    this.add.text(GAME_WIDTH / 2, 28, t('receipt.title'), { ...mono, fontSize: '22px' }).setOrigin(0.5);
    let hy = 52;
    hy += addRow(hy, t('receipt.height'), `${r.heightMeters} m`);
    const zone = ZONES.find((z) => z.id === r.zone);
    if (zone) addRow(hy, t('receipt.reached'), zoneLabel(zone));

    // Fixed footer.
    this.add.rectangle(0, FOOTER_TOP, GAME_WIDTH, GAME_HEIGHT - FOOTER_TOP, COLORS.background).setOrigin(0);
    this.add.rectangle(GAME_WIDTH / 2, FOOTER_TOP + 8, GAME_WIDTH - X * 2, 2, 0x4e342e);
    addRow(FOOTER_TOP + 18, t('receipt.total'), `฿${r.total}`);
    if (isBest) {
      label(this, GAME_WIDTH / 2, FOOTER_TOP + 48, `★ ${t('receipt.newBest')}`, { size: 18, bold: true, color: COLORS.accent }).setOrigin(0.5, 0);
    }
    // Send the score to the worldwide ranking (the run is already saved on this device either way).
    const name = getPlayerName();
    if (data.result && name) {
      const status = label(this, GAME_WIDTH / 2, FOOTER_TOP + 68, t('receipt.sending'), { size: 12, color: COLORS.muted }).setOrigin(0.5, 0);
      void submitFinishedRun(name, r.total).then((ok) => {
        if (!status.active) return; // the player already left the receipt
        status.setText(t(ok ? 'receipt.sent' : 'receipt.sendFailed'));
      });
    }
    // The pilot, right here: poster with a play button (no autoplay, so it never clashes with the game's sound).
    label(this, GAME_WIDTH / 2, VIDEO.y - 14, t('receipt.thanks'), { size: 13, color: COLORS.muted }).setOrigin(0.5);
    embedPilot(this, VIDEO);
    this.add
      .text(GAME_WIDTH / 2, VIDEO.y + VIDEO.h + 22, t('receipt.tagline'), {
        fontFamily: 'Sacramento, "Brush Script MT", cursive',
        fontSize: '22px',
        color: '#8d6e63',
        padding: { top: 3, bottom: 3 },
      })
      .setOrigin(0.5);

    // Two buttons side by side: play again, or go back to the store.
    const by = GAME_HEIGHT - 40;
    button(this, 130, by, 190, 50, t('receipt.orderAgain'), () => this.scene.start(SCENES.game), 'primary', 18);
    button(this, 350, by, 190, 50, t('receipt.backToStore'), () => this.scene.start(SCENES.home), 'secondary', 18);
  }
}
