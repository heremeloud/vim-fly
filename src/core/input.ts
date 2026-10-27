import Phaser from 'phaser';
import { GAME_WIDTH } from './constants';
import { toLayout } from './render';

export type Steer = -1 | 1;

const LEFT_KEYS = ['LEFT', 'A'];
const RIGHT_KEYS = ['RIGHT', 'D'];

/**
 * Left half of the screen / left arrow / A  => -1 (flap up, drift left)
 * Right half of the screen / right arrow / D => +1 (flap up, drift right)
 *
 * Listeners are removed when the scene shuts down, so restarting a scene
 * never stacks duplicate handlers.
 */
export function bindSteering(scene: Phaser.Scene, onSteer: (dir: Steer) => void): void {
  const onPointer = (p: Phaser.Input.Pointer) => onSteer(toLayout(p.x) < GAME_WIDTH / 2 ? -1 : 1);
  scene.input.on('pointerdown', onPointer);

  const kb = scene.input.keyboard;
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key.replace('Arrow', '').toUpperCase();
    if (LEFT_KEYS.includes(key)) onSteer(-1);
    else if (RIGHT_KEYS.includes(key)) onSteer(1);
  };
  kb?.on('keydown', onKey);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointerdown', onPointer);
    kb?.off('keydown', onKey);
  });
}
