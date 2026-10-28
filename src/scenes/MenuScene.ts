import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t, type StringKey } from '../i18n';
import { ITEMS, describeEffect, displayName, priceLabel, type ItemKind } from '../items/itemDefs';
import { addItemSprite } from '../items/itemSprite';
import { ScrollList } from '../ui/ScrollList';
import { COLORS, hex } from '../ui/theme';
import { TAB_BAR_HEIGHT, hitArea, label, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 150;
const ROW_H = 84;
const ROW_GAP = 10;
const LIST_PAD = 14;

const CATEGORIES: { kind: ItemKind; key: StringKey; color: number }[] = [
  { kind: 'points', key: 'kind.points', color: COLORS.points },
  { kind: 'buff', key: 'kind.buff', color: COLORS.buff },
  { kind: 'debuff', key: 'kind.debuff', color: COLORS.debuff },
];

/**
 * The item guide, shown as a menu: every item with what it does and its "price"
 * (the point value). Read straight from ITEMS, so it always matches the game.
 */
export class MenuScene extends Phaser.Scene {
  private kind: ItemKind = 'points';
  private list!: ScrollList;
  private chips: { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }[] = [];

  constructor() {
    super(SCENES.menu);
  }

  create(): void {
    this.kind = 'points';
    this.chips = [];
    this.list = new ScrollList(this, HEADER_H, GAME_HEIGHT - TAB_BAR_HEIGHT);
    this.buildList();

    // Header and tab bar are opaque and drawn above the list, hiding rows scrolled under them.
    this.add.rectangle(0, 0, GAME_WIDTH, HEADER_H, COLORS.background).setOrigin(0).setDepth(40);
    label(this, 20, 22, t('menu.title'), { size: 34, bold: true }).setDepth(41);
    label(this, 20, 66, t('menu.subtitle'), { size: 15, color: COLORS.muted }).setDepth(41);
    this.buildChips();
    tabBar(this, 'menu');
  }

  private buildChips(): void {
    const w = 130;
    const gap = 12;
    CATEGORIES.forEach((c, i) => {
      const x = 20 + i * (w + gap);
      const bg = this.add.graphics().setDepth(41);
      const text = label(this, x + w / 2, 118, t(c.key), { size: 18, bold: true }).setOrigin(0.5).setDepth(42);
      this.chips.push({ bg, text });
      hitArea(this, x, 98, w, 40, () => this.selectKind(c.kind)).setDepth(43);
    });
    this.paintChips();
  }

  private paintChips(): void {
    const w = 130;
    const gap = 12;
    CATEGORIES.forEach((c, i) => {
      const chip = this.chips[i];
      const on = c.kind === this.kind;
      const x = 20 + i * (w + gap);
      chip.bg.clear();
      chip.bg.fillStyle(on ? c.color : COLORS.surface, 1).fillRoundedRect(x, 98, w, 40, 20);
      chip.bg.lineStyle(2, c.color, 1).strokeRoundedRect(x, 98, w, 40, 20);
      chip.text.setColor(on ? hex(COLORS.onPrimary) : hex(c.color));
    });
  }

  private selectKind(kind: ItemKind): void {
    if (kind === this.kind) return;
    this.kind = kind;
    this.paintChips();
    this.buildList();
  }

  private buildList(): void {
    this.list.clear();
    const items = ITEMS.filter((i) => i.kind === this.kind);

    items.forEach((item, i) => {
      const y = LIST_PAD + i * (ROW_H + ROW_GAP);
      const name = label(this, 100, y + 10, displayName(item), { size: 19, bold: true, wrap: 240 });
      // Long names wrap to two lines, so the description sits below whatever height the name ended up.
      const desc = label(this, 100, y + 10 + name.height + 2, describeEffect(item), { size: 14, color: COLORS.muted, wrap: 240 });
      const row = [
        roundedBox(this, 20, y, GAME_WIDTH - 40, ROW_H, COLORS.surface, 14, COLORS.border),
        this.add.rectangle(62, y + ROW_H / 2, 60, 60, COLORS.background).setStrokeStyle(3, CATEGORIES.find((c) => c.kind === item.kind)!.color),
        addItemSprite(this, 62, y + ROW_H / 2, item, 48),
        name,
        desc,
        label(this, GAME_WIDTH - 36, y + ROW_H / 2, priceLabel(item), {
          size: 22,
          bold: true,
          color: item.kind === 'debuff' ? COLORS.debuff : item.kind === 'buff' ? COLORS.buff : COLORS.accent,
        }).setOrigin(1, 0.5),
      ];
      this.list.container.add(row);
    });

    this.list.setContentHeight(LIST_PAD * 2 + items.length * (ROW_H + ROW_GAP));
  }
}
