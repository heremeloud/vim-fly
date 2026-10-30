import Phaser from 'phaser';
import { GAME_WIDTH, PHYSICS } from './constants';
import { toLayout } from './render';

export type Steer = -1 | 1;

const LEFT_KEYS = ['LEFT', 'A'];
const RIGHT_KEYS = ['RIGHT', 'D'];

/**
 * Swipe left/right (or hold Shift while pressing an arrow key / A / D) => emergency dash.
 * Left half of the screen / left arrow / A  => -1 (flap up, drift left)
 * Right half of the screen / right arrow / D => +1 (flap up, drift right)
 *
 * Listeners are removed when the scene shuts down, so restarting a scene
 * never stacks duplicate handlers.
 */
export function bindSteering(scene: Phaser.Scene, onSteer: (dir: Steer) => void, onSwipe?: (dir: Steer) => void): void {
  const onPointer = (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[] = []) => {
    if (over.length) return; // a tap on a button is not a flap
    onSteer(toLayout(p.x) < GAME_WIDTH / 2 ? -1 : 1);
  };
  scene.input.on('pointerdown', onPointer);

  // A quick mostly-horizontal drag is a swipe.
  const onRelease = (p: Phaser.Input.Pointer) => {
    if (!onSwipe) return;
    const dx = toLayout(p.upX - p.downX);
    const dy = toLayout(p.upY - p.downY);
    if (Math.abs(dx) >= PHYSICS.swipeMinPx && Math.abs(dx) > Math.abs(dy) && p.upTime - p.downTime < 500) onSwipe(dx < 0 ? -1 : 1);
  };
  scene.input.on('pointerup', onRelease);

  const kb = scene.input.keyboard;
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key.replace('Arrow', '').toUpperCase();
    const dir = LEFT_KEYS.includes(key) ? -1 : RIGHT_KEYS.includes(key) ? 1 : 0;
    if (!dir) return;
    onSteer(dir);
    if (e.shiftKey) onSwipe?.(dir); // Hold Shift and press a direction key = the same dash as a swipe.

  };
  kb?.on('keydown', onKey);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointerdown', onPointer);
    scene.input.off('pointerup', onRelease);
    kb?.off('keydown', onKey);
  });
}
