import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import type { RunResult } from '../core/RunState';
import { ZONES, zoneLabel } from '../core/zones';
import { itemName, localeInfo, t } from '../i18n';
import { addItemSprite } from '../items/itemSprite';
import { leaderboardConfigured, submitFinishedRun } from '../leaderboard/client';
import { getPlayerName } from '../leaderboard/playerName';
import { runStore } from '../leaderboard/runStore';
import instagramIcon from '../assets/icons/instagram.svg?no-inline';
import tiktokIcon from '../assets/icons/tiktok.svg?no-inline';
import xIcon from '../assets/icons/x.svg?no-inline';
import { LEADS, OFFICIAL, openLink, profileUrl, type Account, type Platform } from '../promo/config';
import { embedPilot } from '../promo/pilot';
import { ScrollList } from '../ui/ScrollList';
import { COLORS } from '../ui/theme';
import { button, fitWidth, hitArea, iconButton, label, roundedBox } from '../ui/widgets';
import { baht, withCommas } from '../core/format';

// The receipt has three zones, so it can never overlap itself however many items there are:
//   fixed header  (title, height, location)      y 0 .. LIST_TOP
//   scrolling item lines                          y LIST_TOP .. FOOTER_TOP
//   fixed footer  (total, new best, the pilot player, thanks, buttons)  y FOOTER_TOP .. bottom
const X = 36;
const LIST_TOP = 126;
const FOOTER_TOP = 362;
/** The pilot player: 16:9, as wide as the text column, under the total. */
const VIDEO = { x: X, y: 451, w: GAME_WIDTH - X * 2, h: Math.round(((GAME_WIDTH - X * 2) * 9) / 16) };
const ROW_MIN = 27;
/** Native-size item icon beside each receipt line. */
const ICON = 26;
/** The paper: a sheet with torn (zigzag) top and bottom edges on a table-coloured background. */
const PAPER = 0xfffdf7;
const TABLE = 0xefdcc0;
const SHEET = { x0: 20, x1: 460, top: 2, bottom: 722, tooth: 10, depth: 5 };
/** Item lines are set a little smaller than the header and total so more of them fit before scrolling. */
const LIST_FONT = '17px';
/** The receipt paper is only as tall as its item lines need, between these two list heights. */
const LIST_MAX = FOOTER_TOP - LIST_TOP;
const LIST_MIN = 60;
/** On a short receipt the freed space goes to who to follow, printed at the bottom of the paper: the two leads side by side, then the official account. */
const LEAD_H = 76;
const OFFICIAL_H = 58;
const FOLLOW_GAP = 6;
/** Inner padding at the left of every follow card, and the photo size, shared so the photos line up. */
const AVATAR_PAD = 8;
const AVATAR_D = 48;
/** The follow rows (View and Mim first, then the official account when there is still room): their height, and how much taller the paper gets to hold them (the gap above them included). The tagline always stays last, under them. */
const FOLLOW_BOTH_H = LEAD_H + FOLLOW_GAP + OFFICIAL_H;
const FOLLOW_EXTRA = 18;
const AVATARS = import.meta.glob<string>('../assets/avatars/*.{png,jpg,jpeg,webp}', { eager: true, query: '?no-inline', import: 'default' });
const ICON_URLS: Partial<Record<Platform, string>> = { x: xIcon, instagram: instagramIcon, tiktok: tiktokIcon };
const FOLLOW_PLATFORMS: Platform[] = ['x', 'instagram', 'tiktok'];
// The same texture keys the Promos page uses, so a picture loaded there is reused here and the other way round.
const photoKey = (file: string) => `avatar-src-${file}`;
const circleKey = (file: string) => `avatar-circle-${file}`;
const iconKey = (p: Platform) => `icon-${p}`;

/** Outline of the receipt paper: straight sides, zigzag top and bottom. */
function paperOutline(dy = 0, bottom = SHEET.bottom): { x: number; y: number }[] {
  const { x0, x1, top, tooth, depth } = SHEET;
  const teeth = Math.round((x1 - x0) / tooth);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= teeth; i++) pts.push({ x: x0 + i * tooth, y: top + dy + (i % 2 ? depth : 0) });
  for (let i = teeth; i >= 0; i--) pts.push({ x: x0 + i * tooth, y: bottom + dy - (i % 2 ? depth : 0) });
  return pts;
}

/** A tiny filled heart centred on (x, y), `size` px across. */
function drawHeart(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, colour: number): void {
  const pts: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(a), 3);
    const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    pts.push(new Phaser.Math.Vector2(x + (hx / 32) * size, y + (hy / 32) * size + size * 0.04));
  }
  g.fillStyle(colour, 0.9).fillPoints(pts, true);
}

/**
 * A thin straight line that leaves (x, y) going sideways in `dir` (-1 left, 1 right), thinning out towards the far end,
 * where a small heart sits.
 */
function drawFlourish(g: Phaser.GameObjects.Graphics, x: number, y: number, dir: -1 | 1, length: number): void {
  const colour = 0x8d6e63;
  const heart = 6;
  const steps = 12;
  const to = length - heart * 0.7;
  for (let i = 0; i < steps; i++) {
    g.lineStyle(1.7 - 0.7 * (i / steps), colour, 0.85); // a little thicker at the text, finer towards the heart
    g.lineBetween(x + dir * ((to * i) / steps), y, x + dir * ((to * (i + 1)) / steps), y);
  }
  drawHeart(g, x + dir * (length - heart * 0.4), y, heart, colour);
}

/** Native share sheet where there is one (lists Instagram, TikTok, X...); otherwise a pre-filled X post. */
async function shareScore(score: number): Promise<void> {
  const url = window.location.origin + window.location.pathname;
  const shareText = t('receipt.shareText', { score, url });
  if (navigator.share) {
    try {
      // Link inside the text: iOS share targets often drop `text` when a separate `url` is given.
      await navigator.share({ text: shareText });
    } catch {
      // Closed without sharing.
    }
    return;
  }
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
}

/** Game-over receipt: collected items as line items, total = score. Also saves the run to the order history. */
export class ReceiptScene extends Phaser.Scene {
  constructor() {
    super(SCENES.receipt);
  }

  /** The photos and icons for the follow cards under a short receipt. */
  preload(): void {
    for (const account of [OFFICIAL, ...LEADS]) {
      const url = AVATARS[`../assets/avatars/${account.avatar}`];
      if (url && !this.textures.exists(photoKey(account.avatar))) this.load.image(photoKey(account.avatar), url);
    }
    for (const platform of FOLLOW_PLATFORMS) {
      const url = ICON_URLS[platform];
      if (url && !this.textures.exists(iconKey(platform))) this.load.svg(iconKey(platform), url, { width: 128, height: 128 });
    }
  }

  create(data: { result?: RunResult }): void {
    const r = data.result ?? { heightMeters: 0, lines: [], total: 0, durationMs: 0 };
    const mono = { fontFamily: '"Noto Sans Thai", ui-monospace, Menlo, monospace', fontSize: '20px', color: '#4e342e', padding: { top: 3, bottom: 3 } };

    // Save once per run. The receipt is only opened with a result right after a run ends.
    let isBest = false;
    let orderNo: number | null = null;
    if (data.result) {
      const saved = runStore.add({
        playedAt: new Date().toISOString(),
        score: r.total,
        heightMeters: r.heightMeters,
        zoneId: r.zone ?? ZONES[0].id,
        durationMs: r.durationMs,
        itemCount: r.lines.reduce((n, l) => n + l.count, 0),
      });
      isBest = saved.isBest;
      orderNo = saved.record.no;
    }

    /** One receipt line: the name on the left (wrapping if long), the amount on the right. Returns its height. */
    const addRow = (y: number, left: string, right: string, into?: Phaser.GameObjects.Container, itemId?: string): number => {
      const style = into ? { ...mono, fontSize: LIST_FONT } : mono;
      const rightText = this.add.text(GAME_WIDTH - X, y, right, style).setOrigin(1, 0);
      const indent = itemId ? ICON + 8 : 0;
      const room = GAME_WIDTH - X * 2 - rightText.width - 14 - indent;
      const leftText = this.add.text(X + indent, y, left, { ...style, wordWrap: { width: room, useAdvancedWrap: true } });
      // Header rows must stay one line (they sit above the list), so shrink a label that would wrap on a wider phone font.
      if (!into) {
        let size = 20;
        while (size > 12 && leftText.setFontSize(size).height > size * 1.6) size -= 2; // 1.6 em: more than one line
      }
      const height = Math.max(ROW_MIN, Math.ceil(leftText.height) + 4);
      if (into) into.add([leftText, rightText]);
      if (itemId && into) into.add(addItemSprite(this, X + ICON / 2, y + height / 2 - 2, { id: itemId, color: 0xd7ccc8 }, ICON));
      return height;
    };

    // Build the item lines first: the paper is only as tall as they need, so everything under them moves up by `shift`.
    const rows = this.add.container(0, 0);
    let listY = 0;
    for (const l of r.lines) {
      const points = l.points === 0 ? '-' : `${l.points > 0 ? '+' : ''}${withCommas(l.points)}`;
      listY += addRow(listY, `${itemName(l.id, l.label)} x${l.count}`, points, rows, l.id);
    }
    const listH = Phaser.Math.Clamp(listY + 8, LIST_MIN, LIST_MAX);
    const shift = LIST_MAX - listH;
    const footerTop = FOOTER_TOP - shift;
    // The paper gives back all the space the items did not use, except what the follow cards need: the View and Mim row first, with the official account row too when both fit, and the slimmer official account row alone when only that fits.
    const hasLeads = LEADS.length > 0;
    const followH = hasLeads && shift >= FOLLOW_BOTH_H + FOLLOW_EXTRA ? FOLLOW_BOTH_H : hasLeads && shift >= LEAD_H + FOLLOW_EXTRA ? LEAD_H : shift >= OFFICIAL_H + FOLLOW_EXTRA ? OFFICIAL_H : 0;
    const sheetBottom = SHEET.bottom - shift + (followH ? followH + FOLLOW_EXTRA : 0);
    const video = { ...VIDEO, y: VIDEO.y - shift };

    // The item lines scroll behind opaque header and footer panels: the list sits at depth -1 and everything
    // else (the panels, then the texts and buttons created after them) is at the default depth 0.
    this.cameras.main.setBackgroundColor(TABLE);
    this.add.polygon(0, 0, paperOutline(3, sheetBottom)).setOrigin(0).setFillStyle(0x000000, 0.12).setDepth(-3);
    this.add.polygon(0, 0, paperOutline(0, sheetBottom)).setOrigin(0).setFillStyle(PAPER, 1).setDepth(-2);
    /** A dashed rule like the ones on printed receipts. */
    const dashed = (y: number): void => {
      const g = this.add.graphics();
      g.fillStyle(0x8d6e63, 1);
      for (let x = X; x < GAME_WIDTH - X; x += 8) g.fillRect(x, y, 4, 1.5);
    };
    const list = new ScrollList(this, LIST_TOP, footerTop, false, true);
    list.container.setDepth(-1);
    list.container.add(rows.list.slice() as Phaser.GameObjects.GameObject[]);
    rows.destroy();
    list.setContentHeight(listY + 8);

    // Fixed header.
    this.add.rectangle(SHEET.x0, SHEET.top + SHEET.depth, SHEET.x1 - SHEET.x0, LIST_TOP - SHEET.top - SHEET.depth, PAPER).setOrigin(0);
    const small = { fontFamily: mono.fontFamily, fontSize: '11px', color: '#8d6e63', padding: { top: 2, bottom: 2 } };
    if (orderNo !== null) this.add.text(X, 13, t('orders.orderNo', { n: orderNo }), small);
    const when = new Date().toLocaleString(localeInfo().dateLocale, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: localeInfo().hourCycle });
    this.add.text(GAME_WIDTH - X, 13, when, small).setOrigin(1, 0);
    this.add.text(GAME_WIDTH / 2, 40, t('receipt.title'), { ...mono, fontSize: '22px' }).setOrigin(0.5);
    dashed(LIST_TOP - 6);
    let hy = 58;
    hy += addRow(hy, t('receipt.height'), `${r.heightMeters} m`);
    const zone = ZONES.find((z) => z.id === r.zone);
    if (zone) addRow(hy, t('receipt.reached'), zoneLabel(zone));

    // Fixed footer.
    this.add.rectangle(SHEET.x0, footerTop, SHEET.x1 - SHEET.x0, sheetBottom - SHEET.depth - footerTop, PAPER).setOrigin(0);
    dashed(footerTop + 5);
    addRow(footerTop + 12, t('receipt.total'), baht(r.total));
    if (isBest) {
      label(this, GAME_WIDTH / 2, footerTop + 14, `★ ${t('receipt.newBest')}`, { size: 16, bold: true, color: COLORS.accent }).setOrigin(0.5, 0);
    }
    iconButton(this, GAME_WIDTH / 2, footerTop + 55, 40, 26, 'share', () => void shareScore(r.total));
    // Send the score to the worldwide ranking (the run is already saved on this device either way).
    const name = getPlayerName();
    if (data.result && name && leaderboardConfigured) {
      const status = label(this, GAME_WIDTH / 2, footerTop + 69, t('receipt.sending'), { size: 12, color: COLORS.muted }).setOrigin(0.5, 0);
      void submitFinishedRun(name, r.total).then((ok) => {
        if (!status.active) return; // the player already left the receipt
        if (ok) status.setText('');
        else fitWidth(status.setText(t('receipt.sendFailed')), SHEET.x1 - SHEET.x0 - 2 * X);
      });
    }
    // The pilot, right here: poster with a play button (no autoplay, so it never clashes with the game's sound).
    this.addStamp(t('receipt.thanks'), footerTop);
    embedPilot(this, video);
    const tagline = this.add
      .text(GAME_WIDTH / 2, video.y + video.h + 22 + (followH ? followH + FOLLOW_EXTRA : 0), t('receipt.tagline'), {
        fontFamily: 'Sacramento, "Brush Script MT", cursive',
        fontSize: '22px',
        color: '#8d6e63',
        padding: { top: 3, bottom: 3 },
      })
      .setOrigin(0.5);
    // Hand-lettered flourishes either side of the tagline, like the ones on old letters.
    const flourishLen = Math.min(78, (GAME_WIDTH - tagline.width) / 2 - X - 8);
    if (flourishLen > 24) {
      const gfx = this.add.graphics();
      drawFlourish(gfx, tagline.x - tagline.width / 2 - 10, tagline.y + 1, -1, flourishLen);
      drawFlourish(gfx, tagline.x + tagline.width / 2 + 10, tagline.y + 1, 1, flourishLen);
    }

    if (followH) this.addFollowCards(video.y + video.h + 14, followH !== OFFICIAL_H, followH !== LEAD_H);

    // Two buttons side by side: play again, or go back to the store.
    const by = GAME_HEIGHT - 40;
    const buttonW = (GAME_WIDTH - X * 2 - 12) / 2; // together exactly as wide as the receipt content, 12 px apart
    button(this, X + buttonW / 2, by, buttonW, 50, t('receipt.orderAgain'), () => this.scene.start(SCENES.game), 'primary', 18);
    button(this, GAME_WIDTH - X - buttonW / 2, by, buttonW, 50, t('receipt.backToStore'), () => this.scene.start(SCENES.home), 'secondary', 18);
  }

  /** A round version of a loaded avatar photo, made once (cropped to fill the circle, keeping the top where faces usually are). */
  private roundAvatar(file: string): string | null {
    const out = circleKey(file);
    if (this.textures.exists(out)) return out;
    if (!this.textures.exists(photoKey(file))) return null;
    const size = 256;
    const img = this.textures.get(photoKey(file)).getSourceImage() as HTMLImageElement;
    const canvas = this.textures.createCanvas(out, size, size);
    if (!canvas) return null;
    const ctx = canvas.getContext();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(size / img.width, size / img.height);
    ctx.drawImage(img, (size - img.width * scale) / 2, (size - img.height * scale) * 0.25, img.width * scale, img.height * scale);
    canvas.refresh();
    return out;
  }

  private addAvatar(cx: number, cy: number, radius: number, account: Account): void {
    this.add.circle(cx, cy, radius, COLORS.background).setStrokeStyle(2, COLORS.border);
    const key = this.roundAvatar(account.avatar);
    if (key) this.add.image(cx, cy, key).setDisplaySize(radius * 2 - 2, radius * 2 - 2);
  }

  /** Small round buttons for the platforms an account has set up, lined up so the last one ends at `rightEdge`. */
  private addFollowButtons(rightEdge: number, cy: number, account: Account): void {
    const r = 8;
    const step = 20;
    const found = FOLLOW_PLATFORMS.map((platform) => ({ platform, url: profileUrl(platform, account.handles[platform]) })).filter(({ platform, url }) => url && this.textures.exists(iconKey(platform)));
    found.forEach(({ platform, url }, i) => {
      const bx = rightEdge - r - (found.length - 1 - i) * step;
      this.add.circle(bx, cy, r, COLORS.background).setStrokeStyle(1.5, COLORS.border);
      this.add.image(bx, cy, iconKey(platform)).setDisplaySize(9, 9);
      hitArea(this, bx - step / 2, cy - 18, step, 36, () => openLink(url));
    });
  }

  /** Printed on the paper between the pilot video and the tagline: the two leads side by side (photo, name, follow buttons) when `withLeads`, then the official account when `withOfficial`. */
  private addFollowCards(top: number, withLeads: boolean, withOfficial: boolean): void {
    let y = top;
    const x = X;
    const w = GAME_WIDTH - x * 2;

    if (withLeads) {
      const gap = 6;
      const tileW = (w - gap) / 2;
      const leads = LEADS.slice(0, 2);
      // Each name is set on two lines (first name, then the rest) and both share one size: the biggest at which the longest line fits beside the photo.
      const lines = leads.map((lead) => {
        const [first, ...rest] = lead.name.split(' ');
        return [first, rest.join(' ')].filter(Boolean);
      });
      const nameRoom = tileW - (AVATAR_PAD + AVATAR_D + 8) - 6;
      const probes = lines.flat().map((line) => label(this, 0, 0, line, { size: 18, bold: true }));
      const nameSize = Math.max(12, Math.min(18, Math.floor((18 * nameRoom) / Math.max(...probes.map((p) => p.width), 1))));
      probes.forEach((p) => p.destroy());
      leads.forEach((lead, i) => {
        const tx = x + i * (tileW + gap);
        roundedBox(this, tx, y, tileW, LEAD_H, COLORS.surface, 16, COLORS.border);
        this.addAvatar(tx + AVATAR_PAD + AVATAR_D / 2, y + LEAD_H / 2, AVATAR_D / 2, lead);
        const textX = tx + AVATAR_PAD + AVATAR_D + 8;
        label(this, textX, y + 3, lines[i].join('\n'), { size: nameSize, bold: true });
        this.addFollowButtons(tx + tileW - 8, y + LEAD_H - 5 - 8, lead);
      });
    }
    if (!withOfficial) return;
    if (withLeads) y += LEAD_H + FOLLOW_GAP;

    roundedBox(this, x, y, w, OFFICIAL_H, COLORS.surface, 16, COLORS.border);
    this.addAvatar(x + AVATAR_PAD + AVATAR_D / 2, y + OFFICIAL_H / 2, AVATAR_D / 2, OFFICIAL);
    const textX = x + AVATAR_PAD + AVATAR_D + 8;
    const textRoom = w - (textX - x) - 10 - 28 - 8;
    const name = label(this, textX, y + 10, OFFICIAL.name, { size: 16, bold: true, wrap: textRoom });
    label(this, textX, y + 10 + name.height - 2, t('receipt.follow'), { size: 12, color: COLORS.muted, wrap: textRoom });
    // The official account is on X only; its button sits at the right end of the card.
    const url = profileUrl('x', OFFICIAL.handles.x);
    if (url && this.textures.exists(iconKey('x'))) {
      const bx = x + w - 10 - 14;
      this.add.circle(bx, y + OFFICIAL_H / 2, 14, COLORS.background).setStrokeStyle(2, COLORS.border);
      this.add.image(bx, y + OFFICIAL_H / 2, iconKey('x')).setDisplaySize(15, 15);
      hitArea(this, x, y, w, OFFICIAL_H, () => openLink(url));
    }
  }

  /** A rubber-stamp "thank you", slightly crooked and see-through, that thumps onto the paper over the item lines. */
  private addStamp(text: string, footerTop: number): void {
    const ink = COLORS.accent;
    const word = this.add
      .text(0, 0, text, { fontFamily: '"Noto Sans Thai", ui-monospace, Menlo, monospace', fontSize: '19px', fontStyle: 'bold', color: '#b83c3c', padding: { top: 2, bottom: 2 } })
      .setOrigin(0.5);
    fitWidth(word, 100);
    const w = Math.max(word.displayWidth + 22, 70);
    const h = word.displayHeight + 12;
    const box = this.add.graphics();
    box.lineStyle(3, ink, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    box.lineStyle(1, ink, 1).strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 3);
    const stamp = this.add.container(GAME_WIDTH - 118, footerTop - 40, [box, word]).setRotation(-0.2).setAlpha(0).setScale(1.7);
    this.tweens.add({ targets: stamp, alpha: 0.78, scale: 1, duration: 220, delay: 350, ease: 'Cubic.easeIn' });
  }
}
