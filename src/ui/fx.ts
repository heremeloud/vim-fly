import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { emojiTextureKey } from '../core/emojiFile';
import { COLORS, FONT } from './theme';

/** The kick-off puff: little cream clouds thrown out behind Vimmy as a sideways dash starts at (x, y). */
export function dashBurst(scene: Phaser.Scene, x: number, y: number, dir: -1 | 1): void {
  for (let i = 0; i < 7; i++) {
    const puff = scene.add.circle(x - dir * 18, y + Phaser.Math.Between(-18, 22), Phaser.Math.Between(5, 10), i % 2 ? COLORS.surface : COLORS.primarySoft, 0.9).setDepth(4.4);
    scene.tweens.add({ targets: puff, x: puff.x - dir * Phaser.Math.Between(30, 80), y: puff.y + Phaser.Math.Between(-16, 16), scale: 0.2, alpha: 0, duration: Phaser.Math.Between(260, 420), ease: 'Cubic.easeOut', onComplete: () => puff.destroy() });
  }
}

/** While dashing: a fading butter-yellow afterimage of Vimmy (`textureKey`, `size` px) and a few speed streaks behind him. */
export function dashTrail(scene: Phaser.Scene, textureKey: string, x: number, y: number, dir: -1 | 1, size: number): void {
  const ghost = scene.add.image(x, y, textureKey).setDisplaySize(size, size).setTint(COLORS.primary).setAlpha(0.55).setDepth(4.5);
  scene.tweens.add({ targets: ghost, alpha: 0, scaleX: ghost.scaleX * 0.85, scaleY: ghost.scaleY * 0.85, duration: 280, onComplete: () => ghost.destroy() });
  for (let i = 0; i < 2; i++) {
    const len = Phaser.Math.Between(34, 70);
    const streak = scene.add.rectangle(x - dir * (24 + len / 2), y + Phaser.Math.Between(-30, 30), len, 3, i ? COLORS.surface : COLORS.primary, 0.85).setDepth(4.4);
    scene.tweens.add({ targets: streak, x: streak.x - dir * 50, scaleX: 0.3, alpha: 0, duration: 240, onComplete: () => streak.destroy() });
  }
}

/**
 * Comic speed lines for a fast climb (the helicopter): tapered streaks that come to a point at the top, fanned a little
 * away from Vimmy on both sides, They race downward past him and fade.
 * White with a dark outline so they show on every backdrop.
 */
export function climbSpeedLines(scene: Phaser.Scene, x: number, y: number, size: number): void {
  for (let i = 0; i < 2; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const len = Phaser.Math.Between(60, 110);
    const width = Phaser.Math.Between(5, 9);
    const lx = x + side * (size * 0.6 + Phaser.Math.Between(0, 80));
    const g = scene.add.graphics().setPosition(lx, y - Phaser.Math.Between(10, 90)).setDepth(4.4);
    // A slim blade: sharp tip up, a gentle belly, and a soft round tail.
    const blade = [
      new Phaser.Math.Vector2(0, -len / 2),
      new Phaser.Math.Vector2(width * 0.55, -len * 0.1),
      new Phaser.Math.Vector2(width * 0.5, len * 0.3),
      new Phaser.Math.Vector2(0, len / 2),
      new Phaser.Math.Vector2(-width * 0.5, len * 0.3),
      new Phaser.Math.Vector2(-width * 0.55, -len * 0.1),
    ];
    g.fillStyle(COLORS.surface, 0.8).fillPoints(blade, true);
    g.lineStyle(1, COLORS.text, 0.45).strokePoints(blade, true, true);
    g.setAngle(side * Phaser.Math.Between(1, 5)); // fan outward from Vimmy
    scene.tweens.add({ targets: g, y: g.y + 190 + Phaser.Math.Between(0, 60), scaleY: 1.35, alpha: 0, duration: 320 + Phaser.Math.Between(0, 140), ease: 'Quad.easeIn', onComplete: () => g.destroy() });
  }
}

/** Landing on the far wall: a quick ring and a few sparks. */
export function dashImpact(scene: Phaser.Scene, x: number, y: number, dir: -1 | 1, size: number): void {
  const px = x + dir * size * 0.4;
  const ring = scene.add.circle(px, y, 12).setStrokeStyle(4, COLORS.primary, 1).setFillStyle(0, 0).setDepth(6);
  scene.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 300, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  for (let i = 0; i < 5; i++) {
    const spark = scene.add.circle(px, y, 3, i % 2 ? COLORS.surface : COLORS.primary, 1).setDepth(6);
    scene.tweens.add({ targets: spark, x: px - dir * Phaser.Math.Between(10, 46), y: y + Phaser.Math.Between(-34, 34), alpha: 0, duration: 320, onComplete: () => spark.destroy() });
  }
}

/** A pop-up that bounces in at (x, y), floats up and fades. Big ones are larger and linger. `stroke` is the outline color as a CSS string. */
export function popup(scene: Phaser.Scene, x: number, y: number, message: string, stroke: string, big = false): void {
  const text = scene.add
    .text(x, y - (big ? 96 : 84), message, {
      fontFamily: FONT.display,
      fontSize: big ? '34px' : '22px',
      color: '#ffffff',
      stroke,
      strokeThickness: big ? 7 : 5,
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setScale(0.3);
  text.x = Phaser.Math.Clamp(text.x, text.width / 2 + 8, GAME_WIDTH - text.width / 2 - 8);
  scene.tweens.add({ targets: text, scale: big ? 1.3 : 1.15, duration: big ? 260 : 220, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: text, y: text.y - (big ? 90 : 70), alpha: 0, delay: big ? 800 : 500, duration: 700, onComplete: () => text.destroy() });
}

export const CHIP_ICON = 18; // status badge pictures, px

export interface StatusChip {
  icon: string;
  label: string;
  color: number;
}

/**
 * Draw one status badge (the pill under the score) with its top-left at (x, y): the colored pill into `g`, the
 * emoji image into `img` and the words into `txt`. The game pools these objects and redraws them every frame, and
 * the admin effects page uses the same function, so they always match.
 */
export function drawStatusChip(g: Phaser.GameObjects.Graphics, img: Phaser.GameObjects.Image, txt: Phaser.GameObjects.Text, x: number, y: number, chip: StatusChip): void {
  const key = emojiTextureKey(chip.icon);
  const hasIcon = img.scene.textures.exists(key);
  const textX = x + (hasIcon ? 24 : 10);
  txt.setText(chip.label).setPosition(textX, y + 4).setVisible(true);
  img.setVisible(hasIcon);
  if (hasIcon) img.setTexture(key).setDisplaySize(CHIP_ICON, CHIP_ICON).setPosition(x + 14, y + 12);
  const w = textX - x + txt.width + 12;
  g.fillStyle(chip.color, 0.94).fillRoundedRect(x, y, w, 24, 12);
  g.lineStyle(2, COLORS.onPrimary, 0.9).strokeRoundedRect(x, y, w, 24, 12);
}
