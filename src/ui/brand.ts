// The in-game "delivery app" the menus pretend to be. A parody of Thai delivery apps,
// mixing LINE MAN (shop pages, riders) with Grab (the "super app" grid of services).
// Pun names wink at the genre without borrowing any real app's logo, mascot or wording.
// Placeholder names; change them here. Text that changes with the language lives in src/i18n.

import type { StringKey } from '../i18n';

export const APP = {
  /** A pun on LINE MAN, bringing in the series' "love". Placeholder. */
  name: 'LOVE MAN',
  /** The bakery the app is delivering from; also the last location of the story. */
  shopName: 'Bake Love Bakery',
} as const;

export interface Service {
  icon: string;
  /** Brand-style names stay the same in every language. */
  label: string;
  /** 'menu' opens the item guide; 'soon' opens a joke "coming soon" page. */
  target: 'menu' | 'soon';
  note?: StringKey;
}

/** The super-app service tiles on the home screen. Only LoveFood is real; the rest are jokes. */
export const SERVICES: readonly Service[] = [
  { icon: '🍞', label: 'LoveFood', target: 'menu' },
  { icon: '🛒', label: 'LoveMart', target: 'soon', note: 'svc.mart.note' },
  { icon: '📦', label: 'LoveExpress', target: 'soon', note: 'svc.express.note' },
  { icon: '🛵', label: 'LoveRide', target: 'soon', note: 'svc.ride.note' },
];
