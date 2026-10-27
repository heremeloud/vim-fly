// Portrait logical resolution; Phaser scales it to fit any screen.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

// Starting values to tune in playtesting (see src/core/README.md).
export const PHYSICS = {
  gravity: 900, // px/s^2 pulling the character down
  flapVelocity: -420, // upward velocity set on each tap
  driftVelocity: 220, // horizontal velocity set on each tap
  horizontalDrag: 0.92, // per-frame (at 60 fps) damping of horizontal speed
  wallBounce: 0.6, // share of sideways speed kept (and reversed) when hitting a side wall
  wallKick: 400, // minimum speed away from the wall after a hit, so tapping into it can't hold you there
  wallStunMs: 600, // brief stagger on a wall hit (taps ignored), so hugging a wall costs climb
  maxFallSpeed: 700,
  pixelsPerMeter: 10, // converts climbed pixels to the height score
} as const;

// Camera climb. The screen always scrolls up at least this fast, and speeds up with
// height; it also jumps ahead if the dog flies above the lead line. Set baseSpeed to 0
// for the old behavior (camera moves only when the dog passes the lead line).
export const CAMERA = {
  leadPx: 350, // dog is pulled to at most this far below the top of the screen
  baseSpeed: 70, // px/s of automatic upward scroll at 0 m
  maxSpeed: 180,
  speedRamp: 0.3, // px/s added per meter climbed
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
