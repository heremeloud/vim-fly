# items

Everything that falls from the sky.

## Files

- `ITEMS.md`: human-readable catalog of every item and its effect.
- `itemDefs.ts`: the single source of truth. Each item has an `id`, display `label`, `kind` (buff or debuff), a spawn `weight` and a typed `effect`.

## Items

The full list with values, weights and rules is in [ITEMS.md](ITEMS.md). In short: the series' foods and drinks (breads, sandwich, pasta, coffee, wine, shrimp fried rice lunch box) give points, the delivery car and helicopter dash upward, the briefcase shields, and the hammer, burnt bread, rain cloud and car crash are debuffs (the car crash is the big one).

All durations, point values and weights are starting points to tune in playtesting.

## Adding or changing an item

1. Edit `ITEMS` in `itemDefs.ts`. If the effect is new, add a variant to `ItemEffect`.
2. Handle the new effect in `RunState.collect` (and in `GameScene` if it moves the player).
3. Update `ITEMS.md` and the table in the root `README.md`.

The item guide screen ("menu list with prices") should read from `ITEMS` so it never drifts from the game.

## How spawning works

- `pickItem(heightMeters)` does a weighted random pick. Debuff weights scale up to 3x by 400 m.
- `GameScene` spawns one item above the camera every `ITEM_RULES` interval (shrinks with height) at a random x. Items fall straight down, faster with height.
- Collision is a box overlap with the player. `RunState.collect` applies the effect; a shield consumes itself instead of a debuff.
- Each `ItemDef` has a placeholder `color`; buffs get a green outline, debuffs red.

## Still to build

Sprites, pickup effects and sounds, and a Thai/English label pair per item.

## Known plan discrepancy

The plan's build-order bullet mentions speed boost, magnet, reversed controls and heavy. The item table in the plan differs. This code follows the table.
