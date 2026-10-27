import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import { LEADS, OFFICIAL, PLATFORMS, SHOW, VIMMY, openLink, profileUrl, type Account } from '../promo/config';
import { watchPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { TAB_BAR_HEIGHT, hitArea, label, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 100;
const PAD = 14;
const CARD_W = GAME_WIDTH - 40;
const CARD_H = 120;

/**
 * The Promos tab, titled with the show's name (Bake Love Feeling): the pilot, the official account, the two main leads and Vimmy.
 * Every account has X, Instagram and TikTok buttons; a button shows "soon" until its handle is
 * filled in (src/promo/config.ts).
 */
export class PromosScene extends Phaser.Scene {
  constructor() {
    super(SCENES.promos);
  }

  create(): void {
    const list = new ScrollList(this, HEADER_H, GAME_HEIGHT - TAB_BAR_HEIGHT);
    const c = list.container;
    let y = PAD;

    y = this.pilotCard(c, y) + 16;
    y = this.section(c, y, t('promos.official'));
    y = this.accountCard(c, y, OFFICIAL) + 16;
    y = this.section(c, y, t('promos.leads'));
    for (const lead of LEADS) y = this.accountCard(c, y, lead) + 10;
    y += 6;
    y = this.section(c, y, VIMMY.name);
    y = this.accountCard(c, y, VIMMY);
    list.setContentHeight(y + PAD);

    // Opaque header (and interactive, so taps don't reach rows scrolled underneath).
    this.add.rectangle(0, 0, GAME_WIDTH, HEADER_H, COLORS.background).setOrigin(0).setDepth(40).setInteractive();
    label(this, 20, 28, SHOW.title, { size: 34, bold: true }).setDepth(41);
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

  /** A card with the name, an optional role line, and one button per platform. */
  private accountCard(c: Phaser.GameObjects.Container, y: number, account: Account): number {
    c.add(roundedBox(this, 20, y, CARD_W, CARD_H, COLORS.surface, 16, COLORS.border));
    c.add(label(this, 36, y + 10, account.name, { size: 19, bold: true, wrap: CARD_W - 32 }));
    if (account.roleKey) c.add(label(this, 36, y + 38, t(account.roleKey), { size: 13, color: COLORS.muted, wrap: CARD_W - 32 }));

    // One button per platform the account has (the official account is X only), at most 3 across.
    const platforms = PLATFORMS.filter((p) => p.id in account.handles);
    const gap = 8;
    const w = Math.min(130, (CARD_W - 32 - gap * (PLATFORMS.length - 1)) / PLATFORMS.length);
    platforms.forEach((p, i) => {
      const url = profileUrl(p.id, account.handles[p.id]);
      const x = 36 + i * (w + gap);
      const cy = y + 68;
      c.add(roundedBox(this, x, cy, w, 40, url ? COLORS.primary : COLORS.background, 20, url ? undefined : COLORS.border));
      c.add(label(this, x + w / 2, cy + (url ? 20 : 12), p.name, { size: 14, bold: true, color: url ? COLORS.onPrimary : COLORS.muted }).setOrigin(0.5));
      if (!url) c.add(label(this, x + w / 2, cy + 28, t('promos.soon'), { size: 10, color: COLORS.muted }).setOrigin(0.5));
      if (url) c.add(hitArea(this, x, cy, w, 40, () => openLink(url)));
    });
    return y + CARD_H;
  }
}
