# Item catalog

Every item that drops from the sky, what it does and why it is in the game. The code lives in [itemDefs.ts](itemDefs.ts); keep this file in step with it.

All numbers are **starting points to tune in playtesting**. Weights are relative: 10 is twice as common as 5. Debuff weights are multiplied by up to 3x as the player climbs (full effect at 400 m).

## Buffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Croissant | `croissant` | Points | +10 | 10 | Common pickup |
| Bread | `bread` | Points | +10 | 10 | Common pickup |
| Cupcake | `cupcake` | Points | +15 | 8 | Common pickup |
| Cake | `cake` | Big points | +100 | 2 | Rare; the shop's showpiece |
| Delivery car | `deliveryCar` | Upward dash | 2 s at 500 px/s | 2 | Milder dash |
| Helicopter | `helicopter` | Upward dash | 3 s at 700 px/s | 2 | Stronger dash; the big climb |
| Briefcase | `briefcase` | Shield | Blocks the next debuff | 3 | The lawyer's briefcase |

## Debuffs

| Item | id | Effect | Value | Weight | Notes |
| --- | --- | --- | --- | --- | --- |
| Objection hammer | `hammer` | Stun | 1 s, taps ignored | 6 | The courtroom gavel |
| Burnt bread | `burntBread` | Lose points | -10 | 5 | Small annoyance |
| Rain cloud | `rainCloud` | Slows the climb | 3 s, flaps at 60% strength | 4 | |
| **Car crash** | `carCrash` | **Big debuff** | Stun 1.8 s, knocked down 500 px/s, -50 points, cancels any active dash | 2 | Nod to how the leads met (their cars bumped). Rare but costly |

## Rules that apply to every item

- **Shield:** the briefcase blocks the next debuff of any kind, including the car crash, and is used up when it does. A blocked item does not appear on the receipt.
- **Dashes** (delivery car, helicopter) override gravity and flapping for their duration. Picking up a second dash replaces the first. A car crash cancels a dash.
- **Stun** ignores taps; gravity keeps pulling the dog down.
- **Score** is metres climbed plus item points, never below 0. Items that only grant effects (dash, shield, stun, rain cloud) show as a line with no points on the receipt.

## Open questions

- Delivery car and helicopter are both upward dashes, differing only in strength. Should the car do something different (for example a sideways dash)?
- Should the car crash be blocked by the shield, or break through it as the one unblockable debuff?
- Thai names and prices (baht) for each item, for the menu-style item guide.

## Adding an item

1. Add it to `ITEMS` in `itemDefs.ts` (new effect types also go in `ItemEffect` and `RunState.collect`).
2. Add a row here and in the table in the root `README.md`.
3. Add art and a sound when real assets exist.
