import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { ZONES, zoneLabel } from '../core/zones';
import { itemName, localeInfo, t } from '../i18n';
import { addItemSprite } from '../items/itemSprite';
import { leaderboardConfigured, submitFinishedRun } from '../leaderboard/client';
import { getPlayerName } from '../leaderboard/playerName';
import { runStore } from '../leaderboard/runStore';
import { embedPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { button, fitWidth, iconButton, label } from '../ui/widgets';

// The receipt has three zones, so it can never overlap itself however many items there are:
//   fixed header  (title, height, location)      y 0 .. LIST_TOP
//   scrolling item lines                          y LIST_TOP .. FOOTER_TOP
//   fixed footer  (total, new best, the pilot player, thanks, buttons)  y FOOTER_TOP .. bottom
const X = 50;
const LIST_TOP = 126;
const FOOTER_TOP = 372;
/** The pilot player: 16:9, centered, under the total. */
const VIDEO = { x: 40, y: 461, w: 400, h: 225 };
const ROW_MIN = 27;
/** Native-size item icon beside each receipt line. */
const ICON = 26;
/** The paper: a sheet with torn (zigzag) top and bottom edges on a table-coloured background. */
const PAPER = 0xfffdf7;
const TABLE = 0xefdcc0;
const SHEET = { x0: 20, x1: 460, top: 2, bottom: 727, tooth: 10, depth: 5 };
/** Item lines are set a little smaller than the header and total so more of them fit before scrolling. */
const LIST_FONT = '17px';

/** Outline of the receipt paper: straight sides, zigzag top and bottom. */
function paperOutline(dy = 0): { x: number; y: number }[] {
  const { x0, x1, top, bottom, tooth, depth } = SHEET;
  const teeth = Math.round((x1 - x0) / tooth);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= teeth; i++) pts.push({ x: x0 + i * tooth, y: top + dy + (i % 2 ? depth : 0) });
  for (let i = teeth; i >= 0; i--) pts.push({ x: x0 + i * tooth, y: bottom + dy - (i % 2 ? depth : 0) });
  return pts;
}

/** Native share sheet where there is one (lists Instagram, TikTok, X...); otherwise a pre-filled X post. */
async function shareScore(score: number): Promise<void> {
  const url = window.location.origin + window.location.pathname;
  const shareText = t('receipt.shareText', { score, url });
  if (navigator.share) {
    try {
      // Link inside the text: iOS share targets often drop `text` when a separate `url` is given.
      await navigator.share({ text: shareText });
    } catch {
      // Closed without sharing.
    }
    return;
  }
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
}

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
    let orderNo: number | null = null;
    if (data.result) {
      const saved = runStore.add({
        playedAt: new Date().toISOString(),
        score: r.total,
        heightMeters: r.heightMeters,
        zoneId: r.zone ?? ZONES[0].id,
        durationMs: r.durationMs,
        itemCount: r.lines.reduce((n, l) => n + l.count, 0),
      });
      isBest = saved.isBest;
      orderNo = saved.record.no;
    }

    /** One receipt line: the name on the left (wrapping if long), the amount on the right. Returns its height. */
    const addRow = (y: number, left: string, right: string, into?: Phaser.GameObjects.Container, itemId?: string): number => {
      const style = into ? { ...mono, fontSize: LIST_FONT } : mono;
      const rightText = this.add.text(GAME_WIDTH - X, y, right, style).setOrigin(1, 0);
      const indent = itemId ? ICON + 8 : 0;
      const room = GAME_WIDTH - X * 2 - rightText.width - 14 - indent;
      const leftText = this.add.text(X + indent, y, left, { ...style, wordWrap: { width: room, useAdvancedWrap: true } });
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
    this.cameras.main.setBackgroundColor(TABLE);
    this.add.polygon(0, 0, paperOutline(3)).setOrigin(0).setFillStyle(0x000000, 0.12).setDepth(-3);
    this.add.polygon(0, 0, paperOutline()).setOrigin(0).setFillStyle(PAPER, 1).setDepth(-2);
    /** A dashed rule like the ones on printed receipts. */
    const dashed = (y: number): void => {
      const g = this.add.graphics();
      g.fillStyle(0x8d6e63, 1);
      for (let x = X; x < GAME_WIDTH - X; x += 8) g.fillRect(x, y, 4, 1.5);
    };
    const list = new ScrollList(this, LIST_TOP, FOOTER_TOP, false, true);
    list.container.setDepth(-1);
    let listY = 0;
    for (const l of r.lines) {
      const points = l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${l.points}`;
      listY += addRow(listY, `${itemName(l.id, l.label)} x${l.count}`, points, list.container, l.id);
    }
    list.setContentHeight(listY + 8);

    // Fixed header.
    this.add.rectangle(SHEET.x0, SHEET.top + SHEET.depth, SHEET.x1 - SHEET.x0, LIST_TOP - SHEET.top - SHEET.depth, PAPER).setOrigin(0);
    const small = { fontFamily: mono.fontFamily, fontSize: '11px', color: '#8d6e63', padding: { top: 2, bottom: 2 } };
    if (orderNo !== null) this.add.text(X, 13, t('orders.orderNo', { n: orderNo }), small);
    const when = new Date().toLocaleString(localeInfo().dateLocale, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: localeInfo().hourCycle });
    this.add.text(GAME_WIDTH - X, 13, when, small).setOrigin(1, 0);
    this.add.text(GAME_WIDTH / 2, 40, t('receipt.title'), { ...mono, fontSize: '22px' }).setOrigin(0.5);
    dashed(LIST_TOP - 6);
    let hy = 58;
    hy += addRow(hy, t('receipt.height'), `${r.heightMeters} m`);
    const zone = ZONES.find((z) => z.id === r.zone);
    if (zone) addRow(hy, t('receipt.reached'), zoneLabel(zone));

    // Fixed footer.
    this.add.rectangle(SHEET.x0, FOOTER_TOP, SHEET.x1 - SHEET.x0, SHEET.bottom - SHEET.depth - FOOTER_TOP, PAPER).setOrigin(0);
    dashed(FOOTER_TOP + 5);
    addRow(FOOTER_TOP + 12, t('receipt.total'), `฿${r.total}`);
    if (isBest) {
      label(this, GAME_WIDTH / 2, FOOTER_TOP + 14, `★ ${t('receipt.newBest')}`, { size: 16, bold: true, color: COLORS.accent }).setOrigin(0.5, 0);
    }
    iconButton(this, GAME_WIDTH / 2, FOOTER_TOP + 55, 40, 26, 'share', () => void shareScore(r.total));
    // Send the score to the worldwide ranking (the run is already saved on this device either way).
    const name = getPlayerName();
    if (data.result && name && leaderboardConfigured) {
      const status = label(this, GAME_WIDTH / 2, FOOTER_TOP + 69, t('receipt.sending'), { size: 12, color: COLORS.muted }).setOrigin(0.5, 0);
      void submitFinishedRun(name, r.total).then((ok) => {
        if (!status.active) return; // the player already left the receipt
        if (ok) status.setText('');
        else status.setText(t('receipt.sendFailed'));
      });
    }
    // The pilot, right here: poster with a play button (no autoplay, so it never clashes with the game's sound).
    this.addStamp(t('receipt.thanks'));
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

  /** A rubber-stamp "thank you", slightly crooked and see-through, that thumps onto the paper over the item lines. */
  private addStamp(text: string): void {
    const ink = COLORS.accent;
    const word = this.add
      .text(0, 0, text, { fontFamily: '"Noto Sans Thai", ui-monospace, Menlo, monospace', fontSize: '19px', fontStyle: 'bold', color: '#b83c3c', padding: { top: 2, bottom: 2 } })
      .setOrigin(0.5);
    fitWidth(word, 100);
    const w = Math.max(word.displayWidth + 22, 70);
    const h = word.displayHeight + 12;
    const box = this.add.graphics();
    box.lineStyle(3, ink, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    box.lineStyle(1, ink, 1).strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 3);
    const stamp = this.add.container(GAME_WIDTH - 118, FOOTER_TOP - 40, [box, word]).setRotation(-0.2).setAlpha(0).setScale(1.7);
    this.tweens.add({ targets: stamp, alpha: 0.78, scale: 1, duration: 220, delay: 350, ease: 'Cubic.easeIn' });
  }
}
