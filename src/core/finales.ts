import { ZONES, zoneAt, type ZoneId } from './zones';

/**
 * Every location except the last ends with a short themed stretch: its final FINALE_METERS. The banner
 * announces it, the items that fit the place fall more often, and a small effect can nudge Vimmy.
 * These are short rushes rather than ordinary stretches of play. During every finale, items arrive faster
 * and double drops become more likely; the per-location rules below make most of those drops fit the theme.
 */
export const FINALE_METERS = 100;

/** Shared rush pacing: about 11% more spawn beats, with another 15% chance of a second item on each beat. */
export const FINALE_RUSH = {
  spawnIntervalScale: 0.9,
  extraDoubleSpawnChance: 0.15,
} as const;

export interface Finale {
  /** Spawn weight multipliers by item id (1 when not listed). An item listed above 1 can fall even before its `minStage`. */
  items: Readonly<Record<string, number>>;
  /** Items that must fall during the finale (not left to chance): `count` of them, spread evenly across its length. */
  guaranteed?: { id: string; count: number };
  /** Peak sideways push in px/s. It sways left and right so it never just pins Vimmy to one wall. */
  wind?: number;
  /** Multiplies how hard each flap lifts (above 1 helps, below 1 hinders). */
  flapScale?: number;
}

const FINALES: Partial<Record<ZoneId, Finale>> = {
  ruralRoad: { items: { carCrash: 5, kitten: 4 }, guaranteed: { id: 'carCrash', count: 2 } }, // car crash hour: two cars, for sure
  bakery: { items: { pandanCustardBread: 6, shiopan: 6, cheeseButterBread: 6, cilantroBread: 4, fishSauceBread: 4 } }, // fresh from the oven: every kind of bread, the bad ones too
  cafes: { items: { coffee: 40, sandwich: 3, cilantroBread: 3, fishSauceBread: 3, goldenRetriever: 12 }, flapScale: 1.12 }, // caffeine and a sandwich (the bakery is the bread rush), and the golden retriever visits
  mall: { items: { cheesePopcorn: 40, cheeseButterBread: 8, helicopter: 6, goldenRetriever: 5 } }, // popcorn everywhere, plus a few premium finds and prizes
  lawOffice: { items: { planner: 4, shrimpFriedRiceBox: 6 }, flapScale: 0.9 }, // paperwork
  gym: { items: { rollingPin: 14, iceCream: 8 }, flapScale: 1.15 }, // pump it up
  courtroom: { items: { gavelHammer: 5 } }, // order in the court
  residence: { items: { wine: 10, pasta: 8, tomYum: 8, handkerchief: 8, dogEars: 4 } }, // cozy night in
  aquarium: { items: { fishSauceBread: 7, planner: 12 }, wind: 90 }, // strong current, and the notebooks float by
};

/** The finale the climber is in at this height, with the location it belongs to, or null. */
export function finaleAt(heightMeters: number): (Finale & { zoneId: ZoneId; fromMeters: number }) | null {
  const zone = zoneAt(heightMeters);
  const next = ZONES[ZONES.indexOf(zone) + 1];
  const finale = FINALES[zone.id];
  const fromMeters = next ? next.fromMeters - FINALE_METERS : Infinity;
  if (!next || !finale || heightMeters < fromMeters) return null;
  return { ...finale, zoneId: zone.id, fromMeters };
}
