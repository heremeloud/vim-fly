import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import instagramIcon from '../assets/icons/instagram.svg?no-inline';
import tiktokIcon from '../assets/icons/tiktok.svg?no-inline';
import websiteIcon from '../assets/icons/website.svg?no-inline';
import youtubeIcon from '../assets/icons/youtube.svg?no-inline';
import xIcon from '../assets/icons/x.svg?no-inline';
import { LEADS, OFFICIAL, PLATFORMS, SHOW, VIMMY, copyText, openLink, profileUrl, type Account, type Platform } from '../promo/config';
import { watchPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS, RADIUS, hex as hexOf } from '../ui/theme';
import { TAB_BAR_HEIGHT, hitArea, label, pageHeader, roundedBox, tabBar } from '../ui/widgets';

const HEADER_H = 98; // short: no chips here, but the gingham hem (HEM_Y) is at the same height as on the other tabs
const PAD = 4;
const CARD_W = GAME_WIDTH - 40;
const GAP = 12;
const HALF_W = (CARD_W - GAP) / 2;

/**
 * Round icon buttons: the visible circle is BUTTON px across and the icon inside is ICON px. They are
 * small on purpose (the names are what people look for); the tappable area is bigger than the circle.
 */
const BUTTON = 28;
const ICON = 15;
const ICON_GAP = 8;
const TAP_H = 44;
const ICON_URLS: Record<Platform, string> = { x: xIcon, instagram: instagramIcon, tiktok: tiktokIcon, youtube: youtubeIcon, website: websiteIcon };

/**
 * Avatar photos: any image dropped in src/assets/avatars/ can be used by writing its file name as the
 * "avatar" in src/promo/links.json (for example "view.jpg"). Anything else is shown as text (an emoji).
 */
const PHOTO_URLS = import.meta.glob<string>('../assets/avatars/*.{png,jpg,jpeg,webp}', { eager: true, query: '?no-inline', import: 'default' });
const isPhoto = (avatar: string) => /\.(png|jpe?g|webp)$/i.test(avatar);
const photoUrl = (avatar: string): string | undefined => PHOTO_URLS[`../assets/avatars/${avatar}`];
const photoKey = (avatar: string) => `avatar-src-${avatar}`;
const circleKey = (avatar: string) => `avatar-circle-${avatar}`;
const CIRCLE_PX = 256;
/** Height of the header photo on the official card (the photo is cropped to fit, keeping the middle). */
const BANNER_H = 84;
const iconKey = (p: Platform) => `icon-${p}`;

/**
 * The Promos tab, titled with the show's name (Bake Love Feeling): the pilot, then the accounts.
 *
 * Accounts are cards with an avatar, a name and a role. A card only shows round icon buttons (X,
 * Instagram, TikTok) for the platforms that are really set up (src/promo/links.json); an account with
 * nothing set yet shows a single quiet "soon" tag instead of a row of placeholders. The official account is a wide
 * card, the two main leads sit side by side, and Vimmy (a mascot, not the focus here) is a small one-line row.
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
    if (OFFICIAL.banner && photoUrl(OFFICIAL.banner) && !this.textures.exists(photoKey(OFFICIAL.banner))) this.load.image(photoKey(OFFICIAL.banner), photoUrl(OFFICIAL.banner)!);
    for (const account of [OFFICIAL, ...LEADS, VIMMY]) {
      if (!isPhoto(account.avatar)) continue;
      const url = photoUrl(account.avatar);
      if (!url) {
        if (import.meta.env.DEV) console.warn(`[links.json] avatar "${account.avatar}" is not in src/assets/avatars/`);
        continue;
      }
      if (!this.textures.exists(photoKey(account.avatar))) this.load.image(photoKey(account.avatar), url);
    }
  }

  create(): void {
    const list = new ScrollList(this, HEADER_H, GAME_HEIGHT - TAB_BAR_HEIGHT);
    const c = list.container;
    let y = PAD;

    y = this.pilotCard(c, y) + 10;
    y = this.section(c, y, t('promos.official'));
    y = this.wideCard(c, y, OFFICIAL) + 10;
    y = this.section(c, y, t('promos.leads'));
    y = this.leadsRow(c, y) + 10;
    y = this.compactCard(c, y, VIMMY);
    list.setContentHeight(y + PAD);
    if (import.meta.env.DEV) console.info(`[promos] content ${Math.round(y + PAD)} of ${GAME_HEIGHT - TAB_BAR_HEIGHT - HEADER_H}`);

    // Opaque header (and interactive, so taps don't reach rows scrolled underneath).
    const tag = SHOW.hashtag.replace(/^#/, '');
    this.hashtagLine(pageHeader(this, HEADER_H, SHOW.title, tag ? `#${tag}` : undefined, 'love'));
    tabBar(this, 'promos');
  }

  /** The show's hashtag is the subtitle under the title, like on the other tabs. Tap it to copy. */
  private hashtagLine(line: Phaser.GameObjects.Text | null): void {
    if (!line) return;
    const text = line.text;
    let timer: Phaser.Time.TimerEvent | undefined;
    hitArea(this, 20, 60, 260, 30, () => {
      void copyText(text).then((ok) => {
        line.setText(ok ? t('promos.copied') : text).setColor(hexOf(ok ? COLORS.accent : COLORS.muted));
        timer?.remove();
        timer = this.time.delayedCall(1500, () => line.setText(text).setColor(hexOf(COLORS.muted)));
      });
    }).setDepth(43);
  }

  private section(c: Phaser.GameObjects.Container, y: number, text: string): number {
    c.add(label(this, 20, y, text, { size: 20, bold: true }));
    return y + 30;
  }

  /** The big "Watch the pilot" button. */
  private pilotCard(c: Phaser.GameObjects.Container, y: number): number {
    const h = 60;
    c.add(roundedBox(this, 20, y + 4, CARD_W, h, COLORS.primaryDark, RADIUS.card));
    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.primary, RADIUS.card));
    if (this.textures.exists(iconKey('youtube'))) c.add(this.add.image(44 + 14, y + 10 + 14, iconKey('youtube')).setDisplaySize(28, 28));
    c.add(label(this, 44 + 40, y + 8, t('promos.pilot.title'), { size: 22, bold: true, color: COLORS.onPrimary }));
    c.add(label(this, 44 + 40, y + 36, t('promos.pilot.sub'), { size: 13, color: COLORS.onPrimary }));
    c.add(hitArea(this, 20, y, CARD_W, h, () => watchPilot()));
    return y + h;
  }

  /** A full-width card: avatar on the left; name, role and buttons to its right. */
  private wideCard(c: Phaser.GameObjects.Container, y: number, account: Account): number {
    const banner = account.banner ? this.bannerImage(account.banner) : null;
    if (banner) return this.bannerCard(c, y, account, banner);
    const x = 20 + 16 + 60 + 14;
    const room = CARD_W - (x - 20) - 16;
    // Build the texts first so the card is exactly as tall as it needs to be.
    const name = label(this, x, y + 12, account.name, { size: 22, bold: true, wrap: room });
    const role = account.roleKey ? label(this, x, y + 12 + name.height, t(account.roleKey), { size: 14, color: COLORS.muted, wrap: room }) : null;
    const textH = name.height + (role ? role.height : 0);
    const h = Math.max(96, 12 + textH + 10 + BUTTON + 12);

    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.surface, RADIUS.card, COLORS.border));
    c.add(name);
    if (role) c.add(role);
    this.avatar(c, 20 + 16 + 30, y + h / 2, 30, account.avatar);
    this.buttonRow(c, x, y + h - 12 - BUTTON, account, 'left');
    return y + h;
  }

  /** A wide card with a header photo across the top (like an X profile): the avatar overlaps its bottom edge; name, role and buttons below. */
  private bannerCard(c: Phaser.GameObjects.Container, y: number, account: Account, bannerKey: string): number {
    const bannerH = BANNER_H;
    const x = 20 + 16;
    const textX = x + 72 + 12;
    const rowH = 46;
    const h = bannerH + rowH;
    const room = CARD_W - (textX - 20) - 16 - 3 * (BUTTON + ICON_GAP);
    const name = label(this, textX, y + bannerH + 6, account.name, { size: 20, bold: true, wrap: room });
    const role = account.roleKey ? label(this, textX, y + bannerH + 6 + name.height, t(account.roleKey), { size: 14, color: COLORS.muted, wrap: room }) : null;

    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.surface, RADIUS.card, COLORS.border));
    c.add(this.add.image(21, y + 1, bannerKey).setOrigin(0).setDisplaySize(CARD_W - 2, bannerH - 1));
    c.add(this.add.circle(x + 36, y + bannerH, 36, COLORS.surface)); // a ring in the card colour so the avatar sits cleanly on the photo
    this.avatar(c, x + 36, y + bannerH, 32, account.avatar);
    c.add(name);
    if (role) c.add(role);
    // Name beside the avatar, buttons at the right end of the same row.
    this.buttonRow(c, 20 + CARD_W - 16, y + bannerH + (rowH - BUTTON) / 2, account, 'right');
    return y + h;
  }

  /** The header photo with rounded top corners (to match the card), made once from the loaded image. */
  private bannerImage(file: string): string | null {
    const out = `banner-${file}`;
    if (this.textures.exists(out)) return out;
    if (!this.textures.exists(photoKey(file))) return null;
    const img = this.textures.get(photoKey(file)).getSourceImage() as HTMLImageElement;
    const W = CARD_W * 2;
    const H = BANNER_H * 2;
    const R = 30;
    const texture = this.textures.createCanvas(out, W, H);
    if (!texture) return null;
    const ctx = texture.getContext();
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, R);
    ctx.arcTo(0, 0, R, 0, R);
    ctx.lineTo(W - R, 0);
    ctx.arcTo(W, 0, W, R, R);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * scale) / 2, (H - img.height * scale) / 2, img.width * scale, img.height * scale);
    texture.refresh();
    return out;
  }

  /** The two main leads, side by side: avatar on top, then a large name, the role and small icon buttons, centered. */
  private leadsRow(c: Phaser.GameObjects.Container, y: number): number {
    const room = HALF_W - 20;
    const LEAD_BUTTON = 30;
    const LEAD_ICON = 17;
    // The first name and the surname each get their own line.
    const twoLines = (name: string) => name.replace(' ', '\n');
    // Both cards are as tall as the taller one needs.
    const textHeight = (lead: Account): number => {
      const n = label(this, 0, 0, twoLines(lead.name), { size: 21, bold: true, wrap: room, align: 'center' });
      const r = lead.roleKey ? label(this, 0, 0, t(lead.roleKey), { size: 15, wrap: room, align: 'center' }) : null;
      const h = n.height + (r ? r.height + 2 : 0);
      n.destroy();
      r?.destroy();
      return h;
    };
    const h = 108 + Math.max(...LEADS.map(textHeight)) + 10 + LEAD_BUTTON + 14;

    LEADS.forEach((lead, i) => {
      const x = 20 + i * (HALF_W + GAP);
      const cx = x + HALF_W / 2;
      c.add(roundedBox(this, x, y, HALF_W, h, COLORS.surface, RADIUS.card, COLORS.border));
      this.avatar(c, cx, y + 52, 46, lead.avatar);
      const name = label(this, cx, y + 108, twoLines(lead.name), { size: 21, bold: true, wrap: room, align: 'center' }).setOrigin(0.5, 0);
      c.add(name);
      if (lead.roleKey) {
        c.add(label(this, cx, y + 108 + name.height + 2, t(lead.roleKey), { size: 15, color: COLORS.muted, wrap: room, align: 'center' }).setOrigin(0.5, 0));
      }
      this.buttonRow(c, cx, y + h - 14 - LEAD_BUTTON, lead, 'center', true, LEAD_BUTTON, LEAD_ICON);
    });
    return y + h;
  }

  /**
   * A small one-line card for a character that is not the focus (Vimmy): a small avatar, the name and one short
   * line, with icon buttons on the right if there are any. No "soon" tag, so it stays quiet.
   */
  private compactCard(c: Phaser.GameObjects.Container, y: number, account: Account): number {
    const h = 72;
    c.add(roundedBox(this, 20, y, CARD_W, h, COLORS.surface, RADIUS.card, COLORS.border));
    this.avatar(c, 20 + 14 + 26, y + h / 2, 26, account.avatar);

    const x = 20 + 14 + 52 + 14;
    const room = CARD_W - (x - 20) - 16 - 3 * (BUTTON + ICON_GAP);
    const name = label(this, x, y, account.name, { size: 20, bold: true, wrap: room });
    const role = account.roleKey ? label(this, x, y, t(account.roleKey), { size: 14, color: COLORS.muted, wrap: room }) : null;
    // Centre the two lines vertically in the card.
    const top = y + (h - name.height - (role?.height ?? 0)) / 2;
    name.setY(top);
    role?.setY(top + name.height);
    c.add(name);
    if (role) c.add(role);
    this.buttonRow(c, 20 + CARD_W - 16, y + (h - BUTTON) / 2, account, 'right', false);
    return y + h;
  }

  /** The round avatar: a photo (cropped to a circle) if `avatar` is an image file name, otherwise the text/emoji. */
  private avatar(c: Phaser.GameObjects.Container, cx: number, cy: number, radius: number, avatar: string): void {
    c.add(this.add.circle(cx, cy, radius, COLORS.background).setStrokeStyle(2, COLORS.border));
    if (isPhoto(avatar)) {
      const key = this.circlePhoto(avatar);
      if (key) {
        c.add(this.add.image(cx, cy, key).setDisplaySize(radius * 2 - 2, radius * 2 - 2));
        return;
      }
      avatar = '🙂'; // the photo is missing or did not load
    }
    c.add(label(this, cx, cy, avatar, { size: Math.round(radius * 0.95) }).setOrigin(0.5));
  }

  /** A round version of a loaded photo (cropped to fill the circle, keeping the top where faces usually are). */
  private circlePhoto(avatar: string): string | null {
    const out = circleKey(avatar);
    if (this.textures.exists(out)) return out;
    if (!this.textures.exists(photoKey(avatar))) return null;

    const img = this.textures.get(photoKey(avatar)).getSourceImage() as HTMLImageElement;
    const texture = this.textures.createCanvas(out, CIRCLE_PX, CIRCLE_PX);
    if (!texture) return null;
    const ctx = texture.getContext();
    ctx.beginPath();
    ctx.arc(CIRCLE_PX / 2, CIRCLE_PX / 2, CIRCLE_PX / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(CIRCLE_PX / img.width, CIRCLE_PX / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (CIRCLE_PX - w) / 2, (CIRCLE_PX - h) * 0.25, w, h);
    texture.refresh();
    return out;
  }

  /**
   * One round icon button per platform that has a handle. If the account has platforms but none are set
   * up yet, a single quiet "soon" tag instead. `anchor` is the left edge (align 'left') or the center ('center').
   */
  private buttonRow(
    c: Phaser.GameObjects.Container,
    anchor: number,
    y: number,
    account: Account,
    align: 'left' | 'center' | 'right',
    showSoon = true,
    button = BUTTON,
    icon = ICON,
  ): void {
    const live = PLATFORMS.map((p) => ({ p, url: profileUrl(p.id, account.handles[p.id]) })).filter((a) => a.url !== null);
    const hasAny = PLATFORMS.some((p) => p.id in account.handles);

    if (live.length === 0) {
      if (!hasAny || !showSoon) return;
      // Nothing set up yet: one quiet tag.
      const text = t('promos.soon');
      const probe = label(this, 0, 0, text, { size: 13 });
      const w = probe.width + 24;
      probe.destroy();
      const x = align === 'center' ? anchor - w / 2 : align === 'right' ? anchor - w : anchor;
      const top = y + (BUTTON - 28) / 2;
      c.add(roundedBox(this, x, top, w, 28, COLORS.background, RADIUS.card, COLORS.border));
      c.add(label(this, x + w / 2, top + 14, text, { size: 13, color: COLORS.muted }).setOrigin(0.5));
      return;
    }

    const gap = ICON_GAP;
    const total = live.length * button + gap * (live.length - 1);
    let x = align === 'center' ? anchor - total / 2 : align === 'right' ? anchor - total : anchor;
    for (const { p, url } of live) {
      const cx = x + button / 2;
      const cy = y + button / 2;
      c.add(this.add.circle(cx, cy, button / 2, COLORS.primary));
      if (this.textures.exists(iconKey(p.id))) {
        c.add(this.add.image(cx, cy, iconKey(p.id)).setDisplaySize(icon, icon));
      } else {
        // The icon file did not load: fall back to the platform's name.
        c.add(label(this, cx, cy, p.name.slice(0, 2), { size: 12, bold: true, color: COLORS.onPrimary }).setOrigin(0.5));
      }
      // The tappable area is bigger than the small circle, and neighbours share the gap between them.
      c.add(hitArea(this, x - gap / 2, y + button / 2 - TAP_H / 2, button + gap, TAP_H, () => openLink(url)));
      x += button + gap;
    }
  }
}
