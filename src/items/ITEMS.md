# Item catalog

Every item that drops from the sky, what it does and why it is in the game. The code lives in [itemDefs.ts](itemDefs.ts); keep this file in step with it.

Items come in three kinds:

- **Points:** food and drinks from the series. Collecting one adds to the score and nothing else.
- **Buffs:** power-ups that change how the run plays, for a while or until used.
- **Debuffs:** things to dodge. They hurt your movement, your score, or both.

All numbers are **starting points to tune in playtesting**. Weights are relative: 6 is twice as common as 3. As the player climbs, debuffs get more common (weights up to 2.5x), and points items and buffs get rarer (down to 60% and 50%), reaching full effect at 1500 m. Debuffs also swerve side to side at height. See the difficulty curve in `src/core/README.md`. The item sprites live in `src/assets/items-v6`; gameplay effects also use gold, green and red cues for points, buffs and debuffs.

## Points items

| Item | id | Points | Weight | Notes |
| --- | --- | --- | --- | --- |
| Pandan Custard Bread | `pandanCustardBread` | +40 | 6 | Core series food; cheap breads stay common as you climb (weight x1.6 at full difficulty cancels the food slowdown) |
| Cheese Butter Bread (Cheese-Noey Bread) | `cheeseButterBread` | +120 | 2 | Aroma of Love's star bread, created from milk, butter and cream cheese; a high-points item, rarer than the pasta and wine |
| Shiopan | `shiopan` | +30 | 5 | Stays common as you climb (as the pandan bread) |
| Sandwich | `sandwich` | +45 | 6 | Stays common as you climb (as the pandan bread) |
| Coffee | `coffee` | +60 | 4 | Noey's black coffee with honey |
| Wine | `wine` | +100 | 2 | Premium white wine shared over an oyster dinner |
| Pasta | `pasta` | +90 | 4 | Cheese's homemade spaghetti carbonara for Noey |
| Tom Yum | `tomYum` | +180 | 2 | Hot and sour Thai shrimp soup |
| Shrimp Fried Rice Lunch Box | `shrimpFriedRiceBox` | +220 | 2 | Noey's homemade apology meal with fried shrimp; rare |
| Golden Retriever | `goldenRetriever` | +500 | 1 | Rarest and highest; the jackpot item. Only falls from stage 3 (1400 m) up outside a themed finale, is drawn larger, and stays off the Menu until you have finished a run |

## Buffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Oyster | `oyster` | Double points | Item points x2 for 5 s | 3 | Served on ice with lemon; only doubles gains, never penalties |
| Lawyer Suit | `lawyerSuit` | Shield | Blocks the next debuff | 3 | Replaces the briefcase |
| Handkerchief | `handkerchief` | Cleanse | Instantly clears stun and disorient | 3 | |
| Rolling Pin | `rollingPin` | Strong flap | Flaps at 150% strength for 5 s | 3 | Bakery tool |
| Helicopter | `helicopter` | Upward dash | 3 s at 700 px/s | 2 | The big climb; gets rarer the higher you go (down to 25% of its weight, on top of the usual buff scaling) |

## Debuffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Gavel Hammer | `gavelHammer` | Stun | 1 s, taps ignored | 6 | The courtroom gavel |
| Cilantro Bread | `cilantroBread` | Disoriented | 3 s, left/right swapped | 4 | No points |
| Fish Sauce Bread | `fishSauceBread` | Slows flying | 5 s, flaps and drift at 60% speed (40% slower) | 3 | No points |
| Planner | `planner` | Stun and huge point loss | Stun 1.5 s, taps ignored, and -300 points | 2 | Stuns and costs points, with no knock-back |
| **Car crash** | `carCrash` | **Big debuff** | Stun 1.8 s, knocked down 500 px/s, -150 points, cancels any active dash | 2 | Nod to how the leads met: Cheese swerves for a kitten and crashes into Noey's Benz |

## Rules that apply to every item

- **Shield:** the lawyer suit blocks the next debuff of any kind, including the car crash, and is used up when it does. A blocked item does not appear on the receipt.
- **Dash** (helicopter) overrides gravity and flapping for its duration. A car crash cancels it.
- **Stun** ignores taps; gravity keeps pulling the dog down.
- **Slow** (fish sauce bread) scales both the flap and the sideways drift to 60% for its duration.
- **Disoriented** (cilantro bread) swaps what left and right do: tapping the left half drifts the dog right, and the other way round. It still flaps up.
- **Score** is metres climbed plus item points, never below 0. Items with no points (dash, shield, cleanse, strong flap, plain stun, disorient, slow, oyster) show as a line with no points on the receipt.

## Open questions

- Oyster is double points for 5 s. Is that the buff you want?
- Lawyer suit, handkerchief and rolling pin effects are my guesses (shield, cleanse, stronger flaps). Tell me what each should really do.
- More debuff ideas? Current movement debuffs are stun, disorient, slow and the car crash. Candidates: heavy (falls faster), wind gust (pushed sideways), slippery (drift doesn't stop), fog (screen dims).
- Should the shield block the car crash and planner, or should one of them be unblockable?
- Should coffee and wine have effects of their own, or stay plain points?
- Are the point tiers right (sandwich 45, shiopan 30, pandan bread 40, coffee 60, pasta 90, wine 100, cheese butter bread 120, tom yum 180, lunch box 220, golden retriever 500)?
- Thai names (and baht prices) for each item, for the menu-style item guide.

## Names in other languages

Item names are in `src/i18n` (`item.<id>`) in English, Thai, Japanese, Simplified Chinese and Traditional Chinese; the English names in this file are the same as `en.ts`.

## Adding an item

1. Add it to `ITEMS` in `itemDefs.ts`, choosing its kind (new effect types also go in `ItemEffect` and `RunState.collect`).
2. Add a row here and in the table in the root `README.md`.
3. Add art and a sound when real assets exist.
