import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
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
    wordWrap: wrap ? { width: wrap } : undefined,
    align,
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
  r.on('pointerup', onTap);
  return r;
}

/** A pill-shaped call-to-action button, centered on (cx, cy). */
export function button(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  text: string,
  onTap: () => void,
): void {
  const x = cx - w / 2;
  const y = cy - h / 2;
  roundedBox(scene, x, y + 4, w, h, COLORS.primaryDark, h / 2); // shadow
  roundedBox(scene, x, y, w, h, COLORS.primary, h / 2);
  label(scene, cx, cy, text, { size: 26, color: 0xffffff, bold: true }).setOrigin(0.5);
  hitArea(scene, x, y, w, h, onTap);
}

export type TabId = 'store' | 'menu' | 'orders' | 'promos';

const TABS: { id: TabId; icon: string; text: string }[] = [
  { id: 'store', icon: '🏠', text: 'Store' },
  { id: 'menu', icon: '📖', text: 'Menu' },
  { id: 'orders', icon: '🧾', text: 'Orders' },
  { id: 'promos', icon: '🎁', text: 'Promos' },
];

const TAB_TARGETS: Record<TabId, { scene: string; data?: object }> = {
  store: { scene: SCENES.home },
  menu: { scene: SCENES.menu },
  orders: { scene: SCENES.comingSoon, data: { title: 'Order history', note: 'Your best runs will show up here.' } },
  promos: { scene: SCENES.comingSoon, data: { title: 'Promotions', note: 'Series links and socials will show up here.' } },
};

/** The bottom tab bar, drawn above scrolling content. */
export function tabBar(scene: Phaser.Scene, active: TabId): void {
  const y = GAME_HEIGHT - TAB_BAR_HEIGHT;
  const depth = 50;
  scene.add.rectangle(0, y, GAME_WIDTH, TAB_BAR_HEIGHT, COLORS.surface).setOrigin(0).setDepth(depth);
  scene.add.rectangle(0, y, GAME_WIDTH, 2, COLORS.border).setOrigin(0).setDepth(depth);

  const w = GAME_WIDTH / TABS.length;
  TABS.forEach((tab, i) => {
    const cx = i * w + w / 2;
    const on = tab.id === active;
    scene.add.text(cx, y + 26, tab.icon, { fontSize: '26px' }).setOrigin(0.5).setDepth(depth).setAlpha(on ? 1 : 0.5);
    label(scene, cx, y + 56, tab.text, { size: 14, color: on ? COLORS.primary : COLORS.muted, bold: on })
      .setOrigin(0.5)
      .setDepth(depth);
    const hit = hitArea(scene, i * w, y, w, TAB_BAR_HEIGHT, () => {
      if (on) return;
      const t = TAB_TARGETS[tab.id];
      scene.scene.start(t.scene, t.data);
    });
    hit.setDepth(depth + 1);
  });
}
