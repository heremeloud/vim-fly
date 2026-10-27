import Phaser from 'phaser';
import { GAME_WIDTH } from './constants';

export type Steer = -1 | 1;

/**
 * Left half of the screen / left arrow / A  => -1 (flap up, drift left)
 * Right half of the screen / right arrow / D => +1 (flap up, drift right)
 */
export function bindSteering(scene: Phaser.Scene, onSteer: (dir: Steer) => void): void {
  scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
    onSteer(p.x < GAME_WIDTH / 2 ? -1 : 1);
  });

  const kb = scene.input.keyboard;
  if (!kb) return;
  const left = [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A];
  const right = [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D];
  for (const code of left) kb.addKey(code).on('down', () => onSteer(-1));
  for (const code of right) kb.addKey(code).on('down', () => onSteer(1));
}
