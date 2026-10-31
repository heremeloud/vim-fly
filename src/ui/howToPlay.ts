import Phaser from 'phaser';
import { t } from '../i18n';
import { drawIcon, type IconId } from './icons';
import { COLORS, RADIUS } from './theme';
import { label, roundedBox } from './widgets';

const STEPS: { icon: IconId; key: 'onboard.tap' | 'onboard.catch' | 'onboard.swipe'; tint: number }[] = [
  { icon: 'tap', key: 'onboard.tap', tint: COLORS.lavenderSoft },
  { icon: 'bread', key: 'onboard.catch', tint: COLORS.primarySoft },
  { icon: 'swipe', key: 'onboard.swipe', tint: COLORS.mintSoft },
];

/** Height of the "How to play" block below its heading: three 64 px rows 12 px apart. */
export const HOW_TO_PLAY_ROWS_HEIGHT = 64 * 3 + 12 * 2;

/** The three "How to play" rows (shared by the welcome card and settings). `y` is the top of the first row. */
export function addHowToPlay(scene: Phaser.Scene, add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, depth: number): void {
  STEPS.forEach((step, i) => {
    const ry = y + i * 76;
    // The first row, the one thing you must know (tap left or right), stands out: butter fill, a butter outline and bold text.
    const key = i === 0;
    add(roundedBox(scene, x, ry, w, 64, key ? COLORS.primarySoft : COLORS.background, RADIUS.control, key ? COLORS.primary : undefined).setDepth(depth + 2));
    add(roundedBox(scene, x + 10, ry + 10, 44, 44, step.tint, RADIUS.control).setDepth(depth + 2));
    add(drawIcon(scene, step.icon, x + 32, ry + 32, COLORS.onPrimary).setDepth(depth + 3));
    add(label(scene, x + 68, ry + 32, t(step.key), { size: 13, wrap: w - 82, bold: key }).setOrigin(0, 0.5).setDepth(depth + 3));
  });
}

/**
 * A keyboard reminder on the "How to Play" heading line, drawn as icons and key caps so it needs no translation:
 * tap icon + A/D or the arrows (flap), swipe icon + Shift (dodge, held with the same keys).
 * Touch screens have no use for it, so it is left out there. `y` is the top of the heading line.
 */
export function addKeyboardHint(scene: Phaser.Scene, add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, depth: number): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const capH = 22;
  const cy = y + 12;
  const cap = (text: string, cx: number, capW: number): void => {
    add(roundedBox(scene, cx - capW, cy - capH / 2, capW, capH, COLORS.surface, 5, COLORS.border).setDepth(depth + 2));
    add(label(scene, cx - capW / 2, cy, text, { size: 10, bold: true, color: COLORS.muted }).setOrigin(0.5).setDepth(depth + 3));
  };
  // The tap hand is drawn a little below its centre (its taps rise above it), so it is lifted to sit level with the caps.
  const icon = (id: IconId, cx: number): void => {
    add(drawIcon(scene, id, cx - 9, id === 'tap' ? cy - 3 : cy, COLORS.muted, { width: 2.6 }).setScale(0.8).setDepth(depth + 3));
  };
  // Built right to left from the card's edge: tap and its keys, then swipe and Shift.
  let cx = x + w;
  cap('Shift', cx, 40); cx -= 44;
  icon('swipe', cx); cx -= 32;
  cap('D/→', cx, 34); cx -= 37;
  cap('A/←', cx, 34); cx -= 37;
  icon('tap', cx);
}
