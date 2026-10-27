// Visual theme for the ordering-app menus: a bee-themed parody of a Thai delivery app
// (honey yellow and dark brown, to match the dog in a bee costume). Placeholder until the
// show's own colors and logo are decided: change them here and every menu follows.
// Do not copy any real delivery app's logo, mascot, exact colors or icons (see README).

export const COLORS = {
  primary: 0xffb300, // honey yellow: buttons, banner, filled chips
  primaryDark: 0xc68400, // button shadow
  onPrimary: 0x3e2723, // text on top of the primary color
  accent: 0xe65100, // readable highlight on white: prices, active tab
  background: 0xfff3e0,
  surface: 0xffffff,
  border: 0xf0dcc3,
  text: 0x4e342e,
  muted: 0x8d6e63,
  points: 0xf9a825, // item kinds, matching the in-game outlines
  buff: 0x2e7d32,
  debuff: 0xb71c1c,
} as const;

export function hex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

export const FONT = {
  family: 'system-ui, -apple-system, "Segoe UI", "Noto Sans Thai", "Noto Sans JP", "Noto Sans SC", sans-serif',
} as const;
