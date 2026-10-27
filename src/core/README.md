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

## How the loop works now

`GameScene.update` applies gravity to a vertical velocity, damps the horizontal velocity, moves a placeholder rectangle and ends the run when it passes the bottom. A tap sets vertical velocity to `flapVelocity` and horizontal velocity to `±driftVelocity`. The character wraps around the left/right edges.

Physics is hand-rolled rather than using Phaser's physics engine. Re-evaluate when item collisions need it.

## Tuning

Everything in `PHYSICS` is a starting point. Change values, reload, and play until it feels good. Record what you settled on here.

## Still to build

Camera that scrolls up as the character climbs, a height/score counter, and the difficulty curve (spawn rate and debuff ratio rising with height).
