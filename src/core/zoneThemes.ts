import type { ZoneId } from './zones';

/**
 * What falls more often in each location all the way through it, not only in its closing rush (see finales.ts, whose
 * boosts stack on top of these). Spawn weight multipliers by item id, 1 when not listed. They only reweight items
 * that can already fall at that height, so a themed item still waits for its own `minStage`.
 */
export const ZONE_THEMES: Readonly<Record<ZoneId, Readonly<Record<string, number>>>> = {
  ruralRoad: { kitten: 2.5, shiopan: 1.5, sandwich: 1.5 }, // the kitten on the road, and a roadside snack
  bakery: { pandanCustardBread: 2.5, shiopan: 2.5, cheeseButterBread: 1.5, cilantroBread: 1.5, fishSauceBread: 1.5 }, // bread, the bad ones too
  cafes: { coffee: 3, sandwich: 2, iceCream: 1.5 },
  mall: { cheesePopcorn: 3, iceCream: 2, cheeseButterBread: 1.5 },
  lawOffice: { planner: 2, shrimpFriedRiceBox: 2, lawyerSuit: 2 },
  gym: { rollingPin: 2.5, iceCream: 1.5, sandwich: 1.5 },
  courtroom: { gavelHammer: 2, lawyerSuit: 2 },
  residence: { wine: 2.5, pasta: 2.5, tomYum: 2.5, handkerchief: 1.5 },
  aquarium: { oyster: 3, fishSauceBread: 2, iceCream: 1.5 },
  bakeLove: { pandanCustardBread: 2, shiopan: 2, cheeseButterBread: 1.5 },
};
