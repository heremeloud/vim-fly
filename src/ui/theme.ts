// Visual theme for the ordering-app menus: a bee-themed parody of a Thai delivery app
// (butter yellow and chocolate brown, taken from the show's poster, with its lavender as the signature
// accent). Change them here and every menu follows.
// Do not copy any real delivery app's logo, mascot, exact colors or icons (see README).

export const COLORS = {
  primary: 0xf7bd3b, // butter yellow (the show's title letters): buttons, banner, filled chips
  primaryDark: 0xb98022, // button shadow (caramel wood)
  onPrimary: 0x4a2a14, // text on top of the primary color (the title's chocolate outline)
  accent: 0xb83c3c, // readable highlight on white: prices, active tab (gingham red)
  highlight: 0x9f93f0, // the show's lavender (poster header): used on the Promos page
  highlightDark: 0x7b6ed6, // shadow for the lavender
  pink: 0xf7b4c6, // the "LOVE" pink: small touches
  mint: 0xbfdccb, // the sage kitchen utensils: small touches
  primarySoft: 0xffecb3, // pale butter: countdown pill, icon tiles
  lavenderSoft: 0xe6e1fa,
  pinkSoft: 0xfce3ea,
  mintDark: 0x86ad9a, // outline for the sage utensils
  mintSoft: 0xdcebe2,
  ginghamDark: 0xe4909f, // the darker check in the gingham edge
  scrim: 0x2a170c, // dimmed backdrop behind dialogs (chocolate, not pure black)
  background: 0xfff6e8,
  surface: 0xffffff,
  border: 0xecd9bd,
  text: 0x553219,
  muted: 0x8a6a55,
  points: 0xf9a825, // item kinds, matching the in-game outlines
  buff: 0x2e7d32,
  debuff: 0xb71c1c,
} as const;

/** Corner radii, so every card, control and dialog shares the same family of shapes. */
export const RADIUS = {
  card: 16, // list rows, shop cards, tiles
  control: 12, // inputs, tiles inside a card, buttons
  sheet: 22, // dialogs
} as const;

/** Opacity of the dimmed backdrop behind dialogs. */
export const SCRIM_ALPHA = 0.55;

export function hex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

export const FONT = {
  // Chunky rounded letters for page titles and the app name, close to the puffy lettering of the show's logo (Latin only; other scripts fall through to `family`).
  display: '"Sniglet", "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", "Noto Sans JP", "Noto Sans SC", sans-serif',
  // Noto Sans Thai is bundled and only covers Thai characters, so it is listed first: Thai text always gets it,
  // and Latin text falls through to the device font.
  family: '"Noto Sans Thai", system-ui, -apple-system, "Segoe UI", "Noto Sans JP", "Noto Sans SC", sans-serif',
} as const;
