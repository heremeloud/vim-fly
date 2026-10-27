import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { LOCALES, getLocale, localeInfo, setLocale, t, type StringKey } from '../i18n';
import { COLORS, FONT, hex } from './theme';

export const TAB_BAR_HEIGHT = 80;

export interface TextOpts {
  size?: number;
  color?: number;
  bold?: boolean;
  wrap?: number;
  align?: 'left' | 'center' | 'right';
}

/** Text in the menu font. */
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  { size = 18, color = COLORS.text, bold = false, wrap, align }: TextOpts = {},
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: FONT.family,
    fontSize: `${size}px`,
    fontStyle: bold ? 'bold' : 'normal',
    color: hex(color),
    wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined, // advanced wrap also breaks long unspaced text (Japanese, Chinese, Thai)
    align,
    padding: { top: 3, bottom: 3 }, // room for tall Thai and CJK glyphs
  });
}

/** A filled rounded rectangle (top-left origin). */
export function roundedBox(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  radius = 14,
  stroke?: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, radius);
  if (stroke !== undefined) g.lineStyle(2, stroke, 1).strokeRoundedRect(x, y, w, h, radius);
  return g;
}

/** An invisible tappable area. */
export function hitArea(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  onTap: () => void,
): Phaser.GameObjects.Rectangle {
  const r = scene.add.rectangle(x, y, w, h, 0xffffff, 0.001).setOrigin(0).setInteractive({ useHandCursor: true });
  // Ignore the tap if the finger dragged (scrolling a list), so scrolling never opens things.
  r.on('pointerup', (p: Phaser.Input.Pointer) => {
    if (Math.hypot(p.x - p.downX, p.y - p.downY) < 12) onTap();
  });
  return r;
}

/**
 * A pill-shaped button, centered on (cx, cy). `primary` is filled honey yellow;
 * `secondary` is white with a yellow outline.
 */
export function button(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  text: string,
  onTap: () => void,
  variant: 'primary' | 'secondary' = 'primary',
): void {
  const x = cx - w / 2;
  const y = cy - h / 2;
  if (variant === 'primary') {
    roundedBox(scene, x, y + 4, w, h, COLORS.primaryDark, h / 2); // shadow
    roundedBox(scene, x, y, w, h, COLORS.primary, h / 2);
  } else {
    roundedBox(scene, x, y, w, h, COLORS.surface, h / 2, COLORS.primary);
  }
  label(scene, cx, cy, text, { size: 24, color: COLORS.onPrimary, bold: true }).setOrigin(0.5);
  hitArea(scene, x, y, w, h, onTap);
}

export type TabId = 'store' | 'menu' | 'orders' | 'promos';

const TABS: { id: TabId; icon: string; key: StringKey }[] = [
  { id: 'store', icon: '🏠', key: 'tab.store' },
  { id: 'menu', icon: '📖', key: 'tab.menu' },
  { id: 'orders', icon: '🧾', key: 'tab.orders' },
  { id: 'promos', icon: '🎁', key: 'tab.promos' },
];

function tabTarget(id: TabId): { scene: string; data?: object } {
  switch (id) {
    case 'store':
      return { scene: SCENES.home };
    case 'menu':
      return { scene: SCENES.menu };
    case 'orders':
      return { scene: SCENES.orders };
    case 'promos':
      return { scene: SCENES.promos };
  }
}

/** The bottom tab bar, drawn above scrolling content. */
export function tabBar(scene: Phaser.Scene, active: TabId): void {
  const y = GAME_HEIGHT - TAB_BAR_HEIGHT;
  const depth = 50;
  // Interactive so taps on rows scrolled underneath the bar don't reach them.
  scene.add.rectangle(0, y, GAME_WIDTH, TAB_BAR_HEIGHT, COLORS.surface).setOrigin(0).setDepth(depth).setInteractive();
  scene.add.rectangle(0, y, GAME_WIDTH, 2, COLORS.border).setOrigin(0).setDepth(depth);

  const w = GAME_WIDTH / TABS.length;
  TABS.forEach((tab, i) => {
    const cx = i * w + w / 2;
    const on = tab.id === active;
    scene.add.text(cx, y + 26, tab.icon, { fontSize: '26px' }).setOrigin(0.5).setDepth(depth).setAlpha(on ? 1 : 0.5);
    label(scene, cx, y + 56, t(tab.key), { size: 14, color: on ? COLORS.accent : COLORS.muted, bold: on })
      .setOrigin(0.5)
      .setDepth(depth);
    const hit = hitArea(scene, i * w, y, w, TAB_BAR_HEIGHT, () => {
      if (on) return;
      const target = tabTarget(tab.id);
      scene.scene.start(target.scene, target.data);
    });
    hit.setDepth(depth + 1);
  });
}

/**
 * A small language button (text only, no flags) for the top-right corner. Tapping it opens a list of
 * the languages; choosing one saves it and restarts the scene so everything is redrawn.
 */
export function languageButton(scene: Phaser.Scene, rightX: number, y: number): void {
  const text = label(scene, rightX, y, `🌐 ${localeInfo().name}`, { size: 15, color: COLORS.onPrimary, bold: true }).setOrigin(1, 0);
  text.setDepth(30);
  hitArea(scene, rightX - text.width - 8, y - 4, text.width + 16, text.height + 8, () => openLanguagePicker(scene)).setDepth(31);
}

function openLanguagePicker(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const close = () => items.forEach((o) => o.destroy());

  // A dim backdrop that also swallows taps meant for what is underneath.
  const dim = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setOrigin(0).setDepth(depth).setInteractive();
  dim.on('pointerup', close);
  items.push(dim);

  const rowH = 58;
  const cardW = 320;
  const cardH = 70 + LOCALES.length * rowH;
  const x = (GAME_WIDTH - cardW) / 2;
  const y = (GAME_HEIGHT - cardH) / 2;
  const card = roundedBox(scene, x, y, cardW, cardH, COLORS.surface, 20).setDepth(depth + 1);
  items.push(card);
  items.push(label(scene, GAME_WIDTH / 2, y + 20, t('lang.title'), { size: 22, bold: true }).setOrigin(0.5, 0).setDepth(depth + 2));

  LOCALES.forEach((loc, i) => {
    const ry = y + 62 + i * rowH;
    const on = loc.id === getLocale();
    items.push(roundedBox(scene, x + 16, ry, cardW - 32, rowH - 8, on ? COLORS.primary : COLORS.background, 14).setDepth(depth + 2));
    items.push(label(scene, x + 36, ry + 12, loc.name, { size: 22, bold: true, color: on ? COLORS.onPrimary : COLORS.text }).setDepth(depth + 3));
    if (on) items.push(label(scene, x + cardW - 40, ry + 12, '✓', { size: 22, bold: true, color: COLORS.onPrimary }).setOrigin(1, 0).setDepth(depth + 3));
    const hit = hitArea(scene, x + 16, ry, cardW - 32, rowH - 8, () => {
      setLocale(loc.id);
      close();
      scene.scene.restart();
    }).setDepth(depth + 4);
    items.push(hit);
  });
}
