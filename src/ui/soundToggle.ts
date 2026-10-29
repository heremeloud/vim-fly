import Phaser from 'phaser';
import { setSoundEnabled, soundEnabled } from '../audio/sfx';
import { t } from '../i18n';
import { drawIcon } from './icons';
import { COLORS, RADIUS } from './theme';
import { label, roundedBox } from './widgets';

/** Height taken by the toggle: the small heading plus the 50 px box. */
export const SOUND_TOGGLE_HEIGHT = 26 + 50;

/**
 * The sound on/off control, drawn the same way everywhere (welcome card and settings): a small "Sound" heading
 * and a tappable box showing a speaker, On/Off and a switch. `y` is the top of the heading. Every object is passed
 * through `add` so the caller can destroy them with the rest of its overlay.
 */
export function addSoundToggle(scene: Phaser.Scene, add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, depth: number): void {
  add(label(scene, x, y, t('settings.sound'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));
  add(roundedBox(scene, x, y + 26, w, 50, COLORS.background, RADIUS.control).setDepth(depth + 2));
  const cy = y + 51;
  const text = add(label(scene, x + 52, cy, '', { size: 20, bold: true }).setOrigin(0, 0.5).setDepth(depth + 3));
  const knob = add(scene.add.graphics().setDepth(depth + 3));
  let icon: Phaser.GameObjects.Graphics | null = null;
  const show = (): void => {
    const on = soundEnabled();
    text.setText(t(on ? 'settings.on' : 'settings.off'));
    icon?.destroy();
    icon = add(drawIcon(scene, on ? 'speaker' : 'speakerOff', x + 28, cy, COLORS.text).setDepth(depth + 3));
    // The switch: butter track with the knob on the right when on, a plain track with the knob on the left when off.
    const sx = x + w - 66;
    knob.clear();
    knob.fillStyle(on ? COLORS.primary : COLORS.border, 1).fillRoundedRect(sx, cy - 13, 48, 26, 13);
    knob.lineStyle(2, on ? COLORS.primaryDark : COLORS.muted, 1).strokeRoundedRect(sx, cy - 13, 48, 26, 13);
    knob.fillStyle(on ? COLORS.onPrimary : COLORS.surface, 1).fillCircle(on ? sx + 35 : sx + 13, cy, 9);
  };
  show();
  add(scene.add.rectangle(x, y + 26, w, 50, 0x000000, 0).setOrigin(0).setDepth(depth + 4).setInteractive({ useHandCursor: true })).on('pointerup', () => {
    setSoundEnabled(scene.game, !soundEnabled());
    show();
  });
}
