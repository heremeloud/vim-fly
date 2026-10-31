import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { toLayout } from '../core/render';
import { LOCALES, getLocale, localeInfo, setLocale, t, type StringKey } from '../i18n';
import { COLORS, FONT, RADIUS, SCRIM_ALPHA, hex } from './theme';
import { drawIcon, type IconId } from './icons';

export const TAB_BAR_HEIGHT = 54;

export interface TextOpts {
  size?: number;
  color?: number;
  bold?: boolean;
  wrap?: number;
  /** Keep the text on one line no more than this wide: it shrinks a little, then ends in "…". For labels whose text can change with the language. */
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  /** Use the chunky display font (page titles, the app name). */
  display?: boolean;
}

/** Make a single-line text fit `maxWidth`: scale it down (not below `minScale`), then trim the end with "…". */
export function fitWidth(text: Phaser.GameObjects.Text, maxWidth: number, minScale = 0.8): Phaser.GameObjects.Text {
  if (text.width <= maxWidth) return text;
  const scale = Math.max(minScale, maxWidth / text.width);
  text.setScale(scale);
  const chars = Array.from(text.text);
  while (chars.length > 1 && text.width * scale > maxWidth) {
    chars.pop();
    text.setText(chars.join('').trimEnd() + '…');
  }
  return text;
}

/** Text in the menu font. */
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  { size = 18, color = COLORS.text, bold = false, wrap, maxWidth, align, display = false }: TextOpts = {},
): Phaser.GameObjects.Text {
  // Dense kanji (such as 履歴) clog under the outline made for Latin letters, so it is a little thinner for them.
  const thin = display && getLocale() !== 'en' && getLocale() !== 'th';
  const obj = scene.add.text(x, y, text, {
    fontFamily: display ? FONT.display : FONT.family,
    letterSpacing: display ? 1 : 0, // a little air so the outline never closes up the counters (the "e")
    fontSize: `${size}px`,
    fontStyle: bold && !display ? 'bold' : 'normal', // the display font is already heavy; faking bold on it would be too fat
    color: hex(color),
    stroke: display ? hex(color) : undefined, // a thin outline in the text color: Sniglet Regular is too light, ExtraBold too fat
    strokeThickness: display ? (thin ? 2 : 2.6) : 0,
    wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined, // advanced wrap also breaks long unspaced text (Japanese, Chinese, Thai)
    align,
    padding: { top: 3, bottom: 3 }, // room for tall Thai and CJK glyphs
  });
  return maxWidth ? fitWidth(obj, maxWidth) : obj;
}

/** A filled rounded rectangle (top-left origin). */
export function roundedBox(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  radius: number = RADIUS.card,
  stroke?: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, radius);
  if (stroke !== undefined) g.lineStyle(2, stroke, 1).strokeRoundedRect(x, y, w, h, radius);
  return g;
}

/** An invisible tappable area. */
export function hitArea(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  onTap: () => void,
): Phaser.GameObjects.Rectangle {
  const r = scene.add.rectangle(x, y, w, h, 0xffffff, 0.001).setOrigin(0).setInteractive({ useHandCursor: true });
  // Ignore the tap if the finger dragged (scrolling a list), so scrolling never opens things.
  r.on('pointerup', (p: Phaser.Input.Pointer) => {
    if (toLayout(Math.hypot(p.x - p.downX, p.y - p.downY)) < 12) onTap();
  });
  return r;
}

/**
 * A compact app button, centered on (cx, cy). Corners are deliberately not full pills so the
 * interface keeps a more editorial, less template-like silhouette. Pass `depth` when it sits on a dialog;
 * the returned objects are every piece of the button, so a dialog can destroy them with the rest.
 */
export function button(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  text: string,
  onTap: () => void,
  variant: 'primary' | 'secondary' = 'primary',
  size = 24,
  depth = 0,
): Phaser.GameObjects.GameObject[] {
  const x = cx - w / 2;
  const y = cy - h / 2;
  // Puffy like the show's bread-shaped lettering: a plump body with a chocolate crust outline and a soft shine on top.
  const radius = Math.min(h / 2.4, 24);
  const parts: Phaser.GameObjects.GameObject[] = [];
  const body = scene.add.graphics().setDepth(depth);
  if (variant === 'primary') {
    body.fillStyle(COLORS.onPrimary, 1).fillRoundedRect(x, y + 4, w, h, radius); // crust shadow
    body.fillStyle(COLORS.primary, 1).fillRoundedRect(x, y, w, h, radius);
    body.fillStyle(0xffffff, 0.35).fillRoundedRect(x + radius * 0.6, y + 5, w - radius * 1.2, Math.max(4, h * 0.16), h * 0.08); // shine
    body.lineStyle(3, COLORS.onPrimary, 1).strokeRoundedRect(x, y, w, h, radius);
  } else {
    body.fillStyle(COLORS.surface, 1).fillRoundedRect(x, y, w, h, radius);
    body.lineStyle(3, COLORS.onPrimary, 1).strokeRoundedRect(x, y, w, h, radius);
  }
  parts.push(body);
  parts.push(label(scene, cx, cy, text, { size, color: COLORS.onPrimary, bold: true, maxWidth: w - 24 }).setOrigin(0.5).setDepth(depth + 1));
  parts.push(hitArea(scene, x, y, w, h, onTap).setDepth(depth + 2));
  return parts;
}

/** A small rounded-rectangle button with just an icon (same crust outline as `button`), centered on (cx, cy). */
export function iconButton(scene: Phaser.Scene, cx: number, cy: number, w: number, h: number, icon: IconId, onTap: () => void, depth = 0): Phaser.GameObjects.GameObject[] {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const radius = Math.min(h / 2.4, 24);
  const body = scene.add.graphics().setDepth(depth);
  body.fillStyle(COLORS.onPrimary, 1).fillRoundedRect(x, y + 3, w, h, radius); // crust shadow
  body.fillStyle(COLORS.surface, 1).fillRoundedRect(x, y, w, h, radius);
  body.lineStyle(3, COLORS.onPrimary, 1).strokeRoundedRect(x, y, w, h, radius);
  return [body, drawIcon(scene, icon, cx, cy, COLORS.onPrimary, { width: 2 }).setScale(h / 30 + 0.1).setDepth(depth + 1), hitArea(scene, x, y, w, h, onTap).setDepth(depth + 2)];
}

/** A gingham ribbon (two rows of small checks in the show's tablecloth pink), used as the hem of page headers. */
export function gingham(scene: Phaser.Scene, x: number, y: number, w: number, cell = 3): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setPosition(x, y);
  g.fillStyle(COLORS.pink, 1).fillRect(0, 0, w, cell * 2);
  g.fillStyle(COLORS.ginghamDark, 1);
  for (let i = 0; i * cell < w; i++) {
    for (let r = 0; r < 2; r++) if ((i + r) % 2 === 0) g.fillRect(i * cell, r * cell, Math.min(cell, w - i * cell), cell);
  }
  return g;
}

/**
 * A blob of cream dough with a wide-eyed face, like the little ones in the show's art: a bean shape with a round top,
 * pale cream and a soft outline, eyes glancing down and to the left, pink cheeks. It stands on `baseY` (the caller draws
 * something over the bottom edge, such as the gingham hem) and is `h` tall, centred on `cx`.
 */
export type BlobMood = 'curious' | 'wow' | 'love';

export function doughBlob(scene: Phaser.Scene, cx: number, baseY: number, h: number, depth: number, mood: BlobMood = 'curious'): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const top = baseY - h;
  // A lopsided bean: the peak leans left and the right shoulder sits lower, with a slight lump low on the right.
  const V = (x: number, y: number): Phaser.Math.Vector2 => new Phaser.Math.Vector2(cx + x, baseY + y);
  const outline: Phaser.Math.Vector2[] = [];
  const curves: [number, number, number, number, number, number, number, number][] = [
    [-23, 0, -26, -h * 0.45, -20, -h * 0.9, -6, -h],
    [-6, -h, 8, -h - 3, 21, -h * 0.62, 22, -h * 0.34],
    [22, -h * 0.34, 25, -h * 0.2, 24, -5, 21, 0],
  ];
  for (const c of curves) outline.push(...new Phaser.Curves.CubicBezier(V(c[0], c[1]), V(c[2], c[3]), V(c[4], c[5]), V(c[6], c[7])).getPoints(14));
  g.fillStyle(0xf8e6b8, 1).fillPoints(outline, true);
  g.fillStyle(0xffffff, 0.4).fillRoundedRect(cx - 16, top + 10, 5, 17, 2.5); // soft shine
  g.lineStyle(2, 0xe2c88a, 1).strokePoints(outline, true, true);
  const dark = COLORS.onPrimary;
  // He always has googly eyes: white discs with no outline and loose pupils that always sink to the bottom.
  // The mood is in the eye size, which way the pupils lean, and the mouth.
  const googly = (ex: number, ey: number, w: number, h: number, px: number, py: number): void => {
    g.fillStyle(0xffffff, 1).fillEllipse(ex, ey, w, h);
    g.fillStyle(dark, 1).fillEllipse(ex + px, ey + py, w * 0.46, h * 0.5);
  };
  // The same face every time (tall oval eyes set close together, pupils sunk down and to the left, rosy cheeks);
  // only the expression changes: nothing, an impressed little "o", or a happy open smile.
  g.fillStyle(COLORS.pink, 0.9).fillEllipse(cx - 15, top + 37, 10, 6).fillEllipse(cx + 17, top + 40, 10, 6);
  googly(cx - 6, top + 26, 12, 17, -2.4, 3);
  googly(cx + 9, top + 28, 11, 16, -2.4, 3);
  if (mood === 'wow') {
    g.lineStyle(1.6, 0xc9ab70, 1); // raised brows
    g.beginPath().arc(cx - 6, top + 23, 8, Math.PI * 1.2, Math.PI * 1.8).strokePath();
    g.beginPath().arc(cx + 9, top + 25, 7.5, Math.PI * 1.2, Math.PI * 1.8).strokePath();
    g.fillStyle(dark, 1).fillEllipse(cx + 1.5, top + 39, 4.5, 5.5);
  } else if (mood === 'love') {
    g.fillStyle(dark, 1).fillPoints(
      Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI; // the lower half of an ellipse: an open smile
        return new Phaser.Math.Vector2(cx + 1.5 + Math.cos(a) * 4.5, top + 36 + Math.sin(a) * 4.5);
      }),
      true,
    );
    g.fillStyle(COLORS.pink, 1).fillEllipse(cx + 1.5, top + 39.5, 4.5, 2.4);
    // In love: little hearts drifting up from him.
    const heart = (hx: number, hy: number, r: number, tilt: number): void => {
      const h = scene.add.graphics().setPosition(hx, hy).setRotation(tilt).setDepth(depth);
      h.fillStyle(0xe8758f, 1);
      h.fillCircle(-r * 0.55, -r * 0.3, r * 0.6).fillCircle(r * 0.55, -r * 0.3, r * 0.6);
      h.fillTriangle(-r * 1.1, -r * 0.1, r * 1.1, -r * 0.1, 0, r * 1.1);
    };
    heart(cx - 28, top + 20, 4.5, -0.25);
    heart(cx + 25, top + 12, 5.5, 0.2);
    heart(cx + 27, top + 32, 3.5, 0.35);
  }
  // A tiny baker's hat perched on its head, a little crooked.
  const hat = scene.add.graphics().setPosition(cx - 5, top + 2).setRotation(-0.12).setDepth(depth);
  hat.fillStyle(0xffffff, 1).lineStyle(1.6, 0xd9c9a3, 1);
  for (const [px, py, pr] of [[-7, -8, 6], [0, -12, 7], [7, -8, 6]] as const) hat.fillCircle(px, py, pr).strokeCircle(px, py, pr);
  hat.fillCircle(-7, -8, 5.2).fillCircle(0, -12, 6.2).fillCircle(7, -8, 5.2); // hide the outlines where the puffs overlap
  hat.fillRoundedRect(-11, -6, 22, 8, 2).strokeRoundedRect(-11, -6, 22, 8, 2);
  // Two tiny tools dangling above the hat.
  hangingUtensils(scene, cx - 12, depth, { scale: 0.4, pick: [3, 4], gap: 20 });
  return g;
}

/** The filter chip row under a page header: `count` chips of equal width filling the page, all 40 px tall, 12 px apart. */
export const CHIP = { y: 106, h: 40, gap: 12, size: 17 } as const;
export function chipWidth(count: number): number {
  return (GAME_WIDTH - 40 - CHIP.gap * (count - 1)) / count;
}

/**
 * Baking tools (whisk, rolling pin, measuring spoon) hanging from the top edge on little hooks, like the ones in the show's
 * kitchen. `x` is the first hook; the next ones follow `gap` px apart. `scale` and `pick` make a smaller, shorter set (the tiny pair over the dough blob). Each swings a few degrees off straight.
 */
export function hangingUtensils(scene: Phaser.Scene, x: number, depth: number, { scale = 1, pick, gap = 28 }: { scale?: number; pick?: number[]; gap?: number } = {}): void {
  const stroke = COLORS.mintDark;
  const tools: { draw: (g: Phaser.GameObjects.Graphics) => void; tilt: number }[] = [
    {
      tilt: -0.05,
      draw: (g) => {
        g.fillStyle(COLORS.mint, 1).fillRoundedRect(-2.5, 6, 5, 20, 2.5).strokeRoundedRect(-2.5, 6, 5, 20, 2.5);
        g.strokeEllipse(0, 40, 15, 26); // the whisk's wires
        g.strokeEllipse(0, 40, 6, 26);
        g.lineBetween(0, 26, 0, 53);
      },
    },
    {
      // A wooden rolling pin.
      tilt: 0.04,
      draw: (g) => {
        g.lineStyle(1.8, COLORS.primaryDark, 1).fillStyle(0xf0d49a, 1);
        g.fillRoundedRect(-1.8, 4, 3.6, 8, 1.5).strokeRoundedRect(-1.8, 4, 3.6, 8, 1.5);
        g.fillRoundedRect(-5.5, 11, 11, 32, 4.5).strokeRoundedRect(-5.5, 11, 11, 32, 4.5);
        g.fillRoundedRect(-1.8, 42, 3.6, 8, 1.5).strokeRoundedRect(-1.8, 42, 3.6, 8, 1.5);
        g.lineBetween(-5.5, 18, 5.5, 18);
        g.lineBetween(-5.5, 36, 5.5, 36);
      },
    },
    {
      // A measuring spoon, hung up by the hole in its handle.
      tilt: -0.03,
      draw: (g) => {
        g.lineStyle(1.8, COLORS.mintDark, 1).fillStyle(COLORS.mint, 1);
        g.fillRoundedRect(-2.5, 4, 5, 26, 2.5).strokeRoundedRect(-2.5, 4, 5, 26, 2.5);
        g.fillEllipse(0, 38, 15, 17).strokeEllipse(0, 38, 15, 17);
        g.fillStyle(COLORS.background, 1).fillCircle(0, 8, 1.1);
      },
    },
    {
      // A silicone spatula.
      tilt: 0.05,
      draw: (g) => {
        g.fillStyle(COLORS.mint, 1).fillRoundedRect(-2.2, 5, 4.4, 24, 2).strokeRoundedRect(-2.2, 5, 4.4, 24, 2);
        g.fillRoundedRect(-6.5, 28, 13, 20, 4).strokeRoundedRect(-6.5, 28, 13, 20, 4);
      },
    },
    {
      // A pastry brush with butter-yellow bristles.
      tilt: -0.05,
      draw: (g) => {
        g.lineStyle(1.8, COLORS.primaryDark, 1).fillStyle(0xf0d49a, 1);
        g.fillRoundedRect(-2.2, 5, 4.4, 24, 2).strokeRoundedRect(-2.2, 5, 4.4, 24, 2);
        g.fillStyle(COLORS.primary, 1).fillRoundedRect(-6.5, 29, 13, 5, 1.5).strokeRoundedRect(-6.5, 29, 13, 5, 1.5);
        g.fillRoundedRect(-6, 34, 12, 14, 3).strokeRoundedRect(-6, 34, 12, 14, 3);
      },
    },
  ];
  (pick ? pick.map((k) => tools[k]) : tools).forEach((tool, i) => {
    const hx = x + i * gap;
    const drop = 9 * scale; // length of the string
    const cord = scene.add.graphics().setDepth(depth);
    cord.lineStyle(Math.max(1, 1.4 * scale), stroke, 1).lineBetween(hx, 0, hx, drop + 5 * scale);
    cord.fillStyle(stroke, 1).fillCircle(hx, 0, Math.max(1.2, 1.8 * scale)); // the nail it hangs from
    const g = scene.add.graphics().setPosition(hx, drop).setDepth(depth).setRotation(tool.tilt).setScale(scale);
    g.lineStyle(1.8, stroke, 1);
    g.lineStyle(1.8, stroke, 1);
    tool.draw(g);
  });
}

/** Where the gingham hem sits on every tab page: just under the title and subtitle, above the chips. */
export const HEM_Y = 92;

/**
 * The header of a tab page: opaque (so rows scrolled under it are hidden, and taps don't reach them), a title,
 * an optional muted subtitle and a gingham hem. Returns the subtitle so a page can make it interactive.
 */
export function pageHeader(scene: Phaser.Scene, height: number, title: string, subtitle?: string, mood: BlobMood = 'curious'): Phaser.GameObjects.Text | null {
  scene.add.rectangle(0, 0, GAME_WIDTH, height, COLORS.background).setOrigin(0).setDepth(40).setInteractive();
  label(scene, 20, 20, title, { size: 32, bold: true, display: true, maxWidth: GAME_WIDTH - 180 }).setDepth(41);
  hangingUtensils(scene, GAME_WIDTH - 150, 41, { pick: [0, 1, 2] });
  doughBlob(scene, GAME_WIDTH - 42, HEM_Y + 4, 52, 41, mood);
  gingham(scene, 0, HEM_Y, GAME_WIDTH).setDepth(41);
  if (subtitle === undefined) return null;
  return label(scene, 20, 66, subtitle, { size: 15, color: COLORS.muted, maxWidth: GAME_WIDTH - 40 }).setDepth(41);
}

/**
 * A filter chip (the pills under a page title). `color` is the chip's own color; `onColor` is the text color
 * when it is filled. Draws into `g`, clearing it first, so a page can repaint when the selection changes.
 */
export function paintChip(g: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text, x: number, y: number, w: number, h: number, on: boolean, color: number, onColor: number, offTextColor = color): void {
  g.clear();
  g.fillStyle(on ? color : COLORS.surface, 1).fillRoundedRect(x, y, w, h, h / 2);
  g.lineStyle(2, color, 1).strokeRoundedRect(x, y, w, h, h / 2);
  text.setColor(hex(on ? onColor : offTextColor));
}

/** An item picture on a rounded tile with a colored outline (the item kind), shared by the home page and the menu. */
export function itemTile(scene: Phaser.Scene, cx: number, cy: number, size: number, outline: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.background, 1).fillRoundedRect(cx - size / 2, cy - size / 2, size, size, RADIUS.control);
  g.lineStyle(3, outline, 1).strokeRoundedRect(cx - size / 2, cy - size / 2, size, size, RADIUS.control);
  return g;
}

/** The dimmed backdrop behind a dialog. Swallows taps meant for what is underneath. */
export function scrim(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.scrim, SCRIM_ALPHA).setOrigin(0).setDepth(depth);
}

export type TabId = 'store' | 'menu' | 'orders' | 'promos';

const TABS: { id: TabId; key: StringKey }[] = [
  { id: 'store', key: 'tab.store' },
  { id: 'menu', key: 'tab.menu' },
  { id: 'orders', key: 'tab.orders' },
  { id: 'promos', key: 'tab.promos' },
];

const TAB_ICONS: Record<TabId, IconId> = { store: 'home', menu: 'menu', orders: 'orders', promos: 'gift' };

function tabTarget(id: TabId): { scene: string; data?: object } {
  switch (id) {
    case 'store':
      return { scene: SCENES.home };
    case 'menu':
      return { scene: SCENES.menu };
    case 'orders':
      return { scene: SCENES.orders };
    case 'promos':
      return { scene: SCENES.promos };
  }
}

/** The bottom tab bar, drawn above scrolling content. */
export function tabBar(scene: Phaser.Scene, active: TabId): void {
  const y = GAME_HEIGHT - TAB_BAR_HEIGHT;
  const depth = 50;
  // Interactive so taps on rows scrolled underneath the bar don't reach them.
  scene.add.rectangle(0, y, GAME_WIDTH, TAB_BAR_HEIGHT, COLORS.surface).setOrigin(0).setDepth(depth).setInteractive();
  scene.add.rectangle(0, y, GAME_WIDTH, 2, COLORS.border).setOrigin(0).setDepth(depth);

  const w = GAME_WIDTH / TABS.length;
  TABS.forEach((tab, i) => {
    const cx = i * w + w / 2;
    const on = tab.id === active;
    if (on) scene.add.graphics().setDepth(depth).fillStyle(COLORS.primarySoft, 1).fillRoundedRect(cx - 24, y + 3, 48, 30, 15);
    drawIcon(scene, TAB_ICONS[tab.id], cx, y + 18, on ? COLORS.accent : COLORS.muted).setDepth(depth).setAlpha(on ? 1 : 0.72);
    label(scene, cx, y + 41, t(tab.key), { size: 12, color: on ? COLORS.accent : COLORS.muted, bold: on })
      .setOrigin(0.5)
      .setDepth(depth);
    const hit = hitArea(scene, i * w, y, w, TAB_BAR_HEIGHT, () => {
      const target = tabTarget(tab.id);
      // Only skip when we are already on that tab's own screen. A highlighted tab can be showing a
      // different page (the Store tab can stay lit while another page is showing), and tapping it must still go home.
      if (scene.scene.key === target.scene) return;
      scene.scene.start(target.scene, target.data);
    });
    hit.setDepth(depth + 1);
  });
}

/**
 * A small language button (text only, no flags) for the top-right corner. Tapping it opens a list of
 * the languages; choosing one saves it and restarts the scene so everything is redrawn.
 */
export function languageButton(scene: Phaser.Scene, rightX: number, y: number): void {
  const text = label(scene, rightX, y, localeInfo().name, { size: 15, color: COLORS.onPrimary, bold: true }).setOrigin(1, 0);
  text.setDepth(30);
  const globe = drawIcon(scene, 'globe', rightX - text.width - 16, y + text.height / 2, COLORS.onPrimary, { width: 1.8 });
  globe.setScale(0.8).setDepth(30);
  hitArea(scene, rightX - text.width - 36, y - 4, text.width + 44, text.height + 8, () => openLanguagePicker(scene)).setDepth(31);
}

export function openLanguagePicker(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const close = () => items.forEach((o) => o.destroy());

  const dim = scrim(scene, depth).setInteractive();
  dim.on('pointerup', close);
  items.push(dim);

  const rowH = 58;
  const cardW = 320;
  const cardH = 70 + LOCALES.length * rowH;
  const x = (GAME_WIDTH - cardW) / 2;
  const y = (GAME_HEIGHT - cardH) / 2;
  items.push(roundedBox(scene, x, y, cardW, cardH, COLORS.surface, RADIUS.sheet, COLORS.border).setDepth(depth + 1));
  items.push(scene.add.rectangle(x, y, cardW, cardH, 0xffffff, 0.001).setOrigin(0).setDepth(depth + 1).setInteractive()); // taps on the card must not close it
  items.push(label(scene, GAME_WIDTH / 2, y + 20, t('lang.title'), { size: 22, bold: true }).setOrigin(0.5, 0).setDepth(depth + 2));

  LOCALES.forEach((loc, i) => {
    const ry = y + 62 + i * rowH;
    const on = loc.id === getLocale();
    items.push(roundedBox(scene, x + 16, ry, cardW - 32, rowH - 8, on ? COLORS.primary : COLORS.background, RADIUS.control).setDepth(depth + 2));
    items.push(label(scene, x + 36, ry + 12, loc.name, { size: 22, bold: true, color: on ? COLORS.onPrimary : COLORS.text }).setDepth(depth + 3));
    if (on) items.push(drawIcon(scene, 'check', x + cardW - 52, ry + (rowH - 8) / 2, COLORS.onPrimary, { width: 2.8 }).setDepth(depth + 3));
    items.push(hitArea(scene, x + 16, ry, cardW - 32, rowH - 8, () => {
      setLocale(loc.id);
      close();
      scene.scene.restart();
    }).setDepth(depth + 4));
  });
}

/**
 * Wrapped paragraphs where **double-starred** words are bold and *single-starred* words are italic. A Phaser Text has
 * one style, so each word is its own Text, placed left to right and wrapped by hand. The gap between paragraphs is `paraStep` lines from one paragraph's last line to the next one's first.
 * Japanese and Chinese have no spaces, so each of their characters is a word of its own.
 */
export function layoutRich(scene: Phaser.Scene, paragraphs: string[], x: number, y: number, maxW: number, size: number, depth: number, paraStep = 1.5): { items: Phaser.GameObjects.Text[]; height: number } {
  const items: Phaser.GameObjects.Text[] = [];
  const word = (text: string, bold: boolean, italic = false): Phaser.GameObjects.Text => {
    const obj = label(scene, 0, 0, text, { size, bold }).setDepth(depth);
    if (italic) obj.setFontStyle('italic');
    return obj;
  };
  const probe = word('a', false);
  const lineH = probe.height;
  const space = size * 0.3;
  probe.destroy();
  let cx = 0;
  let cy = 0;
  paragraphs.forEach((para, i) => {
    if (i > 0) {
      cy += lineH * paraStep;
      cx = 0;
    }
    const chunks = para
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .filter(Boolean)
      .map((raw) => {
        const bold = raw.startsWith('**') && raw.endsWith('**');
        const italic = !bold && raw.startsWith('*') && raw.endsWith('*');
        return { text: bold ? raw.slice(2, -2) : italic ? raw.slice(1, -1) : raw, bold, italic };
      });
    let gap = false; // whitespace seen since the last word, so the next word is set apart from it
    chunks.forEach((chunk) => {
      (chunk.text.match(/\s+|[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]|[^\s\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]+/g) ?? []).forEach((w) => {
        if (/^\s/.test(w)) {
          gap = true;
          return;
        }
        const obj = word(w, chunk.bold, chunk.italic);
        if (gap && cx > 0) cx += space;
        gap = false;
        if (cx > 0 && cx + obj.width > maxW) {
          cx = 0;
          cy += lineH;
        }
        obj.setPosition(x + cx, y + cy);
        items.push(obj);
        cx += obj.width;
      });
    });
  });
  return { items, height: cy + lineH };
}
