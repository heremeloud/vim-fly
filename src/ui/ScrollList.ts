import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { toLayout } from '../core/render';
import { COLORS } from './theme';

const BAR_W = 6;
const BAR_GRAB = 28; // touch-friendly width of the draggable strip at the right edge
const BAR_MIN_THUMB = 36;

/**
 * A vertically scrolling list between `top` and `bottom` (screen y). Add rows to `container`,
 * tell it the content height, and drag or use the wheel to scroll. The scene should draw an
 * opaque header and tab bar above it (higher depth) to hide rows scrolled underneath.
 * With `scrollbar`, a slim bar shows at the right edge when the content overflows; drag it to scroll fast.
 */
export class ScrollList {
  readonly container: Phaser.GameObjects.Container;
  private contentH = 0;
  private dragStartY: number | null = null;
  private listStartY = 0;
  private readonly bar: Phaser.GameObjects.Graphics | null;
  private barDrag: { startY: number; startScroll: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    private readonly top: number,
    private readonly bottom: number,
    scrollbar = false,
  ) {
    this.container = scene.add.container(0, top).setDepth(1);
    this.bar = scrollbar ? scene.add.graphics().setDepth(2) : null;

    const onDown = (p: Phaser.Input.Pointer) => {
      const y = toLayout(p.y);
      if (this.bar && this.overflow() > 0 && y > top && y < bottom && toLayout(p.x) > GAME_WIDTH - BAR_GRAB) {
        this.barDrag = { startY: y, startScroll: this.top - this.container.y };
        return;
      }
      if (y > top && y < bottom) {
        this.dragStartY = y;
        this.listStartY = this.container.y;
      }
    };
    const onMove = (p: Phaser.Input.Pointer) => {
      if (this.barDrag && p.isDown) {
        const travel = this.bottom - this.top - this.thumbH();
        if (travel > 0) this.scrollTo(this.top - (this.barDrag.startScroll + ((toLayout(p.y) - this.barDrag.startY) / travel) * this.overflow()));
      } else if (this.dragStartY !== null && p.isDown) this.scrollTo(this.listStartY + (toLayout(p.y) - this.dragStartY));
    };
    const onUp = () => {
      this.dragStartY = null;
      this.barDrag = null;
    };
    const onWheel = (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => this.scrollTo(this.container.y - dy);

    scene.input.on('pointerdown', onDown);
    scene.input.on('pointermove', onMove);
    scene.input.on('pointerup', onUp);
    scene.input.on('wheel', onWheel);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointerdown', onDown);
      scene.input.off('pointermove', onMove);
      scene.input.off('pointerup', onUp);
      scene.input.off('wheel', onWheel);
    });
  }

  /** Remove all rows and scroll back to the top. */
  clear(): void {
    this.container.removeAll(true);
    this.container.y = this.top;
    this.contentH = 0;
    this.drawBar();
  }

  setContentHeight(h: number): void {
    this.contentH = h;
    this.drawBar();
  }

  private scrollTo(y: number): void {
    const viewH = this.bottom - this.top;
    const minY = this.top - Math.max(0, this.contentH - viewH);
    this.container.y = Phaser.Math.Clamp(y, minY, this.top);
    this.drawBar();
  }

  private overflow(): number {
    return Math.max(0, this.contentH - (this.bottom - this.top));
  }

  private thumbH(): number {
    const viewH = this.bottom - this.top;
    return Math.max(BAR_MIN_THUMB, (viewH * viewH) / this.contentH);
  }

  private drawBar(): void {
    if (!this.bar) return;
    this.bar.clear();
    const over = this.overflow();
    if (over <= 0) return;
    const viewH = this.bottom - this.top;
    const x = GAME_WIDTH - BAR_W - 4;
    const thumbH = this.thumbH();
    const thumbY = this.top + ((this.top - this.container.y) / over) * (viewH - thumbH);
    this.bar.fillStyle(COLORS.border, 0.5).fillRoundedRect(x, this.top + 4, BAR_W, viewH - 8, BAR_W / 2);
    this.bar.fillStyle(COLORS.primary, 1).fillRoundedRect(x, thumbY, BAR_W, thumbH, BAR_W / 2);
  }
}
