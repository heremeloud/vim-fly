# Item catalog

Every item that drops from the sky, what it does and why it is in the game. The code lives in [itemDefs.ts](itemDefs.ts); keep this file in step with it.

Items come in three kinds:

- **Points:** food and drinks from the series. Collecting one adds to the score and nothing else.
- **Buffs:** power-ups that change how the run plays, for a while or until used.
- **Debuffs:** things to dodge. They hurt your movement, your score, or both.

All numbers are **starting points to tune in playtesting**. Weights are relative: 6 is twice as common as 3. Debuff weights are multiplied by up to 3x as the player climbs (full effect at 400 m). In the placeholder art, points items have a gold outline, buffs green and debuffs red.

## Points items

| Item | id | Points | Weight | Notes |
| --- | --- | --- | --- | --- |
| Pandan Custard Bread | `pandanCustardBread` | +10 | 6 | Core series food |
| Cheese Butter Bread | `cheeseButterBread` | +10 | 6 | Milk, butter and cream cheese |
| Shiopan | `shiopan` | +10 | 5 | |
| Sandwich | `sandwich` | +10 | 6 | |
| Pasta | `pasta` | +20 | 4 | Savory dish |
| Coffee | `coffee` | +20 | 4 | Drink |
| Wine | `wine` | +30 | 2 | Drink; premium |
| Shrimp Fried Rice Lunch Box | `shrimpFriedRiceBox` | +100 | 2 | Rare; the jackpot item |

## Buffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Oyster | `oyster` | Double points | Item points x2 for 5 s | 3 | Only doubles gains, never penalties. Effect is a placeholder; change as you like |
| Delivery car | `deliveryCar` | Upward dash | 2 s at 500 px/s | 2 | Milder dash |
| Helicopter | `helicopter` | Upward dash | 3 s at 700 px/s | 2 | Stronger dash; the big climb |
| Briefcase | `briefcase` | Shield | Blocks the next debuff | 3 | The lawyer's briefcase |

## Debuffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Objection hammer | `hammer` | Stun | 1 s, taps ignored | 6 | The courtroom gavel |
| Cilantro Bread | `cilantroBread` | Disoriented | 3 s, left/right swapped | 4 | No points |
| Fish Sauce Bread | `fishSauceBread` | Disoriented | 4 s, left/right swapped | 3 | No points; the smellier one lasts longer |
| Burnt bread | `burntBread` | Lose points | -10 | 5 | Small annoyance |
| Rain cloud | `rainCloud` | Slows the climb | 3 s, flaps at 60% strength | 4 | |
| **Car crash** | `carCrash` | **Big debuff** | Stun 1.8 s, knocked down 500 px/s, -50 points, cancels any active dash | 2 | Nod to how the leads met (their cars bumped). Rare but costly |

## Rules that apply to every item

- **Shield:** the briefcase blocks the next debuff of any kind, including the car crash, and is used up when it does. A blocked item does not appear on the receipt.
- **Dashes** (delivery car, helicopter) override gravity and flapping for their duration. Picking up a second dash replaces the first. A car crash cancels a dash.
- **Stun** ignores taps; gravity keeps pulling the dog down.
- **Disoriented** swaps what left and right do: tapping the left half drifts the dog right, and the other way round. It still flaps up.
- **Score** is metres climbed plus item points, never below 0. Items with no points (dash, shield, stun, disorient, rain cloud, oyster) show as a line with no points on the receipt.

## Open questions

- Oyster is double points for 5 s. Is that the buff you want?
- Delivery car and helicopter are both upward dashes, differing only in strength. Should the car do something different (for example a sideways dash)?
- Should the car crash be blocked by the shield, or break through it as the one unblockable debuff?
- Should coffee and wine have effects of their own, or stay plain points?
- Are the point tiers right (breads 10, pasta and coffee 20, wine 30, lunch box 100)?
- Thai names (and baht prices) for each item, for the menu-style item guide.

## Adding an item

1. Add it to `ITEMS` in `itemDefs.ts`, choosing its kind (new effect types also go in `ItemEffect` and `RunState.collect`).
2. Add a row here and in the table in the root `README.md`.
3. Add art and a sound when real assets exist.
