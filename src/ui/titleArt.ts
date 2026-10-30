import Phaser from 'phaser';
import { COLORS } from './theme';

/** A paw print centred on (x, y): one big pad and four toes, `size` px across. Drawn in code, in a single colour. */
export function drawPaw(scene: Phaser.Scene, x: number, y: number, size: number, color: number, alpha = 1): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(color, alpha);
  const u = size / 10;
  g.fillEllipse(x, y + 2.2 * u, 5.6 * u, 4.6 * u); // the pad
  g.fillEllipse(x - 3.4 * u, y - 1.2 * u, 2.2 * u, 3 * u); // the toes, outer two a little lower
  g.fillEllipse(x - 1.2 * u, y - 3.2 * u, 2.2 * u, 3.2 * u);
  g.fillEllipse(x + 1.2 * u, y - 3.2 * u, 2.2 * u, 3.2 * u);
  g.fillEllipse(x + 3.4 * u, y - 1.2 * u, 2.2 * u, 3 * u);
  return g;
}

/**
 * A tiny bee: just a plump body and two outlined wings, in the one dark colour. (x, y) is the centre of the body and
 * `size` is the body's length in px.
 */
export function drawBee(scene: Phaser.Scene, x: number, y: number, size: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const u = size / 14;
  const line = COLORS.onPrimary;
  g.lineStyle(1.2, line, 0.9);
  g.strokeEllipse(x - 2.6 * u, y - 5.6 * u, 4.8 * u, 7 * u); // the wings, outline only, tilted a little apart
  g.strokeEllipse(x + 2.2 * u, y - 6.2 * u, 4.8 * u, 7 * u);
  g.fillStyle(line, 1).fillEllipse(x, y, 14 * u, 9.5 * u); // the body
  return g;
}
