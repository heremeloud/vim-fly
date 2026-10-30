import Phaser from 'phaser';

/** Line icons drawn in code, so they look the same on every device (emoji change with the platform). */
export type IconId =
  | 'home'
  | 'menu'
  | 'orders'
  | 'gift'
  | 'gear'
  | 'globe'
  | 'search'
  | 'chevronDown'
  | 'chevronRight'
  | 'check'
  | 'speaker'
  | 'speakerOff'
  | 'pause'
  | 'play'
  | 'tap'
  | 'bread'
  | 'swipe'
  | 'cart'
  | 'box'
  | 'scooter'
  | 'crown'
  | 'share';

type Pt = [number, number];
const pts = (list: Pt[]): Phaser.Math.Vector2[] => list.map(([x, y]) => new Phaser.Math.Vector2(x, y));

/**
 * Draw an icon centred on (x, y) inside a box of about 24 px. Strokes only (the crown is also filled with
 * `fill`), so one `color` is enough and the icon can be tinted to match the text next to it.
 */
export function drawIcon(scene: Phaser.Scene, id: IconId, x: number, y: number, color: number, opts: { width?: number; fill?: number } = {}): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setPosition(x, y);
  g.lineStyle(opts.width ?? 2.2, color, 1);
  const line = (list: Pt[], close = false): void => {
    g.strokePoints(pts(list), close, close);
  };
  switch (id) {
    case 'home':
      line([[-10, 0], [0, -8], [10, 0]]);
      g.strokeRoundedRect(-7, 0, 14, 10, 2);
      break;
    case 'menu': // a serving dome on a plate
      g.beginPath();
      g.arc(0, 5, 10, Math.PI, Math.PI * 2);
      g.strokePath();
      line([[-12, 5], [12, 5]]);
      line([[-9, 9], [9, 9]]);
      line([[0, -5], [0, -8]]);
      g.fillStyle(color, 1).fillCircle(0, -9, 1.8);
      break;
    case 'orders': // a receipt with a torn bottom edge
      line([[-8, -10], [8, -10], [8, 10], [4, 7], [0, 10], [-4, 7], [-8, 10]], true);
      line([[-4, -5], [4, -5]]);
      line([[-4, -1], [4, -1]]);
      line([[-4, 3], [0, 3]]);
      break;
    case 'gift':
      g.strokeRoundedRect(-10, -4, 20, 14, 3);
      line([[0, -4], [0, 10]]);
      line([[-10, 1], [10, 1]]);
      line([[0, -4], [-6, -9], [-8, -6], [0, -4]]);
      line([[0, -4], [6, -9], [8, -6], [0, -4]]);
      break;
    case 'gear':
      g.strokeCircle(0, 0, 4);
      g.strokeCircle(0, 0, 8);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        line([[Math.cos(a) * 8, Math.sin(a) * 8], [Math.cos(a) * 11, Math.sin(a) * 11]]);
      }
      break;
    case 'globe':
      g.strokeCircle(0, 0, 10);
      g.strokeEllipse(0, 0, 10, 20);
      line([[-10, 0], [10, 0]]);
      line([[-8, -5], [8, -5]]);
      line([[-8, 5], [8, 5]]);
      break;
    case 'search':
      g.strokeCircle(-2, -2, 7);
      line([[3, 3], [9, 9]]);
      break;
    case 'chevronDown':
      line([[-5, -2], [0, 3], [5, -2]]);
      break;
    case 'chevronRight':
      line([[-3, -6], [3, 0], [-3, 6]]);
      break;
    case 'check':
      line([[-7, 0], [-2, 5], [7, -6]]);
      break;
    case 'speaker':
    case 'speakerOff':
      line([[-10, -4], [-5, -4], [1, -9], [1, 9], [-5, 4], [-10, 4]], true);
      if (id === 'speaker') {
        g.beginPath();
        g.arc(2, 0, 6, -0.9, 0.9);
        g.strokePath();
        g.beginPath();
        g.arc(2, 0, 11, -0.9, 0.9);
        g.strokePath();
      } else {
        line([[5, -4], [11, 4]]);
        line([[11, -4], [5, 4]]);
      }
      break;
    case 'pause':
      g.fillStyle(color, 1).fillRoundedRect(-7, -8, 5, 16, 1.5).fillRoundedRect(2, -8, 5, 16, 1.5);
      break;
    case 'play':
      g.fillStyle(color, 1).fillPoints(pts([[-5, -9], [-5, 9], [9, 0]]), true);
      break;
    case 'tap': {
      // A hand with the index finger out, tapping, and three little taps radiating from the fingertip.
      const hand: Pt[] = [
        [-1.4, -6], [-1.1, -8], [0.6, -9], [2.3, -8], [2.7, -6], [2.7, 0], [7, -0.5], [9.5, 1], [10, 3], [10, 7],
        [8, 11], [5, 13], [-2, 13], [-5, 10], [-9, 4], [-8, 2], [-6, 3], [-1.4, 6],
      ];
      g.setY(y + 2);
      line(hand, true);
      line([[-7, -9], [-10, -11]]);
      line([[0.5, -12], [0.5, -15]]);
      line([[8, -9], [11, -11]]);
      break;
    }
    case 'bread':
      g.strokeRoundedRect(-11, -6, 22, 15, { tl: 8, tr: 8, bl: 3, br: 3 });
      line([[-5, -2], [-3, 3]]);
      line([[0, -2], [2, 3]]);
      line([[5, -2], [7, 3]]);
      break;
    case 'swipe':
      line([[-11, 0], [9, 0]]);
      line([[3, -6], [10, 0], [3, 6]]);
      line([[-11, -7], [-4, -7]]);
      line([[-11, 7], [-4, 7]]);
      break;
    case 'cart':
      line([[-12, -9], [-8, -9], [-4, 4], [8, 4], [10, -5], [-7, -5]]);
      g.strokeCircle(-2, 9, 2);
      g.strokeCircle(7, 9, 2);
      break;
    case 'box': // "Express": a lightning bolt
      line([[3, -11], [-7, 2], [-1, 2], [-3, 11], [7, -3], [1, -3]], true);
      break;
    case 'scooter':
      g.strokeCircle(-8, 7, 4);
      g.strokeCircle(9, 7, 4);
      line([[-8, 7], [-2, 7], [3, 0], [3, -9]]);
      line([[0, -9], [7, -9]]);
      line([[3, 0], [9, 7]]);
      line([[-10, -1], [-3, -1]]);
      break;
    case 'share': // three dots joined by lines, the usual share symbol
      line([[-6, 0], [6, -7]]);
      line([[-6, 0], [6, 7]]);
      g.fillStyle(opts.fill ?? color, 1);
      g.fillCircle(-6, 0, 3.2).fillCircle(6, -7, 3.2).fillCircle(6, 7, 3.2);
      break;
    case 'crown': {
      const crown: Pt[] = [[-10, 7], [-10, -5], [-4, 1], [0, -8], [4, 1], [10, -5], [10, 7]];
      if (opts.fill !== undefined) g.fillStyle(opts.fill, 1).fillPoints(pts(crown), true);
      line(crown, true);
      break;
    }
  }
  return g;
}
