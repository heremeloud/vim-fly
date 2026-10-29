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
    add(roundedBox(scene, x, ry, w, 64, COLORS.background, RADIUS.control).setDepth(depth + 2));
    add(roundedBox(scene, x + 10, ry + 10, 44, 44, step.tint, RADIUS.control).setDepth(depth + 2));
    add(drawIcon(scene, step.icon, x + 32, ry + 32, COLORS.onPrimary).setDepth(depth + 3));
    add(label(scene, x + 68, ry + 32, t(step.key), { size: 14, wrap: w - 82 }).setOrigin(0, 0.5).setDepth(depth + 3));
  });
}
