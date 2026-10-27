# core

The game's feel: physics values, input and the main loop.

## Files

- `constants.ts`: logical resolution (480x800 portrait, scaled to fit), the `PHYSICS` tuning values and scene keys.
- `input.ts`: `bindSteering(scene, onSteer)` turns taps and keys into `-1` (left) or `+1` (right).

## Decided design

- Tap left half = flap up and drift left. Tap right half = flap up and drift right.
- Keyboard: left/right arrows or A/D do the same.
- Stop tapping and the character falls. Falling off the bottom ends the run.
- Why not alternating taps to climb straight up? It gives no steering, so item pickups would be pure luck.

## Files (continued)

- `RunState.ts`: pure rules state for one run (score, active effects, collected items, receipt data). No Phaser inside.

## How the loop works now

`GameScene.update` each frame: moves the player (gravity, drift, effects), moves the camera up (it scrolls steadily, faster with height, and never scrolls down; see `CAMERA` in `constants.ts`), spawns and moves items, checks collisions, updates the HUD, and ends the run when the player falls below the bottom of the screen.

- A tap sets vertical velocity to `flapVelocity` and horizontal velocity to `±driftVelocity`. The left/right screen edges are walls: hitting one bounces the character away (at least `wallKick` px/s) and staggers it for `wallStunMs`, during which taps are ignored. This makes hugging a wall costly instead of a safe way up, and stops the character sticking to it or wrapping around.
- **Height** = pixels climbed / `pixelsPerMeter`. **Score** = height + item points (never below 0).
- **Effects:** a dash (helicopter) overrides vertical speed with the item's own velocity; shield (lawyer suit) blocks the next debuff; handkerchief clears stun and disorient; rolling pin multiplies flap strength; stun ignores taps; disorient swaps left/right on taps; oyster doubles gained item points (never penalties); a car crash stuns, cancels any dash and knocks the dog downward once (`pendingKnockback`). Per-item numbers live in `itemDefs.ts`, see `src/items/ITEMS.md`.
- Frame time is clamped to 50 ms so a background tab can't teleport the player.

Physics is hand-rolled rather than using Phaser's physics engine; items are simple box overlaps. Re-evaluate if collisions get complicated.

## Tuning

Everything in `PHYSICS` is a starting point. Change values, reload, and play until it feels good. Record what you settled on here.

## Still to build

Height zones with backdrop changes, combo multipliers, and a proper tuning pass (see below).

## Tuning notes

The camera auto-scrolls from `CAMERA.baseSpeed` (70 px/s) up to `maxSpeed` (180 px/s) so the dog can't outrun the screen; if you stop flapping you fall off the bottom sooner. Set `baseSpeed` to 0 for the old behavior.


An automated bot flapping every ~260 ms climbed about 150 m in 5 s. A human tapping slower will climb slower, but the difficulty ramps in `ITEM_RULES` and `pickItem` are scaled to roughly 0-400 m, so check them against real play and rescale.
