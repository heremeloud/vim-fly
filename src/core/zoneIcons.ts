import type { ZoneId } from './zones';

/**
 * Emoji that decorate each location's backdrop. Each zone has two rows of three different emoji:
 * the first row sits on the upper half of the tile, the second on the lower half (see
 * BootScene.makeBackdrop).
 */
export const ZONE_ICONS: Record<ZoneId, [string[], string[]]> = {
  ruralRoad: [['🌾', '🚗', '🌳'], ['🚙', '🐱', '🌻']],
  bakery: [['🥖', '🍞', '🥨'], ['🥐', '🧁', '🥯']],
  cafes: [['☕', '🍰', '🥪'], ['🧋', '🍪', '🥐']],
  mall: [['🍿', '🛍️', '🎬'], ['👗', '🧸', '🍦']],
  lawOffice: [['⚖️', '💼', '📜'], ['🖊️', '📁', '📎']],
  gym: [['🏋️', '💪', '🥤'], ['🤸', '🥗', '👟']],
  courtroom: [['🧑‍⚖️', '⚖️', '📜'], ['🏛️', '📚', '🖋️']],
  beach: [['🐚', '🌊', '🦀'], ['⛱️', '🍹', '🌴']],
  residence: [['🏢', '🌃', '🔑'], ['🍷', '🛋️', '🌙']],
  bakeLove: [['🤎', '🤍', '🧁'], ['🍞', '🧈', '🧀']],
};
