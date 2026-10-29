import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../core/constants';
import { REACTION_ICON, STATUS_ICON } from '../core/effectIcons';
import { emojiTextureKey } from '../core/emojiFile';
import { itemName, localeInfo, t, tDynamic } from '../i18n';
import { ITEMS } from '../items/itemDefs';
import { zoneBannerText, ZONES } from '../core/zones';
import { FINALE_BOARD, layoutBanner } from '../ui/boards';
import { dashBurst, dashImpact, dashTrail, drawStatusChip, popup, type StatusChip } from '../ui/fx';
import { ScrollList } from '../ui/ScrollList';
import { COLORS, FONT, hex } from '../ui/theme';
import { button, CHIP, chipWidth, doughBlob, hitArea, label, openLanguagePicker, pageHeader, paintChip, type BlobMood } from '../ui/widgets';

const HEADER_H = 156;
const TABS = ['Boards', 'Badges', 'Motion'] as const;
type Tab = (typeof TABS)[number];
const BOARD_ROW = 112;
const STAGE = { x: GAME_WIDTH / 2, y: 330 }; // where Vimmy stands on the Motion tab
const PLAYER_SIZE = 80;

/**
 * Admin page: every finale board, status badge, reaction picture, face of the header blob, dash effect and pop-up in one
 * place, drawn by the same code the game uses. Local only: open it with `npm run dev`, then `/?fx`.
 */
export class FxScene extends Phaser.Scene {
  private chips: { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }[] = [];
  private boards!: ScrollList;
  private groups: Record<Exclude<Tab, 'Boards'>, Phaser.GameObjects.GameObject[]> = { Badges: [], Motion: [] };
  private vimmy!: Phaser.GameObjects.Image;
  private dashing = false;

  constructor() {
    super(SCENES.fx);
  }

  create(): void {
    this.chips = [];
    this.groups = { Badges: [], Motion: [] };
    this.dashing = false;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background).setOrigin(0).setDepth(-1);

    this.boards = new ScrollList(this, HEADER_H, GAME_HEIGHT - 70);
    this.buildBoards();
    this.buildBadges();
    this.buildMotion();
    pageHeader(this, HEADER_H, 'Effects', 'Local preview: tap a board or button to play it', 'wow');
    this.buildTabs();
    this.buildFooter();
    this.show('Boards');
  }

  // ---- tabs and footer ----

  private buildTabs(): void {
    const w = chipWidth(TABS.length);
    TABS.forEach((name, i) => {
      const x = 20 + i * (w + CHIP.gap);
      const bg = this.add.graphics().setDepth(41);
      const text = label(this, x + w / 2, CHIP.y + CHIP.h / 2, name, { size: CHIP.size, bold: true }).setOrigin(0.5).setDepth(42);
      this.chips.push({ bg, text });
      hitArea(this, x, CHIP.y, w, CHIP.h, () => this.show(name)).setDepth(43);
    });
  }

  private show(tab: Tab): void {
    const w = chipWidth(TABS.length);
    TABS.forEach((name, i) => paintChip(this.chips[i].bg, this.chips[i].text, 20 + i * (w + CHIP.gap), CHIP.y, w, CHIP.h, name === tab, COLORS.primary, COLORS.onPrimary, COLORS.accent));
    this.boards.container.setVisible(tab === 'Boards');
    for (const name of ['Badges', 'Motion'] as const) this.groups[name].forEach((o) => (o as Phaser.GameObjects.GameObject & { setVisible: (v: boolean) => void }).setVisible(name === tab));
  }

  private buildFooter(): void {
    this.add.rectangle(0, GAME_HEIGHT - 66, GAME_WIDTH, 66, COLORS.surface).setOrigin(0).setDepth(50).setInteractive();
    this.add.rectangle(0, GAME_HEIGHT - 66, GAME_WIDTH, 2, COLORS.border).setOrigin(0).setDepth(50);
    const go = (key: string, flag: string | null): void => {
      const url = new URL(location.href);
      url.searchParams.delete('fx');
      url.searchParams.delete('sfx');
      if (flag) url.searchParams.set(flag, '');
      history.replaceState({}, '', url);
      this.scene.start(key);
    };
    button(this, 80, GAME_HEIGHT - 33, 130, 40, '← Home', () => go(SCENES.home, null), 'secondary', 15, 51);
    // Switching language re-opens this page in it, so every board and badge can be checked for text that is too long.
    button(this, 240, GAME_HEIGHT - 33, 130, 40, localeInfo().name, () => openLanguagePicker(this), 'secondary', 15, 51);
    button(this, 400, GAME_HEIGHT - 33, 130, 40, 'Sounds ›', () => go(SCENES.sfx, 'sfx'), 'secondary', 15, 51);
  }

  /** A small grey heading inside a tab. */
  private heading(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return label(this, x, y, text, { size: 15, bold: true, color: COLORS.muted });
  }

  // ---- Boards: every finale announcement, plus the plain location banner ----

  private buildBoards(): void {
    const c = this.boards.container;
    let y = 16;
    c.add(this.heading(20, y, 'Location banner (small)'));
    y += 36;
    this.addBoard(c, y, zoneBannerText(ZONES[1], ZONES[0]), false, undefined);
    y += 60;
    c.add(this.heading(20, y, 'Finale announcements (tap to replay)'));
    y += 40;
    for (const zone of ZONES.slice(0, -1)) {
      const board = FINALE_BOARD[zone.id];
      c.add(label(this, 20, y - 8, `${zone.id}${board ? ` · ${board}` : ' · pill'}`, { size: 12, color: COLORS.muted }));
      this.addBoard(c, y + 50, tDynamic(`finale.${zone.id}`, zone.id), true, board);
      y += BOARD_ROW;
    }
    this.boards.setContentHeight(y + 10);
  }

  /** One banner laid out exactly like the game does, centred on the page and tappable to replay its pop-in. */
  private addBoard(c: Phaser.GameObjects.Container, cy: number, text: string, big: boolean, board: (typeof FINALE_BOARD)[string] | undefined): void {
    const bg = this.add.graphics();
    const name = this.add.text(0, 0, '', { fontFamily: FONT.display, fontSize: '17px', color: hex(COLORS.text), align: 'center', stroke: hex(COLORS.text), strokeThickness: 1 }).setOrigin(0.5);
    layoutBanner(bg, name, text, big, board);
    const holder = this.add.container(GAME_WIDTH / 2, cy, [bg, name]);
    c.add(holder);
    const hit = hitArea(this, GAME_WIDTH / 2 - 220, cy - 36, 440, 84, () => {
      this.tweens.killTweensOf(holder);
      holder.setScale(0.3).setRotation(-0.2);
      this.tweens.add({ targets: holder, scale: 1, rotation: 0, duration: 340, ease: 'Back.easeOut' });
      this.tweens.add({ targets: holder, rotation: 0.035, duration: 80, yoyo: true, repeat: 3, delay: 340 });
    });
    c.add(hit);
  }

  // ---- Badges: status badges, reaction pictures and the blob's faces ----

  private buildBadges(): void {
    const g = this.groups.Badges;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      g.push(o);
      return o;
    };
    let y = HEADER_H + 16;
    add(this.heading(20, y, 'Status badges (under the score)'));
    y += 32;
    const chips: StatusChip[] = [
      { icon: STATUS_ICON.shield, label: 'Shield', color: COLORS.buff },
      { icon: STATUS_ICON.dash, label: 'Dash 2.4s', color: COLORS.buff },
      { icon: STATUS_ICON.power, label: 'Power 4.1s', color: COLORS.buff },
      { icon: STATUS_ICON.x2, label: 'x2 3.0s', color: COLORS.buff },
      { icon: STATUS_ICON.stunned, label: 'Stunned 0.8s', color: COLORS.debuff },
      { icon: STATUS_ICON.dizzy, label: 'Dizzy 2.2s', color: COLORS.debuff },
      { icon: STATUS_ICON.slow, label: 'Slow 3.5s', color: COLORS.debuff },
    ];
    const gfx = add(this.add.graphics());
    let cx = 20;
    chips.forEach((chip) => {
      const img = add(this.add.image(0, 0, '__WHITE'));
      const txt = add(this.add.text(0, 0, '', { fontFamily: FONT.family, fontSize: '13px', fontStyle: 'bold', color: '#ffffff' }));
      const probe = this.add.text(0, 0, chip.label, { fontFamily: FONT.family, fontSize: '13px', fontStyle: 'bold' });
      const width = probe.width + 36;
      probe.destroy();
      if (cx + width > GAME_WIDTH - 20) {
        cx = 20;
        y += 32;
      }
      drawStatusChip(gfx, img, txt, cx, y, chip);
      cx += width + 8;
    });
    y += 52;

    add(this.heading(20, y, 'Reaction pictures (above Vimmy)'));
    y += 32;
    const entries = Object.entries(REACTION_ICON);
    const cell = (GAME_WIDTH - 40) / 4;
    entries.forEach(([id, emoji], i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 20 + col * cell + cell / 2;
      const ry = y + row * 88;
      const key = emojiTextureKey(emoji);
      if (this.textures.exists(key)) add(this.add.image(x, ry + 24, key).setDisplaySize(44, 44));
      add(label(this, x, ry + 56, id, { size: 12, color: COLORS.muted, maxWidth: cell - 8 }).setOrigin(0.5, 0));
    });
    y += Math.ceil(entries.length / 4) * 88 + 8;

    add(this.heading(20, y, 'Header blob (Menu, Orders, Promos)'));
    y += 24;
    (['curious', 'wow', 'love'] as BlobMood[]).forEach((mood, i) => {
      const x = 90 + i * 150;
      add(this.add.rectangle(x, y + 60, 100, 4, COLORS.pink).setOrigin(0.5, 0));
      const before = this.children.list.length; // the blob is several objects (hat, tools, hearts): collect them all
      doughBlob(this, x, y + 62, 52, 1, mood);
      this.children.list.slice(before).forEach((o) => add(o));
      add(label(this, x, y + 74, mood, { size: 13, color: COLORS.muted }).setOrigin(0.5, 0));
    });
  }

  // ---- Motion: the dash and the pop-ups ----

  private buildMotion(): void {
    const g = this.groups.Motion;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      g.push(o);
      return o;
    };
    add(this.heading(20, HEADER_H + 16, 'Sideways dash'));
    add(this.add.rectangle(20, STAGE.y - 60, GAME_WIDTH - 40, 120, COLORS.primarySoft, 0.7).setOrigin(0));
    this.vimmy = add(this.add.image(STAGE.x, STAGE.y, 'vimmy-fly-0').setDisplaySize(PLAYER_SIZE, PLAYER_SIZE).setDepth(5));
    const buttons: [string, () => void][] = [
      ['← Dash left', () => this.dash(-1)],
      ['Dash right →', () => this.dash(1)],
    ];
    buttons.forEach(([text, fn], i) => button(this, 125 + i * 230, STAGE.y + 100, 200, 44, text, fn, 'primary', 16, 2).forEach(add));

    add(this.heading(20, STAGE.y + 144, 'Pop-ups above Vimmy (the real texts, in this language)'));
    const lose = hex(COLORS.debuff);
    const pops: [string, () => string, string, boolean][] = [
      ['+25', () => '+25', hex(COLORS.primaryDark), false],
      ['+150', () => '+150', hex(COLORS.primaryDark), true],
      ['-100', () => '-100', lose, false],
      ['shield', () => t('shield.blocked'), '#1565c0', true],
      // Every buff and debuff, worded and sized exactly as in a run.
      ...ITEMS.filter((i) => i.kind !== 'points').map((i): [string, () => string, string, boolean] => [
        i.id,
        () => tDynamic(`${i.kind}.${i.id}`, itemName(i.id, i.label)),
        i.kind === 'buff' ? hex(COLORS.buff) : lose,
        i.id === 'carCrash' || i.id === 'planner',
      ]),
    ];
    const cols = 4;
    const bw = (GAME_WIDTH - 40 - 8 * (cols - 1)) / cols;
    pops.forEach(([text, message, stroke, big], i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      button(this, 20 + bw / 2 + col * (bw + 8), STAGE.y + 186 + row * 42, bw, 34, text, () => popup(this, STAGE.x, STAGE.y, message(), stroke, big), 'secondary', 11, 2).forEach(add);
    });
  }

  /** The same dash the game plays: a puff, afterimages along the way and a ring on the far wall. */
  private dash(dir: -1 | 1): void {
    if (this.dashing) return;
    this.dashing = true;
    const half = PLAYER_SIZE / 2;
    const target = dir < 0 ? half : GAME_WIDTH - half;
    this.vimmy.setTexture(dir < 0 ? 'vimmy-dash-left' : 'vimmy-dash-right').setPosition(STAGE.x, STAGE.y);
    dashBurst(this, this.vimmy.x, this.vimmy.y, dir);
    const trail = this.time.addEvent({ delay: 32, loop: true, callback: () => dashTrail(this, this.vimmy.texture.key, this.vimmy.x, this.vimmy.y, dir, PLAYER_SIZE) });
    this.tweens.add({
      targets: this.vimmy,
      x: target,
      duration: Math.abs(target - STAGE.x) / 1.4,
      ease: 'Linear',
      onComplete: () => {
        trail.remove();
        dashImpact(this, this.vimmy.x, this.vimmy.y, dir, PLAYER_SIZE);
        this.time.delayedCall(500, () => {
          this.vimmy.setTexture('vimmy-fly-0').setPosition(STAGE.x, STAGE.y);
          this.dashing = false;
        });
      },
    });
  }
}
