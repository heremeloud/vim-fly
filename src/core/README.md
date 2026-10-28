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

- `ZONES.md`: the novel's locations as height zones, with story context.
- `render.ts`: the render scale (sharpness), see below.
- `RunState.ts`: pure rules state for one run (score, active effects, collected items, receipt data). No Phaser inside.

## How the loop works now

`GameScene.update` each frame: moves the player (gravity, drift, effects), moves the camera up (it scrolls steadily, faster with height, and never scrolls down; see `CAMERA` in `constants.ts`), spawns and moves items, checks collisions, updates the HUD, and ends the run when the player falls below the bottom of the screen.

- A tap sets vertical velocity to `flapVelocity` and horizontal velocity to `±driftVelocity`. The left/right screen edges are walls: hitting one bounces the character away (at least `wallKick` px/s) and staggers it for `wallStunMs`, during which taps are ignored. This makes hugging a wall costly instead of a safe way up, and stops the character sticking to it or wrapping around.
- **Height** = pixels climbed / `pixelsPerMeter`. **Score** = height + item points (never below 0).
- **Effects:** a dash (helicopter) overrides vertical speed with the item's own velocity; shield (lawyer suit) blocks the next debuff; handkerchief clears stun and disorient; rolling pin multiplies flap strength; stun ignores taps (the planner stuns and also costs points); disorient (cilantro bread) swaps left/right on taps; slow (fish sauce bread) scales flap and drift speed down; oyster doubles gained item points (never penalties); a car crash stuns, cancels any dash and knocks the dog downward once (`pendingKnockback`). Per-item numbers live in `itemDefs.ts`, see `src/items/ITEMS.md`.
- Frame time is clamped to 50 ms so a background tab can't teleport the player.

Physics is hand-rolled rather than using Phaser's physics engine; items are simple box overlaps. Re-evaluate if collisions get complicated.

## Tuning

Everything in `PHYSICS` is a starting point. Change values, reload, and play until it feels good. Record what you settled on here.

## Still to build

Combo multipliers, and a proper tuning pass (see below).

## Sharpness (render scale)

All layout uses a 480x800 coordinate space, but the canvas is drawn `RENDER_SCALE` times bigger (1 to 3, chosen at start-up from the screen density and the size the game is shown at) and every camera zooms by the same amount. Layout never changes; shapes and text are just drawn at full sharpness instead of being stretched (which looked soft on retina screens and big windows). See `render.ts`.

- Pointer positions are in canvas pixels; convert with `toLayout()` before comparing them with layout coordinates.
- Every Text object is rendered at `RENDER_SCALE` resolution (installed once in `main.ts`).
- The zone backdrop tiles are small bitmaps, so they use hard (nearest) edges when zoomed.
- The scale is chosen once when the page loads; reload after resizing the window a lot.
- In dev, `?scale=1` to `?scale=3` forces it, to compare.

## Height zones

The backdrops are the locations from the series' original novel: five story stages, two locations each, 200 m apart (`ZONE_SPACING_METERS`) (Rural Road, Heartwarming Bakery, Suburban Cafés, Shopping Mall, CC Law Office, Fitness Second Gym, The Courtroom, Sweet Sea Beach, Noey's Residence, Bake Love Bakery). Passing a milestone swaps the background and shows a banner with the stage and location; the Receipt lists the last location reached.

The full list, story context and vibes are in [ZONES.md](ZONES.md). The code is `zones.ts`. Active backdrops are hand-authored pixel tiles in `src/assets/zones-v2`; `BootScene.makeBackdrop` remains as a fallback. In dev, open `/?zone=<id>` to start a run inside a zone.

## Difficulty curve

One number drives it all: `difficulty(height)` in `difficulty.ts` goes from 0 at the start to 1 at `DIFFICULTY.fullAtMeters` (1000 m), then stays at 1. Everything below is a `[start, end]` pair in `constants.ts` interpolated by it, so it is easy to retune in one place.

| What | At 0 m | At full difficulty |
| --- | --- | --- |
| Time between item spawns | 900 ms | 300 ms |
| Chance of a second item per spawn | 0% | 50% |
| Item fall speed | 110 px/s | 340 px/s |
| Debuffs swerve side to side | 0 px | 80 px |
| Camera scroll speed | 70 px/s | 220 px/s |
| Share of debuffs among drops | about 25% | about 64% |
| Share of points items / buffs | 54% / 21% | 27% / 9% |

Food and power-ups get rarer and debuffs more common as you climb (`pointsWeightScale`, `buffWeightScale`, `debuffWeightScale`).

## Tuning notes

- The camera auto-scrolls (`CAMERA.speed`) so the dog can't outrun the screen; if you stop flapping you fall off the bottom sooner. Set `speed` to `[0, 0]` for the old behavior.
- A bot tapping every ~230 ms reaches about 340 m in 10 s, so a fast player hits full difficulty in about 30 s. If it feels too easy or too hard, change `DIFFICULTY.fullAtMeters` first (smaller = ramps sooner), then the individual pairs.
