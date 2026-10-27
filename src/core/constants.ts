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

// Difficulty rises linearly from 0 at the start to 1 at this height, then stays at 1.
// Every [start, end] pair below is interpolated by it (see src/core/difficulty.ts).
export const DIFFICULTY = {
  fullAtMeters: 1000,
} as const;

// Camera climb. The screen always scrolls up at `speed` px/s (faster with height); it also
// jumps ahead if the dog flies above the lead line. Set speed to [0, 0] for the old behavior
// (camera moves only when the dog passes the lead line).
export const CAMERA = {
  leadPx: 350, // dog is pulled to at most this far below the top of the screen
  speed: [70, 220] as const,
} as const;

// Item spawning. All [start, end] pairs run from difficulty 0 to 1.
export const ITEM_RULES = {
  size: 36,
  spawnMs: [900, 300] as const, // time between spawns
  fallSpeed: [110, 340] as const, // px/s
  doubleSpawnChance: [0, 0.5] as const, // chance a spawn drops a second item at once
  debuffSway: [0, 80] as const, // debuffs swerve side to side by up to this many px
  swayRate: 2.2, // radians/s of the swerve
  debuffWeightScale: [1, 3] as const, // multiplies debuff spawn weights
  pointsWeightScale: [1, 0.6] as const, // food gets rarer
  buffWeightScale: [1, 0.5] as const, // power-ups get rarer
} as const;

export const SCENES = {
  boot: 'Boot',
  home: 'Home',
  menu: 'Menu',
  comingSoon: 'ComingSoon',
  game: 'Game',
  receipt: 'Receipt',
} as const;
