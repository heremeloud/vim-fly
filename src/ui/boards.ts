import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { COLORS, hex } from './theme';
import { fitWidth } from './widgets';

/** Finale announcements drawn as a signboard instead of the plain yellow pill (see `drawBoard`). */
export type BannerBoard = 'road' | 'chalk' | 'tag' | 'memo' | 'plaque' | 'bubble' | 'baguette' | 'treadmill' | 'pillow';
export const FINALE_BOARD: Readonly<Record<string, BannerBoard>> = {
  ruralRoad: 'road', // "Don't crash!"
  cafes: 'chalk', // "Coffee rush!"
  mall: 'tag', // "Shopping spree!"
  lawOffice: 'memo', // "Paperwork pile-up!"
  courtroom: 'plaque', // "Order in the court!"
  gym: 'treadmill', // "Pump it up!"
  residence: 'pillow', // "Cozy night in!"
  bakery: 'baguette', // "Fresh from the oven!": a long loaf
  aquarium: 'bubble', // a line from the series, so it is shown as someone saying it
};
/** Text and spacing for each board: text color, capitals, no outline on the letters, a sideways nudge and extra width. */
export const BOARD_LOOK: Readonly<Record<BannerBoard, { text: number; upper?: boolean; thin?: boolean; textX?: number; extra?: number; wrap?: number; size?: number; pad?: number; vpad?: number; lineSpacing?: number }>> = {
  road: { text: 0x1c1c1c, upper: true }, // black on warning yellow, like the real thing
  chalk: { text: 0xfff6e8, thin: true },
  tag: { text: COLORS.onPrimary, textX: 10, extra: 22 },
  memo: { text: COLORS.onPrimary, extra: 14 },
  plaque: { text: 0xf6dc8a, upper: true, extra: 10 },
  treadmill: { text: 0x9dffb0, thin: true, textX: -6, extra: 76 }, // green LED lettering on the console screen
  pillow: { text: 0xfffaf0, thin: true, extra: 56 }, // night-blue with cream words, so it differs from the pink tag
  baguette: { text: 0x4a2a14, pad: 30, extra: 30 }, // snug: just room at each end for one scoring cut
  bubble: { text: COLORS.onPrimary, wrap: 340, size: 24, pad: 30, vpad: 14, lineSpacing: -8 }, // snug: little room around and between the lines // a long spoken line: wraps onto two lines inside a speech bubble
};

/**
 * Set the banner's text and draw its background for `text`. Used by the game's location banners and by the admin
 * effects page, so what you preview there is exactly what plays in a run. The shapes are centred on (0, 0).
 */
export function layoutBanner(bg: Phaser.GameObjects.Graphics, name: Phaser.GameObjects.Text, text: string, big: boolean, board?: BannerBoard): void {
  const look = board ? BOARD_LOOK[board] : null;
  const pad = look?.pad ?? (big ? 56 : 28);
  const line = look?.wrap ? text : text.replace('\n', '  ·  '); // a spoken line keeps the line break its translation chose
  name.setScale(1).setFontSize(look?.size ?? (big ? 32 : 17)).setAlign('center').setLineSpacing(look?.lineSpacing ?? 0).setWordWrapWidth(null as unknown as number).setText(look?.upper ? line.toUpperCase() : line);
  if (look?.wrap && !line.includes('\n') && name.width > look.wrap) {
    // Too long for one line: split it into two balanced lines rather than filling the first and leaving a stub
    // (a fixed width splits mixed Latin and Japanese text in odd places).
    name.setWordWrapWidth(Math.ceil(name.width / 2) + 28, true).setText(name.text);
  }
  name.setColor(hex(look?.text ?? COLORS.text)).setStroke(hex(look?.text ?? COLORS.text), look?.thin ? 0 : 1).setX(look?.textX ?? 0);
  fitWidth(name, GAME_WIDTH - 24 - pad, 0.6); // a long line shrinks to fit the pill
  const w = Math.min(GAME_WIDTH - 24, name.displayWidth + pad + (look?.extra ?? 0));
  const h = look?.wrap ? name.displayHeight + (look.vpad ?? 26) : big ? 60 : 32;
  bg.clear();
  if (board) {
    drawBoard(bg, board, w, h + 4);
    return;
  }
  if (big) {
    bg.fillStyle(0x000000, 0.18).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2); // soft shadow
    bg.fillStyle(COLORS.primary, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    bg.lineStyle(4, COLORS.onPrimary, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  } else {
    bg.fillStyle(COLORS.background, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    bg.lineStyle(2.5, COLORS.onPrimary, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  }
}

/** The finale announcements that are a signboard of their own, each drawn to suit its location. `w` and `h` are the board's size. */
export function drawBoard(g: Phaser.GameObjects.Graphics, board: BannerBoard, w: number, h: number): void {
    const ink = COLORS.onPrimary;
    g.fillStyle(0x000000, 0.18).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 10); // soft shadow under every board
    if (board === 'road') {
    // A warning sign on a galvanised post: signal yellow, a black border and inner rule, four bolts.
    const yellow = 0xf9c80e;
    const black = 0x1c1c1c;
    g.fillStyle(0x9aa1a6, 1).fillRect(-5, h / 2 - 2, 10, 46).lineStyle(2, black, 1).strokeRect(-5, h / 2 - 2, 10, 46);
    g.fillStyle(0xd3d8db, 1).fillRect(-3, h / 2, 2.5, 44); // a highlight down the post
    g.fillStyle(yellow, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(4, black, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2.5, black, 1).strokeRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 5);
    g.fillStyle(black, 1);
    for (const bx of [-w / 2 + 15, w / 2 - 15]) for (const by of [-h / 2 + 15, h / 2 - 15]) g.fillCircle(bx, by, 1.6);
    } else if (board === 'chalk') {
      // A cafe's chalkboard: dark slate in a wooden frame, a chalk squiggle underneath.
      g.fillStyle(0x3b302a, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(6, COLORS.primaryDark, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1.8, 0xfff6e8, 0.75);
      const y = h / 2 - 9;
      g.beginPath().moveTo(-w / 2 + 22, y);
      for (let i = 1; i <= 8; i++) g.lineTo(-w / 2 + 22 + ((w - 44) * i) / 8, y + (i % 2 ? -2.5 : 2.5));
      g.strokePath();
    } else if (board === 'tag') {
      // A sale price tag: pointed on the left with a punched hole.
      const x0 = -w / 2;
      const pts = [new Phaser.Math.Vector2(x0 + 22, -h / 2), new Phaser.Math.Vector2(w / 2, -h / 2), new Phaser.Math.Vector2(w / 2, h / 2), new Phaser.Math.Vector2(x0 + 22, h / 2), new Phaser.Math.Vector2(x0, 0)];
      g.fillStyle(COLORS.pink, 1).fillPoints(pts, true);
      g.lineStyle(4, ink, 1).strokePoints(pts, true, true);
      g.fillStyle(COLORS.background, 1).fillCircle(x0 + 18, 0, 5.5).lineStyle(2, ink, 1).strokeCircle(x0 + 18, 0, 5.5);
    } else if (board === 'baguette') {
      // A baguette, kept simple: a golden capsule with a darker crust line and a scoring cut at each end, clear in the middle for the words.
      const r = h / 2;
      g.fillStyle(0xeab85f, 1).fillRoundedRect(-w / 2, -h / 2, w, h, r);
      g.lineStyle(3.5, 0x8a5a24, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      for (const side of [-1, 1]) {
        for (let i = 0; i < 1; i++) {
          const x = side * (w / 2 - r - 2 - i * 20) - 5;
          const cut = [new Phaser.Math.Vector2(x, -h / 2 + 12), new Phaser.Math.Vector2(x + 6, -h / 2 + 12), new Phaser.Math.Vector2(x + 14, h / 2 - 12), new Phaser.Math.Vector2(x + 8, h / 2 - 12)];
          g.fillStyle(0xf7dca0, 1).fillPoints(cut, true);
        }
      }
    } else if (board === 'treadmill') {
      // Just the console: a dark body, a green LED screen for the words, a small speed graph and two buttons beside it.
      const black = 0x1c1c1c;
      g.fillStyle(0x3a3a42, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.lineStyle(3.5, black, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.fillStyle(0x142218, 1).fillRoundedRect(-w / 2 + 34, -h / 2 + 7, w - 34 - 46, h - 14, 6);
      g.lineStyle(2, 0x5d6168, 1).strokeRoundedRect(-w / 2 + 34, -h / 2 + 7, w - 34 - 46, h - 14, 6);
      g.fillStyle(0x4cc46a, 1); // a little speed graph on the left
      for (const [i, bh] of [8, 13, 18].entries()) g.fillRect(-w / 2 + 10 + i * 7, h / 2 - 12 - bh, 5, bh);
      const bx = w / 2 - 23; // two buttons on the right, stop and start, with room around them
      g.fillStyle(0xd94c4c, 1).fillCircle(bx, -9, 7).lineStyle(1.8, black, 1).strokeCircle(bx, -9, 7);
      g.fillStyle(0x4cc46a, 1).fillCircle(bx, 11, 7).strokeCircle(bx, 11, 7);
    } else if (board === 'pillow') {
      // A scatter cushion for a cosy night in: night-blue with stitching, puffy corners and a couple of stars.
      const edge = 0x3f4f86;
      const body = 0x6c7fb8;
      const pw = w - 12;
      const ph = h - 6;
      g.fillStyle(body, 1);
      for (const cx of [-pw / 2, pw / 2]) for (const cy of [-ph / 2, ph / 2]) g.fillCircle(cx, cy, 9).lineStyle(3, edge, 1).strokeCircle(cx, cy, 9);
      g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 14);
      g.lineStyle(3.5, edge, 1).strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 14);
      g.fillStyle(body, 1).fillRoundedRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, ph - 4, 12); // hide the corner outlines inside the cushion
      g.fillCircle(-pw / 2 + 1, -ph / 2 + 1, 6).fillCircle(pw / 2 - 1, -ph / 2 + 1, 6).fillCircle(-pw / 2 + 1, ph / 2 - 1, 6).fillCircle(pw / 2 - 1, ph / 2 - 1, 6);
      g.lineStyle(2, 0xfff6ee, 0.85);
      for (let x = -pw / 2 + 18; x < pw / 2 - 20; x += 12) {
        g.lineBetween(x, -ph / 2 + 7, x + 6, -ph / 2 + 7);
        g.lineBetween(x, ph / 2 - 7, x + 6, ph / 2 - 7);
      }
      const star = (sx: number, sy: number, r: number): void => {
        const pts: Phaser.Math.Vector2[] = [];
        for (let i = 0; i < 8; i++) pts.push(new Phaser.Math.Vector2(sx + Math.cos((i * Math.PI) / 4) * (i % 2 ? r * 0.35 : r), sy + Math.sin((i * Math.PI) / 4) * (i % 2 ? r * 0.35 : r)));
        g.fillStyle(0xfff0b0, 1).fillPoints(pts, true);
      };
      star(-pw / 2 + 24, -2, 8);
      star(pw / 2 - 24, 2, 8);
    } else if (board === 'bubble') {
      // A speech bubble with its tail pointing down towards Vimmy.
      const tx = -w / 4;
      g.fillStyle(COLORS.surface, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 20);
      g.fillTriangle(tx - 12, h / 2 - 2, tx + 16, h / 2 - 2, tx - 14, h / 2 + 22);
      g.lineStyle(3.5, ink, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
      g.lineBetween(tx - 12, h / 2, tx - 14, h / 2 + 22).lineBetween(tx - 14, h / 2 + 22, tx + 16, h / 2);
      g.lineStyle(5, COLORS.surface, 1).lineBetween(tx - 10, h / 2 - 0.5, tx + 14, h / 2 - 0.5); // open the bubble where the tail joins
    } else if (board === 'memo') {
      // A sheet of paperwork: ruled lines, a folded corner and a paper clip.
      const fold = 16;
      const sheet = [new Phaser.Math.Vector2(-w / 2, -h / 2), new Phaser.Math.Vector2(w / 2 - fold, -h / 2), new Phaser.Math.Vector2(w / 2, -h / 2 + fold), new Phaser.Math.Vector2(w / 2, h / 2), new Phaser.Math.Vector2(-w / 2, h / 2)];
      g.fillStyle(0xfffdf7, 1).fillPoints(sheet, true);
      g.lineStyle(3, ink, 1).strokePoints(sheet, true, true);
      g.fillStyle(0xefdcc0, 1).fillTriangle(w / 2 - fold, -h / 2, w / 2 - fold, -h / 2 + fold, w / 2, -h / 2 + fold).lineStyle(2, ink, 1).strokeTriangle(w / 2 - fold, -h / 2, w / 2 - fold, -h / 2 + fold, w / 2, -h / 2 + fold);
      g.lineStyle(1.2, 0xbfd6e6, 1);
      for (const ly of [-h / 2 + 11, h / 2 - 11]) g.lineBetween(-w / 2 + 8, ly, w / 2 - 22, ly);
      g.lineStyle(2.4, 0x9a8c7a, 1).strokeRoundedRect(-w / 2 + 10, -h / 2 - 9, 9, 22, 4); // the paper clip
    } else {
      // A courtroom nameplate: dark wood, a gold double rule and corner screws.
      g.fillStyle(0x6b3f22, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(4, ink, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(2.5, 0xe6c15a, 1).strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4);
      g.fillStyle(0xe6c15a, 1);
      for (const bx of [-w / 2 + 14, w / 2 - 14]) for (const by of [-h / 2 + 14, h / 2 - 14]) g.fillCircle(bx, by, 1.8);
    }
}
