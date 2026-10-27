// Visual theme for the ordering-app menus. Placeholder brand until the show's
// own colors and logo are decided: change them here and every menu follows.
// Do not copy any real delivery app's logo, exact colors or icons.

export const COLORS = {
  primary: 0xff7043, // main brand color (buttons, active tab, prices)
  primaryDark: 0xe64a19,
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
  family: 'system-ui, -apple-system, "Segoe UI", sans-serif',
} as const;
