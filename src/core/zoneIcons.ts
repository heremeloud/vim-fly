import type { ZoneId } from './zones';

/**
 * Emoji that decorate each location's backdrop. Each zone has two rows of up to three different emoji (a row of two is spread evenly):
 * the first row sits on the upper half of the tile, the second on the lower half (see
 * BootScene.makeBackdrop). Emoji that show a person or body part use the light skin tone.
 */
export const ZONE_ICONS: Record<ZoneId, [string[], string[]]> = {
  ruralRoad: [['🌾', '🐱', '🌳'], ['🚙', '🚗', '🐄']],
  bakery: [['🥖', '🍞', '🥐'], ['🥐', '🍫', '🥯']],
  cafes: [['☕', '🍰', '🥪'], ['🧋', '🍪', '🧁']],
  mall: [['🍿', '🛍️', '🎬'], ['🧸', '🍦']],
  lawOffice: [['⚖️', '💼', '📜'], ['🖊️', '📁', '📎']],
  gym: [['🏋🏻', '💪🏻', '🥤'], ['🤸🏻', '🥗', '👟']],
  courtroom: [['🧑🏻‍⚖️', '⚖️', '📜'], ['🏛️', '📚', '🖋️']],
  beach: [['🐚', '🌊', '🦀'], ['⛱️', '🍹', '🌴']],
  residence: [['🏢', '🌃', '🛏️'], ['🍷', '🛋️', '🌙']],
  bakeLove: [['🤎', '🤍', '🎉'], ['🍞', '🧈', '🧀']],
};
