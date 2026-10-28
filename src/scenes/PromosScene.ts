import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import { LEADS, OFFICIAL, PLATFORMS, SHOW, VIMMY, openLink, profileUrl, type Account } from '../promo/config';
import { watchPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { TAB_BAR_HEIGHT, hitArea, label, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 72;
const PAD = 8;
const CARD_W = GAME_WIDTH - 40;
const GAP = 12;
const HALF_W = (CARD_W - GAP) / 2;

/**
 * The Promos tab, titled with the show's name (Bake Love Feeling): the pilot, then the accounts.
 *
 * Accounts are cards with an avatar, a name and a role. A card only shows buttons for the platforms
 * that are really set up (handles in src/promo/config.ts); an account with nothing set yet shows a
 * single quiet "soon" tag instead of a row of placeholders. The official account and Vimmy are wide
 * cards; the two main leads sit side by side.
 */
export class PromosScene extends Phaser.Scene {
  constructor() {
    super(SCENES.promos);
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
    this.buttonRow(c, x, y + h - 14 - 28, account, 'left');
    return y + h;
  }

  /** The two main leads, side by side: avatar on top, then name, role and buttons, centered. */
  private leadsRow(c: Phaser.GameObjects.Container, y: number): number {
    const h = 176;
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
      this.buttonRow(c, cx, y + h - 14 - 28, lead, 'center');
    });
    return y + h;
  }

  private avatar(c: Phaser.GameObjects.Container, cx: number, cy: number, radius: number, emoji: string): void {
    c.add(this.add.circle(cx, cy, radius, COLORS.background).setStrokeStyle(2, COLORS.border));
    c.add(label(this, cx, cy, emoji, { size: Math.round(radius * 0.95) }).setOrigin(0.5));
  }

  /**
   * One button per platform that has a handle. If the account has platforms but none are set up yet,
   * a single quiet "soon" tag instead. `anchor` is the left edge (align 'left') or the center ('center').
   */
  private buttonRow(c: Phaser.GameObjects.Container, anchor: number, y: number, account: Account, align: 'left' | 'center'): void {
    const active = PLATFORMS.map((p) => ({ p, url: profileUrl(p.id, account.handles[p.id]) })).filter((a) => a.url !== null);
    const hasAny = PLATFORMS.some((p) => p.id in account.handles);
    const pills: { text: string; url: string | null }[] = active.length > 0
      ? active.map((a) => ({ text: a.p.name, url: a.url }))
      : hasAny
        ? [{ text: t('promos.soon'), url: null }]
        : [];

    // Measure each label first so the pills fit their text.
    const sizes = pills.map((pill) => {
      const probe = label(this, 0, 0, pill.text, { size: 13, bold: true });
      const w = probe.width + 24;
      probe.destroy();
      return w;
    });
    const gap = 8;
    const total = sizes.reduce((a, b) => a + b, 0) + gap * Math.max(0, pills.length - 1);
    let x = align === 'center' ? anchor - total / 2 : anchor;

    pills.forEach((pill, i) => {
      const w = sizes[i];
      const live = pill.url !== null;
      c.add(roundedBox(this, x, y, w, 28, live ? COLORS.primary : COLORS.background, 14, live ? undefined : COLORS.border));
      c.add(label(this, x + w / 2, y + 14, pill.text, { size: 13, bold: live, color: live ? COLORS.onPrimary : COLORS.muted }).setOrigin(0.5));
      if (live) c.add(hitArea(this, x, y, w, 28, () => openLink(pill.url)));
      x += w + gap;
    });
  }
}
