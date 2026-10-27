import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, SCENES } from '../core/constants';
import { bindSteering } from '../core/input';

/**
 * Core loop with placeholder rectangles: tap left/right to flap up and drift,
 * gravity pulls down, falling off the bottom ends the run.
 * Falling items, scoring and the camera climb are the next build steps.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private vx = 0;
  private vy = 0;
  private score = 0;

  constructor() {
    super(SCENES.game);
  }

  create(): void {
    this.vx = 0;
    this.vy = 0;
    this.score = 0;
    this.player = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 40, 40, 0xffb300);

    bindSteering(this, (dir) => {
      this.vy = PHYSICS.flapVelocity;
      this.vx = dir * PHYSICS.driftVelocity;
    });
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.vy = Math.min(this.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed);
    this.vx *= Math.pow(PHYSICS.horizontalDrag, dt * 60);

    // Wrap horizontally so the character never leaves the playfield sideways.
    this.player.x = Phaser.Math.Wrap(this.player.x + this.vx * dt, 0, GAME_WIDTH);
    this.player.y += this.vy * dt;

    if (this.player.y > GAME_HEIGHT) this.endRun();
  }

  private endRun(): void {
    this.scene.start(SCENES.receipt, { score: this.score });
  }
}
