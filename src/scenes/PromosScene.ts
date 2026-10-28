import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import instagramIcon from '../assets/icons/instagram.svg?no-inline';
import tiktokIcon from '../assets/icons/tiktok.svg?no-inline';
import xIcon from '../assets/icons/x.svg?no-inline';
import { LEADS, OFFICIAL, PLATFORMS, SHOW, VIMMY, openLink, profileUrl, type Account, type Platform } from '../promo/config';
import { watchPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { TAB_BAR_HEIGHT, hitArea, label, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 72;
const PAD = 8;
const CARD_W = GAME_WIDTH - 40;
const GAP = 12;
const HALF_W = (CARD_W - GAP) / 2;

/** Round icon buttons: the button is BUTTON px across, the icon inside is ICON px. */
const BUTTON = 36;
const ICON = 20;
const ICON_URLS: Record<Platform, string> = { x: xIcon, instagram: instagramIcon, tiktok: tiktokIcon };
const iconKey = (p: Platform) => `icon-${p}`;

/**
 * The Promos tab, titled with the show's name (Bake Love Feeling): the pilot, then the accounts.
 *
 * Accounts are cards with an avatar, a name and a role. A card only shows round icon buttons (X,
 * Instagram, TikTok) for the platforms that are really set up (src/promo/links.json); an account with
 * nothing set yet shows a single quiet "soon" tag instead of a row of placeholders. The official account and Vimmy are wide
 * cards; the two main leads sit side by side.
 */
export class PromosScene extends Phaser.Scene {
  constructor() {
    super(SCENES.promos);
  }

  /** The platform icons are small SVG files, loaded once and kept for later visits. */
  preload(): void {
    for (const p of PLATFORMS) {
      if (!this.textures.exists(iconKey(p.id))) this.load.svg(iconKey(p.id), ICON_URLS[p.id], { width: 128, height: 128 });
    }
  }

  create(): void {
    const list = new ScrollList(this, HEADER_H, GAME_HEIGHT - TAB_BAR_HEIGHT);
    const c = list.container;
    let y = PAD;

    y = this.pilotCard(c, y) + 18;
    y = this.section(c, y, t('promos.official'));
    y = this.wideCard(c, y, OFFICIAL) + 18;
    y = this.section(c, y, t('promos.leads'));
    y = this.leadsRow(c, y) + 18;
    y = this.section(c, y, VIMMY.name);
    y = this.wideCard(c, y, VIMMY);
    list.setContentHeight(y + PAD);

    // Opaque header (and interactive, so taps don't reach rows scrolled underneath).
    this.add.rectangle(0, 0, GAME_WIDTH, HEADER_H, COLORS.background).setOrigin(0).setDepth(40).setInteractive();
    label(this, 20, 12, SHOW.title, { size: 34, bold: true }).setDepth(41);
    tabBar(this, 'promos');
  }

  private section(c: Phaser.GameObjects.Container, y: number, text: string): number {
    c.add(label(this, 20, y, text, { size: 20, bold: true }));
    return y + 34;
  }

  /** The big "Watch the pilot" button. */
  private pilotCard(c: Phaser.GameObjects.Container, y: number): number {
    const h = 96;
    c.add(roundedBox(this, 20, y + 4, CARD_W, h, COLORS.primaryDark, 20));
    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.primary, 20));
    c.add(label(this, 44, y + 20, `▶  ${t('promos.pilot.title')}`, { size: 26, bold: true, color: COLORS.onPrimary }));
    c.add(label(this, 44, y + 58, t('promos.pilot.sub'), { size: 15, color: COLORS.onPrimary }));
    c.add(hitArea(this, 20, y, CARD_W, h, () => watchPilot()));
    return y + h;
  }

  /** A full-width card: avatar on the left; name, role and buttons to its right. */
  private wideCard(c: Phaser.GameObjects.Container, y: number, account: Account): number {
    const h = account.roleKey ? 112 : 96;
    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.surface, 16, COLORS.border));
    this.avatar(c, 20 + 16 + 30, y + h / 2, 30, account.avatar);

    const x = 20 + 16 + 60 + 14;
    const room = CARD_W - (x - 20) - 16;
    const name = label(this, x, y + 12, account.name, { size: 19, bold: true, wrap: room });
    c.add(name);
    if (account.roleKey) c.add(label(this, x, y + 12 + name.height, t(account.roleKey), { size: 13, color: COLORS.muted, wrap: room }));
    this.buttonRow(c, x, y + h - 12 - BUTTON, account, 'left');
    return y + h;
  }

  /** The two main leads, side by side: avatar on top, then name, role and buttons, centered. */
  private leadsRow(c: Phaser.GameObjects.Container, y: number): number {
    const h = 182;
    LEADS.forEach((lead, i) => {
      const x = 20 + i * (HALF_W + GAP);
      const cx = x + HALF_W / 2;
      c.add(roundedBox(this, x, y, HALF_W, h, COLORS.surface, 16, COLORS.border));
      this.avatar(c, cx, y + 40, 28, lead.avatar);
      const name = label(this, cx, y + 76, lead.name, { size: 16, bold: true, wrap: HALF_W - 20, align: 'center' }).setOrigin(0.5, 0);
      c.add(name);
      if (lead.roleKey) {
        c.add(label(this, cx, y + 76 + name.height + 2, t(lead.roleKey), { size: 12, color: COLORS.muted, wrap: HALF_W - 20, align: 'center' }).setOrigin(0.5, 0));
      }
      this.buttonRow(c, cx, y + h - 12 - BUTTON, lead, 'center');
    });
    return y + h;
  }

  private avatar(c: Phaser.GameObjects.Container, cx: number, cy: number, radius: number, emoji: string): void {
    c.add(this.add.circle(cx, cy, radius, COLORS.background).setStrokeStyle(2, COLORS.border));
    c.add(label(this, cx, cy, emoji, { size: Math.round(radius * 0.95) }).setOrigin(0.5));
  }

  /**
   * One round icon button per platform that has a handle. If the account has platforms but none are set
   * up yet, a single quiet "soon" tag instead. `anchor` is the left edge (align 'left') or the center ('center').
   */
  private buttonRow(c: Phaser.GameObjects.Container, anchor: number, y: number, account: Account, align: 'left' | 'center'): void {
    const live = PLATFORMS.map((p) => ({ p, url: profileUrl(p.id, account.handles[p.id]) })).filter((a) => a.url !== null);
    const hasAny = PLATFORMS.some((p) => p.id in account.handles);

    if (live.length === 0) {
      if (!hasAny) return;
      // Nothing set up yet: one quiet tag.
      const text = t('promos.soon');
      const probe = label(this, 0, 0, text, { size: 13 });
      const w = probe.width + 24;
      probe.destroy();
      const x = align === 'center' ? anchor - w / 2 : anchor;
      const top = y + (BUTTON - 28) / 2;
      c.add(roundedBox(this, x, top, w, 28, COLORS.background, 14, COLORS.border));
      c.add(label(this, x + w / 2, top + 14, text, { size: 13, color: COLORS.muted }).setOrigin(0.5));
      return;
    }

    const gap = 10;
    const total = live.length * BUTTON + gap * (live.length - 1);
    let x = align === 'center' ? anchor - total / 2 : anchor;
    for (const { p, url } of live) {
      const cx = x + BUTTON / 2;
      const cy = y + BUTTON / 2;
      c.add(this.add.circle(cx, cy, BUTTON / 2, COLORS.primary));
      if (this.textures.exists(iconKey(p.id))) {
        c.add(this.add.image(cx, cy, iconKey(p.id)).setDisplaySize(ICON, ICON));
      } else {
        // The icon file did not load: fall back to the platform's name.
        c.add(label(this, cx, cy, p.name.slice(0, 2), { size: 12, bold: true, color: COLORS.onPrimary }).setOrigin(0.5));
      }
      c.add(hitArea(this, x, y, BUTTON, BUTTON, () => openLink(url)));
      x += BUTTON + gap;
    }
  }
}
