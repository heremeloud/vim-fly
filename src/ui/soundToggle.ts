import Phaser from 'phaser';
import { setSoundEnabled, soundEnabled } from '../audio/sfx';
import { t } from '../i18n';
import { COLORS } from './theme';
import { label, roundedBox } from './widgets';

/** Height taken by the toggle: the small heading plus the 50 px box. */
export const SOUND_TOGGLE_HEIGHT = 26 + 50;

/**
 * The sound on/off control, drawn the same way everywhere (welcome card and settings): a small "Sound" heading
 * and a tappable box showing the speaker icon and On/Off. `y` is the top of the heading. Every object is passed
 * through `add` so the caller can destroy them with the rest of its overlay.
 */
export function addSoundToggle(scene: Phaser.Scene, add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, depth: number): void {
  add(label(scene, x, y, t('settings.sound'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));
  add(roundedBox(scene, x, y + 26, w, 50, COLORS.background, 14).setDepth(depth + 2));
  const text = add(label(scene, x + 16, y + 51, '', { size: 20, bold: true }).setOrigin(0, 0.5).setDepth(depth + 3));
  const show = (): void => {
    text.setText(`${soundEnabled() ? '🔊' : '🔇'}  ${t(soundEnabled() ? 'settings.on' : 'settings.off')}`);
  };
  show();
  add(scene.add.rectangle(x, y + 26, w, 50, 0x000000, 0).setOrigin(0).setDepth(depth + 4).setInteractive({ useHandCursor: true })).on('pointerup', () => {
    setSoundEnabled(scene.game, !soundEnabled());
    show();
  });
}
