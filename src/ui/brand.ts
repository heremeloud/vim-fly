// The in-game "delivery app" the menus pretend to be. A parody of Thai delivery apps,
// mixing LINE MAN (shop pages, riders) with Grab (the "super app" grid of services).
// Pun names wink at the genre without borrowing any real app's logo, mascot or wording.
// Placeholder names; change them here.

export const APP = {
  name: 'BEE MAN',
  tagline: 'Delivered by a very good dog',
  deliverTo: 'Vimmy Fly Bakery',
  searchHint: 'Search bread, lunch box, golden retriever...',
} as const;

export interface Service {
  icon: string;
  label: string;
  /** 'menu' opens the item guide; 'soon' opens a joke "coming soon" page. */
  target: 'menu' | 'soon';
  note?: string;
}

/** The super-app service tiles on the home screen. Only BeeFood is real; the rest are jokes. */
export const SERVICES: readonly Service[] = [
  { icon: '🍞', label: 'BeeFood', target: 'menu' },
  { icon: '🛒', label: 'BeeMart', target: 'soon', note: 'Groceries by dog. Please hold, he is still chasing the van.' },
  { icon: '📦', label: 'BeeExpress', target: 'soon', note: 'Parcels delivered at the speed of one very determined dog.' },
  { icon: '🛵', label: 'BeeRide', target: 'soon', note: 'Rides on the back of a dog in a bee costume. Safety not guaranteed.' },
];
