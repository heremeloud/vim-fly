// The in-game "delivery app" the menus pretend to be. A parody of Thai delivery apps,
// mixing LINE MAN (shop pages, riders) with Grab (the "super app" grid of services).
// The parody is in the layout and the jokes; the name is our own (the dog) and borrows nothing
// from either app. Text that changes with the language lives in src/i18n.

import type { StringKey } from '../i18n';
import type { IconId } from './icons';
import type { COLORS } from './theme';

export const APP = {
  /** The app is named after Vimmy, the dog who delivers. */
  name: 'VIMMY FLY',
  /** The bakery the app is delivering from; also the last location of the story. */
  shopName: 'Bake Love Feeling Bakery',
} as const;

export interface Service {
  icon: IconId;
  /** The pale tile color behind the icon (a key of `COLORS`). */
  tint: keyof typeof COLORS;
  labelKey: StringKey;
  /** Where the tile goes: the item guide, the Bake Love Feeling page, the pilot (opens on YouTube in a new tab; no tile uses it now), the official X account (opens in a new tab), the ViewMim site (opens in a new tab), or straight into a run. */
  target: 'menu' | 'promos' | 'pilot' | 'official' | 'viewmim' | 'play';
}

/**
 * The super-app service tiles on the home screen, like Grab's grid of services. Each one is a shortcut
 * to something real. Change a tile's `target`, or delete its line to remove it.
 */
export const SERVICES: readonly Service[] = [
  { icon: 'bread', tint: 'primarySoft', labelKey: 'svc.food', target: 'menu' }, // what falls from the sky
  { icon: 'cart', tint: 'mintSoft', labelKey: 'svc.mart', target: 'promos' }, // the show's page: cast, links
  { icon: 'box', tint: 'pinkSoft', labelKey: 'svc.express', target: 'official' }, // the show, delivered fast: the official X account
  { icon: 'scooter', tint: 'lavenderSoft', labelKey: 'svc.ride', target: 'viewmim' }, // opens the Bake Love Feeling page on viewmim.info in a new tab
];
