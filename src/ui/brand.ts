// The in-game "delivery app" the menus pretend to be. A parody of Thai delivery apps,
// mixing LINE MAN (shop pages, riders) with Grab (the "super app" grid of services).
// The parody is in the layout and the jokes; the name is our own (the dog) and borrows nothing
// from either app. Text that changes with the language lives in src/i18n.

import type { StringKey } from '../i18n';

export const APP = {
  /** The app is named after Vimmy, the dog who delivers. */
  name: 'VIMMY FLY',
  /** The bakery the app is delivering from; also the last location of the story. */
  shopName: 'Bake Love Bakery',
} as const;

export interface Service {
  icon: string;
  labelKey: StringKey;
  /** Where the tile goes: the item guide, the Bake Love Feeling page, the pilot (plays in a window), the official X account (opens in a new tab), or straight into a run. */
  target: 'menu' | 'promos' | 'pilot' | 'official' | 'play';
}

/**
 * The super-app service tiles on the home screen, like Grab's grid of services. Each one is a shortcut
 * to something real. Change a tile's `target`, or delete its line to remove it.
 */
export const SERVICES: readonly Service[] = [
  { icon: '🍞', labelKey: 'svc.food', target: 'menu' }, // what falls from the sky
  { icon: '🛒', labelKey: 'svc.mart', target: 'promos' }, // the show's page: cast, links
  { icon: '📦', labelKey: 'svc.express', target: 'official' }, // the show, delivered fast: the official X account
  { icon: '🛵', labelKey: 'svc.ride', target: 'pilot' }, // ride along with the show: plays the pilot (for now)
];
