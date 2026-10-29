import Phaser from 'phaser';
import { loopSfx, playSfx, SFX_KEYS, SFX_LOOP_KEYS, soundEnabled, type SfxLoop } from '../audio/sfx';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../core/constants';
import { COLORS } from '../ui/theme';
import { addSoundToggle } from '../ui/soundToggle';
import { hitArea, label, roundedBox } from '../ui/widgets';

type PreviewButton = {
  key: string;
  loop: boolean;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
};

/** Local-only sound test opened with `npm run dev`, then `/?sfx`. */
export class SfxScene extends Phaser.Scene {
  private buttons: PreviewButton[] = [];
  private loops = new Map<SfxLoop, Phaser.Sound.BaseSound>();
  private status!: Phaser.GameObjects.Text;
  private lastPlayed = '';

  constructor() {
    super(SCENES.sfx);
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background).setOrigin(0);
    label(this, 20, 18, 'Sound effects', { size: 34, bold: true });
    label(this, 20, 59, 'Local preview · one-shots and loops', { size: 15, color: COLORS.muted });

    this.backButton();
    addSoundToggle(this, (object) => object, 20, 88, 200, 5);
    this.status = label(this, GAME_WIDTH - 20, 116, '', { size: 14, color: COLORS.muted, maxWidth: 220 }).setOrigin(1, 0);

    const keys: { key: string; loop: boolean }[] = [
      ...SFX_KEYS.map((key) => ({ key, loop: false })),
      ...SFX_LOOP_KEYS.map((key) => ({ key, loop: true })),
    ];
    const columns = 3;
    const width = 138;
    const gapX = 13;
    const startY = 190;
    const gapY = 54;
    keys.forEach(({ key, loop }, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      this.addPreviewButton(20 + column * (width + gapX), startY + row * gapY, width, 42, key, loop);
    });

    label(this, GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Loop buttons toggle on/off · leaving stops every loop', { size: 13, color: COLORS.muted })
      .setOrigin(0.5);
    this.refreshButtons();
    this.time.addEvent({ delay: 120, loop: true, callback: () => this.refreshButtons() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopLoops());
  }

  private backButton(): void {
    const x = GAME_WIDTH - 118;
    roundedBox(this, x, 20, 98, 42, COLORS.surface, 21, COLORS.primary);
    label(this, x + 49, 41, '← Home', { size: 16, bold: true, color: COLORS.onPrimary }).setOrigin(0.5);
    hitArea(this, x, 20, 98, 42, () => {
      const url = new URL(location.href);
      url.searchParams.delete('sfx');
      history.replaceState({}, '', url);
      this.scene.start(SCENES.home);
    });
    const fx = x - 10;
    roundedBox(this, fx, 68, 108, 30, COLORS.surface, 15, COLORS.primary);
    label(this, fx + 54, 83, 'Effects ›', { size: 14, bold: true, color: COLORS.onPrimary }).setOrigin(0.5);
    hitArea(this, fx, 68, 108, 30, () => {
      const url = new URL(location.href);
      url.searchParams.delete('sfx');
      url.searchParams.set('fx', '');
      history.replaceState({}, '', url);
      this.scene.start(SCENES.fx);
    });
  }

  private addPreviewButton(x: number, y: number, width: number, height: number, key: string, loop: boolean): void {
    const bg = this.add.graphics();
    const text = label(this, x + width / 2, y + height / 2, '', { size: 15, bold: true, maxWidth: width - 18 }).setOrigin(0.5);
    this.buttons.push({ key, loop, bg, text });
    hitArea(this, x, y, width, height, () => this.preview(key, loop));
  }

  private preview(key: string, loop: boolean): void {
    if (!this.cache.audio.exists(key)) return;
    this.lastPlayed = key;
    if (!loop) {
      playSfx(this, key as (typeof SFX_KEYS)[number], 0.8);
      return;
    }
    const loopKey = key as SfxLoop;
    const current = this.loops.get(loopKey);
    if (current) {
      current.stop();
      current.destroy();
      this.loops.delete(loopKey);
      return;
    }
    const sound = loopSfx(this, loopKey, loopKey === 'buzz' ? 0.18 : 0.45);
    if (sound) this.loops.set(loopKey, sound);
  }

  private refreshButtons(): void {
    let ready = 0;
    for (const button of this.buttons) {
      const available = this.cache.audio.exists(button.key);
      if (available) ready++;
      const active = button.loop && this.loops.has(button.key as SfxLoop);
      const x = 20 + (this.buttons.indexOf(button) % 3) * 151;
      const y = 190 + Math.floor(this.buttons.indexOf(button) / 3) * 54;
      button.bg.clear();
      button.bg.fillStyle(active ? COLORS.primary : available ? COLORS.surface : COLORS.border, available ? 1 : 0.45).fillRoundedRect(x, y, 138, 42, 14);
      button.bg.lineStyle(2, active ? COLORS.primaryDark : available ? COLORS.primary : COLORS.muted, available ? 1 : 0.35).strokeRoundedRect(x, y, 138, 42, 14);
      button.text.setText(`${button.loop ? active ? '■ ' : '↻ ' : '▶ '}${button.key}`).setAlpha(available ? 1 : 0.45);
    }
    const enabled = soundEnabled() ? 'sound on' : 'turn sound on';
    this.status.setText(`${ready}/${this.buttons.length} ready · ${enabled}${this.lastPlayed ? `\nLast: ${this.lastPlayed}` : ''}`);
  }

  private stopLoops(): void {
    for (const sound of this.loops.values()) {
      sound.stop();
      sound.destroy();
    }
    this.loops.clear();
  }
}
