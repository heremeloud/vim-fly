import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { zoneAt, zoneLabel, ZONES } from '../core/zones';
import { localeInfo, t } from '../i18n';
import { fetchTopScores, type ScoreEntry } from '../leaderboard/client';
import { runStore, type RunRecord } from '../leaderboard/runStore';
import { addItemSprite } from '../items/itemSprite';
import { startOrder } from '../ui/onboarding';
import { ScrollList } from '../ui/ScrollList';
import { drawIcon } from '../ui/icons';
import { COLORS, RADIUS } from '../ui/theme';
import { CHIP, TAB_BAR_HEIGHT, button, chipWidth, hitArea, label, pageHeader, paintChip, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 156;
const ROW_H = 58;
const ROW_GAP = 10;
const LIST_PAD = 14;

/** A tilted crown perched on the rank badge of the world champion (rank 1). */
function addCrown(scene: Phaser.Scene, c: Phaser.GameObjects.Container, x: number, y: number): void {
  c.add(drawIcon(scene, 'crown', x - 2, y - 20, COLORS.onPrimary, { width: 1.8, fill: COLORS.primary }).setScale(0.8).setRotation(-0.25));
}
/** Foods shown on the history rows in turn (by order number), instead of a plain number badge. */
const ORDER_FOODS = ['pandanCustardBread', 'coffee', 'shiopan', 'pasta', 'sandwich', 'tomYum', 'cheeseButterBread', 'shrimpFriedRiceBox', 'cilantroBread', 'wine', 'fishSauceBread'];
/** Text on the left of a row must end before this x, where the score and best badge begin. */
const SCORE_LEFT = 360;

type View = 'mine' | 'top';

/**
 * The Orders tab. "My orders" is the device's saved history; "World's Top Customers" loads the
 * Supabase ladder and falls back to this device's best runs when the network is unavailable.
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

    pageHeader(this, HEADER_H, t('tab.orders'), t('orders.subtitle'), 'wow');
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
    const w = chipWidth(this.chipDefs().length);
    const gap = CHIP.gap;
    this.chipDefs().forEach((c, i) => {
      const x = 20 + i * (w + gap);
      const bg = this.add.graphics().setDepth(41);
      const text = label(this, x + w / 2, CHIP.y + CHIP.h / 2, c.text, { size: CHIP.size, bold: true, maxWidth: w - 16 }).setOrigin(0.5).setDepth(42);
      this.chips.push({ bg, text });
      hitArea(this, x, CHIP.y, w, CHIP.h, () => this.select(c.view)).setDepth(43);
    });
    this.paintChips();
  }

  private paintChips(): void {
    const w = chipWidth(this.chipDefs().length);
    const gap = CHIP.gap;
    this.chipDefs().forEach((c, i) => {
      const on = c.view === this.view;
      const x = 20 + i * (w + gap);
      const chip = this.chips[i];
      paintChip(chip.bg, chip.text, x, CHIP.y, w, CHIP.h, on, COLORS.primary, COLORS.onPrimary, COLORS.accent);
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
    rows.forEach((row, i) => {
      const rank = i + 1;
      c.add(roundedBox(this, 20, y, GAME_WIDTH - 40, ROW_H, COLORS.surface, RADIUS.card, COLORS.border));
      c.add(this.add.circle(52, y + ROW_H / 2, 18, rank === 1 ? COLORS.primary : COLORS.background));
      c.add(label(this, 52, y + ROW_H / 2, `${rank}`, { size: 17, bold: true }).setOrigin(0.5));
      if (rank === 1) addCrown(this, c, 52, y + ROW_H / 2);
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
    c.add(roundedBox(this, 20, y, GAME_WIDTH - 40, ROW_H, COLORS.surface, RADIUS.card, isBest ? COLORS.primary : COLORS.border));

    // Left badge: the rank on the ladder, or a food picture in the history (the order number is in the text).
    c.add(this.add.circle(52, y + ROW_H / 2, 20, rank === 1 ? COLORS.primary : COLORS.background));
    if (rank !== null) {
      c.add(label(this, 52, y + ROW_H / 2, `${rank}`, { size: 17, bold: true, color: COLORS.text }).setOrigin(0.5));
      if (rank === 1) addCrown(this, c, 52, y + ROW_H / 2);
    } else {
      const food = ORDER_FOODS[(run.no - 1 + ORDER_FOODS.length) % ORDER_FOODS.length];
      c.add(addItemSprite(this, 52, y + ROW_H / 2, { id: food, color: 0xd7ccc8 }, 28));
    }

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
