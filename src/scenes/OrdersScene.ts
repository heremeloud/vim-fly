import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { zoneAt, zoneLabel, ZONES } from '../core/zones';
import { localeInfo, t } from '../i18n';
import { fetchTopScores, type ScoreEntry } from '../leaderboard/client';
import { getPlayerName } from '../leaderboard/playerName';
import { runStore, type RunRecord } from '../leaderboard/runStore';
import { startOrder } from '../ui/onboarding';
import { ScrollList } from '../ui/ScrollList';
import { COLORS, hex } from '../ui/theme';
import { TAB_BAR_HEIGHT, button, hitArea, label, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 150;
const ROW_H = 58;
const ROW_GAP = 10;
const LIST_PAD = 14;
/** Text on the left of a row must end before this x, where the score and best badge begin. */
const SCORE_LEFT = 360;

type View = 'mine' | 'top';

/**
 * The Orders tab. "My orders" is the history of your runs, newest first; "Top customers" ranks
 * your best runs. Both read from `runStore` (this device for now). When the worldwide leaderboard
 * exists, a server-backed store plugs in here and this screen becomes the ladder.
 */
export class OrdersScene extends Phaser.Scene {
  private view: View = 'top';
  /** Bumped whenever the list is rebuilt, so a slow ladder response for an old view is ignored. */
  private loadSeq = 0;
  private list!: ScrollList;
  private chips: { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }[] = [];

  constructor() {
    super(SCENES.orders);
  }

  create(): void {
    this.view = 'top';
    this.chips = [];
    this.list = new ScrollList(this, HEADER_H, GAME_HEIGHT - TAB_BAR_HEIGHT, true);
    this.buildList();

    this.add.rectangle(0, 0, GAME_WIDTH, HEADER_H, COLORS.background).setOrigin(0).setDepth(40);
    label(this, 20, 22, t('tab.orders'), { size: 34, bold: true }).setDepth(41);
    label(this, 20, 66, t('orders.subtitle'), { size: 15, color: COLORS.muted, maxWidth: GAME_WIDTH - 40 }).setDepth(41);
    this.buildChips();
    if (runStore.best() === null) {
      button(this, GAME_WIDTH / 2, 380, 300, 60, t('home.orderNow'), () => startOrder(this));
    }
    tabBar(this, 'orders');
  }

  private chipDefs(): { view: View; text: string }[] {
    return [
      { view: 'top', text: t('orders.tab.top') },
      { view: 'mine', text: t('orders.tab.mine') },
    ];
  }

  private buildChips(): void {
    const w = 200;
    const gap = 12;
    this.chipDefs().forEach((c, i) => {
      const x = 20 + i * (w + gap);
      const bg = this.add.graphics().setDepth(41);
      const text = label(this, x + w / 2, 118, c.text, { size: 17, bold: true, maxWidth: w - 16 }).setOrigin(0.5).setDepth(42);
      this.chips.push({ bg, text });
      hitArea(this, x, 98, w, 40, () => this.select(c.view)).setDepth(43);
    });
    this.paintChips();
  }

  private paintChips(): void {
    const w = 200;
    const gap = 12;
    this.chipDefs().forEach((c, i) => {
      const on = c.view === this.view;
      const x = 20 + i * (w + gap);
      const chip = this.chips[i];
      chip.bg.clear();
      chip.bg.fillStyle(on ? COLORS.primary : COLORS.surface, 1).fillRoundedRect(x, 98, w, 40, 20);
      chip.bg.lineStyle(2, COLORS.primary, 1).strokeRoundedRect(x, 98, w, 40, 20);
      chip.text.setColor(on ? hex(COLORS.onPrimary) : hex(COLORS.accent));
    });
  }

  private select(view: View): void {
    if (view === this.view) return;
    this.view = view;
    this.paintChips();
    this.buildList();
  }

  private buildList(): void {
    this.loadSeq += 1; // any ladder request still in flight is now stale
    if (this.view === 'top') this.buildTop();
    else this.buildLocal('mine', null);
  }

  /** Top Customers: the worldwide ladder, falling back to this device's best runs when it can't be reached. */
  private buildTop(): void {
    this.list.clear();
    this.list.container.add(label(this, GAME_WIDTH / 2, 120, t('orders.loading'), { size: 18, color: COLORS.muted }).setOrigin(0.5, 0));
    const seq = this.loadSeq;
    const stale = () => seq !== this.loadSeq || this.view !== 'top' || !this.sys.isActive();
    fetchTopScores(100).then(
      (rows) => !stale() && this.showLadder(rows),
      () => !stale() && this.buildLocal('top', t('orders.offline')),
    );
  }

  private showLadder(rows: ScoreEntry[]): void {
    this.list.clear();
    const c = this.list.container;
    if (rows.length === 0) {
      c.add(label(this, GAME_WIDTH / 2, 120, t('orders.empty'), { size: 18, color: COLORS.muted, wrap: 340, align: 'center' }).setOrigin(0.5, 0));
      return;
    }
    let y = LIST_PAD;
    const me = getPlayerName();
    rows.forEach((row, i) => {
      const rank = i + 1;
      c.add(roundedBox(this, 20, y, GAME_WIDTH - 40, ROW_H, COLORS.surface, 14, me !== null && row.name === me ? COLORS.primary : COLORS.border));
      c.add(this.add.circle(52, y + ROW_H / 2, 18, rank === 1 ? COLORS.primary : COLORS.background));
      c.add(label(this, 52, y + ROW_H / 2, `${rank}`, { size: 17, bold: true }).setOrigin(0.5));
      c.add(label(this, 84, y + 8, row.name, { size: 17, bold: true, maxWidth: 230 }));
      const when = new Date(row.createdAt).toLocaleDateString(localeInfo().dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });
      c.add(label(this, 84, y + 34, when, { size: 12, color: COLORS.muted }));
      c.add(label(this, GAME_WIDTH - 36, y + ROW_H / 2, `฿${row.score}`, { size: 20, bold: true, color: COLORS.accent }).setOrigin(1, 0.5));
      y += ROW_H + ROW_GAP;
    });
    this.list.setContentHeight(y + LIST_PAD);
  }

  /** This device's runs: the history (`mine`), or its best runs ranked (`top`, with a note saying why). */
  private buildLocal(view: View, note: string | null): void {
    this.list.clear();
    const runs = view === 'mine' ? runStore.recent() : runStore.top();
    const best = runStore.best();
    const c = this.list.container;

    if (runs.length === 0) {
      c.add(label(this, GAME_WIDTH / 2, 120, t('orders.empty'), { size: 18, color: COLORS.muted, wrap: 340, align: 'center' }).setOrigin(0.5, 0));
      return;
    }

    let y = LIST_PAD;
    if (note) {
      c.add(label(this, 20, y, note, { size: 13, color: COLORS.muted, wrap: GAME_WIDTH - 40 }));
      y += 38;
    }

    runs.forEach((run, i) => {
      const isBest = best !== null && run.no === best.no;
      this.addRow(c, y, run, view === 'top' ? i + 1 : null, isBest);
      y += ROW_H + ROW_GAP;
    });
    this.list.setContentHeight(y + LIST_PAD);
  }

  private addRow(c: Phaser.GameObjects.Container, y: number, run: RunRecord, rank: number | null, isBest: boolean): void {
    c.add(roundedBox(this, 20, y, GAME_WIDTH - 40, ROW_H, COLORS.surface, 14, isBest ? COLORS.primary : COLORS.border));

    // Left badge: the rank on the ladder, or the order number in the history.
    const badge = rank !== null ? `${rank}` : '#' + run.no;
    c.add(this.add.circle(52, y + ROW_H / 2, 18, rank === 1 ? COLORS.primary : COLORS.background));
    c.add(label(this, 52, y + ROW_H / 2, badge, { size: rank !== null ? 17 : 13, bold: true, color: COLORS.text }).setOrigin(0.5));

    const zone = zoneAt(ZONES.find((z) => z.id === run.zoneId)?.fromMeters ?? 0);
    // Line 1: order number and date. Line 2: location and height. Each stays on one line, so a long
    // translation can never wrap into the row below (see `maxWidth` in widgets.ts).
    const orderNo = label(this, 84, y + 7, t('orders.orderNo', { n: run.no }), { size: 16, bold: true, maxWidth: 120 });
    c.add(orderNo);
    const when = new Date(run.playedAt).toLocaleDateString(localeInfo().dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });
    const dateX = 84 + orderNo.displayWidth + 8;
    c.add(label(this, dateX, y + 10, when, { size: 12, color: COLORS.muted, maxWidth: SCORE_LEFT - dateX }));
    c.add(label(this, 84, y + 33, `${zoneLabel(zone)} · ${run.heightMeters} m`, { size: 12, color: COLORS.muted, maxWidth: SCORE_LEFT - 84 }));

    c.add(label(this, GAME_WIDTH - 36, y + ROW_H / 2 - 7, `฿${run.score}`, { size: 20, bold: true, color: COLORS.accent }).setOrigin(1, 0.5));
    if (isBest) c.add(label(this, GAME_WIDTH - 36, y + ROW_H / 2 + 12, `★ ${t('orders.bestBadge')}`, { size: 12, bold: true, color: COLORS.primaryDark, maxWidth: 80 }).setOrigin(1, 0.5));
  }
}
