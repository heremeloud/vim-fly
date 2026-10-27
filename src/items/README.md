# items

Everything that falls from the sky.

## Files

- `itemDefs.ts`: the single source of truth. Each item has an `id`, display `label`, `kind` (buff or debuff), a spawn `weight` and a typed `effect`.

## Items

| Item | Kind | Effect |
| --- | --- | --- |
| Croissant, bread, cupcake | Buff | Small points |
| Cake | Rare buff | Big points |
| Delivery car | Buff | Upward dash, about 3 s |
| Helicopter | Buff | Auto-lift and pulls in nearby items, about 4 s |
| Briefcase | Buff | Shield: blocks the next debuff |
| Objection hammer | Debuff | Stun, about 1 s |
| Burnt bread | Debuff | Lose points |
| Rain cloud | Debuff | Slows the climb |

All durations, point values and weights are starting points to tune in playtesting.

## Adding or changing an item

1. Edit `ITEMS` in `itemDefs.ts`. If the effect is new, add a variant to `ItemEffect`.
2. Handle the new effect where effects are applied (not built yet).
3. Update this table and the one in the root `README.md`.

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
