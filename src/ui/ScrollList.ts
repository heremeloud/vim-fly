import Phaser from 'phaser';

/**
 * A vertically scrolling list between `top` and `bottom` (screen y). Add rows to `container`,
 * tell it the content height, and drag or use the wheel to scroll. The scene should draw an
 * opaque header and tab bar above it (higher depth) to hide rows scrolled underneath.
 */
export class ScrollList {
  readonly container: Phaser.GameObjects.Container;
  private contentH = 0;
  private dragStartY: number | null = null;
  private listStartY = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly top: number,
    private readonly bottom: number,
  ) {
    this.container = scene.add.container(0, top).setDepth(1);

    const onDown = (p: Phaser.Input.Pointer) => {
      if (p.y > top && p.y < bottom) {
        this.dragStartY = p.y;
        this.listStartY = this.container.y;
      }
    };
    const onMove = (p: Phaser.Input.Pointer) => {
      if (this.dragStartY !== null && p.isDown) this.scrollTo(this.listStartY + (p.y - this.dragStartY));
    };
    const onUp = () => (this.dragStartY = null);
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
  }

  setContentHeight(h: number): void {
    this.contentH = h;
  }

  private scrollTo(y: number): void {
    const viewH = this.bottom - this.top;
    const minY = this.top - Math.max(0, this.contentH - viewH);
    this.container.y = Phaser.Math.Clamp(y, minY, this.top);
  }
}
