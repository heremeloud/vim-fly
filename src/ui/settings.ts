import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/constants';
import { getPlayerName } from '../leaderboard/playerName';
import { t } from '../i18n';
import { COLORS, FONT } from './theme';
import { button, label, roundedBox } from './widgets';

const CARD = { x: 30, y: 120, w: GAME_WIDTH - 60, h: 560 };

/** Settings overlay opened from the home header. For now it only shows how to play; real options come later. */
export function openSettings(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    items.push(o);
    return o;
  };
  const close = (): void => items.forEach((o) => o.destroy());

  add(scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0).setDepth(depth).setInteractive().on('pointerup', close));
  add(roundedBox(scene, CARD.x, CARD.y, CARD.w, CARD.h, COLORS.surface, 22).setDepth(depth + 1).setInteractive());
  add(label(scene, GAME_WIDTH / 2, CARD.y + 26, `⚙ ${t('settings.title')}`, { size: 26, bold: true, align: 'center' }).setOrigin(0.5, 0).setDepth(depth + 2));
  add(label(scene, GAME_WIDTH / 2, CARD.y + 68, t('settings.soon'), { size: 14, color: COLORS.muted, align: 'center', wrap: CARD.w - 40 }).setOrigin(0.5, 0).setDepth(depth + 2));

  const x = CARD.x + 30;
  const w = CARD.w - 60;
  add(label(scene, x, CARD.y + 112, t('onboard.nameLabel'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));
  add(roundedBox(scene, x, CARD.y + 138, w, 50, COLORS.background, 14).setDepth(depth + 2));
  add(label(scene, x + 16, CARD.y + 163, getPlayerName() ?? '—', { size: 20, bold: true, wrap: w - 32 }).setOrigin(0, 0.5).setDepth(depth + 3));

  add(label(scene, x, CARD.y + 212, t('onboard.howTitle'), { size: 18, bold: true }).setDepth(depth + 2));
  const steps = [
    ['👆', t('onboard.tap')],
    ['🍞', t('onboard.catch')],
    ['💨', t('onboard.swipe')],
  ];
  steps.forEach(([icon, text], i) => {
    const y = CARD.y + 254 + i * 76;
    add(roundedBox(scene, x, y, w, 64, COLORS.background, 14).setDepth(depth + 2));
    add(scene.add.text(x + 28, y + 32, icon, { fontFamily: FONT.family, fontSize: '26px' }).setOrigin(0.5).setDepth(depth + 3));
    add(label(scene, x + 56, y + 32, text, { size: 14, wrap: w - 70 }).setOrigin(0, 0.5).setDepth(depth + 3));
  });

  // Buttons draw at depth 0, so lift everything they added above the card.
  const before = scene.children.length;
  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 46, 300, 58, t('settings.close'), close);
  scene.children.list.slice(before).forEach((o) => {
    (o as Phaser.GameObjects.GameObject & { setDepth: (d: number) => void }).setDepth(depth + 3);
    items.push(o);
  });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);
}
