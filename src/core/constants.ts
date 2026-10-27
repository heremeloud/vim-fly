// Portrait logical resolution; Phaser scales it to fit any screen.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

// Starting values to tune in playtesting (see src/core/README.md).
export const PHYSICS = {
  gravity: 900, // px/s^2 pulling the character down
  flapVelocity: -420, // upward velocity set on each tap
  driftVelocity: 220, // horizontal velocity set on each tap
  horizontalDrag: 0.92, // per-frame (at 60 fps) damping of horizontal speed
  maxFallSpeed: 700,
  pixelsPerMeter: 10, // converts climbed pixels to the height score
  slowFactor: 0.6, // rain cloud scales flap strength by this
} as const;

// Item spawning and fall speed. Spawn gets faster and items fall faster with height.
export const ITEM_RULES = {
  size: 36,
  baseSpawnMs: 900,
  minSpawnMs: 350,
  spawnRamp: 0.8, // ms shaved off the interval per meter
  baseFallSpeed: 110,
  maxFallSpeed: 260,
  fallRamp: 0.4, // px/s added per meter
} as const;

export const SCENES = {
  boot: 'Boot',
  home: 'Home',
  game: 'Game',
  receipt: 'Receipt',
} as const;
