# items

Everything that falls from the sky.

## Files

- `ITEMS.md`: human-readable catalog of every item and its effect.
- `itemDefs.ts`: the single source of truth. Each item has an `id`, display `label`, `kind` (buff or debuff), a spawn `weight` and a typed `effect`.

## Items

Three kinds: **points** (food and drinks, score only, topped by the golden retriever), **buffs** (oyster double points, lawyer suit shield, handkerchief cleanse, rolling pin strong flap, helicopter dash) and **debuffs** (gavel hammer stun, cilantro bread disorient, fish sauce bread slows flying, planner stun and point loss, car crash). The full list with values, weights and rules is in [ITEMS.md](ITEMS.md).

All durations, point values and weights are starting points to tune in playtesting.

## Adding or changing an item

1. Edit `ITEMS` in `itemDefs.ts`, and add `item.<id>` to all four language files in `src/i18n` (then run `npm run check:i18n`). If the effect is new, add a variant to `ItemEffect`.
2. Handle the new effect in `RunState.collect` (and in `GameScene` if it moves the player).
3. Update `ITEMS.md` and the table in the root `README.md`.

The item guide screen ("menu list with prices") should read from `ITEMS` so it never drifts from the game.

## How spawning works

- `pickItem(heightMeters)` does a weighted random pick. As difficulty rises, debuff weights scale up and points/buff weights down (`ITEM_RULES` in `src/core/constants.ts`).
- `GameScene` spawns an item above the camera every `ITEM_RULES.spawnMs` (shrinks with height), sometimes two at once. Items fall faster with height, and debuffs swerve side to side.
- Collision is a box overlap with the player. `RunState.collect` applies the effect; a shield consumes itself instead of a debuff.
- Each `ItemDef` has a placeholder `color`; points items get a gold outline, buffs green, debuffs red.

## Helpers for the menu

- `describeEffect(item)` builds the plain-English description from the item's effect, so the Menu screen never disagrees with the game.
- `priceLabel(item)` gives the menu "price": `฿<points>` for points items and penalties (for example `-฿150` for a point loss), or "Buff"/"Debuff" for the rest.

## Still to build

Sprites, pickup effects and sounds, and a Thai/English label pair per item.

## Known plan discrepancy

The plan's build-order bullet mentions speed boost, magnet, reversed controls and heavy. The item table in the plan differs. This code follows the table.
