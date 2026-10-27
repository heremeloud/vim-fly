// The in-game "delivery app" the menus pretend to be. A parody of Thai delivery apps,
// mixing LINE MAN (shop pages, riders) with Grab (the "super app" grid of services).
// The parody is in the layout and the jokes; the name is our own (the dog) and borrows nothing
// from either app. Text that changes with the language lives in src/i18n.

import type { StringKey } from '../i18n';

export const APP = {
  /** The app is named after Vimmy, the dog who delivers. Placeholder; change it here. */
  name: 'VIMMY',
  /** The bakery the app is delivering from; also the last location of the story. */
  shopName: 'Bake Love Bakery',
} as const;

export interface Service {
  icon: string;
  labelKey: StringKey;
  /** 'menu' opens the item guide; 'soon' opens a joke "coming soon" page. */
  target: 'menu' | 'soon';
  note?: StringKey;
}

/**
 * The super-app service tiles on the home screen. Pure genre decoration: only Food leads anywhere real
 * (the item guide); the others open a joke page. Remove any tile by deleting its line.
 */
export const SERVICES: readonly Service[] = [
  { icon: '🍞', labelKey: 'svc.food', target: 'menu' },
  { icon: '🛒', labelKey: 'svc.mart', target: 'soon', note: 'svc.mart.note' },
  { icon: '📦', labelKey: 'svc.express', target: 'soon', note: 'svc.express.note' },
  { icon: '🛵', labelKey: 'svc.ride', target: 'soon', note: 'svc.ride.note' },
];
