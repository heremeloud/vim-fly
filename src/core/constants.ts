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
  swipeDashSpeed: 1800, // px/s of the emergency swipe dash, a straight horizontal run to the far wall
  swipeDashExitLift: -250, // upward speed when the dash ends, so Vimmy doesn't drop
  swipeDashesPerRun: 3,
  swipeMinPx: 60, // minimum horizontal travel (layout px) to count as a swipe
  pixelsPerMeter: 10, // converts climbed pixels to the height score
} as const;

// Difficulty rises exponentially from 0 at the start to 1 at this height, then stays at 1. `growth` sets how
// sharply: near 0 is linear, higher is gentler at first and steeper near the top (each stretch of height
// adds more than the one before). Every [start, end] pair below is interpolated by it (see src/core/difficulty.ts).
export const DIFFICULTY = {
  fullAtMeters: 1800,
  growth: 4.5,
} as const;

// Camera climb. The screen always scrolls up at `speed` px/s (faster with height); it also
// jumps ahead if the dog flies above the lead line. Set speed to [0, 0] for the old behavior
// (camera moves only when the dog passes the lead line).
export const CAMERA = {
  leadPx: 350, // dog is pulled to at most this far below the top of the screen
  speed: [105, 280] as const,
} as const;

// Item spawning. All [start, end] pairs run from difficulty 0 to 1.
export const ITEM_RULES = {
  size: 36,
  spawnMs: [600, 280] as const, // time between spawns (quicker at the start, so the first stretch is not empty)
  fallSpeed: [140, 370] as const, // px/s
  doubleSpawnChance: [0, 0.3] as const, // chance a spawn drops a second item at once
  debuffSway: [0, 110] as const, // debuffs swerve side to side by up to this many px
  swayRate: 2.2, // radians/s of the swerve
  debuffWeightScale: [1, 1.6] as const, // multiplies debuff spawn weights
  pointsWeightScale: [1, 0.6] as const, // food gets rarer
  buffWeightScale: [1, 0.5] as const, // power-ups get rarer
  // Early stretch: extra food-only drops, with no cap on how many. After each one another follows with chance `extraChance`, which fades
  // to 0 at `untilMeters`: the end of the Shopping Mall (1400 m), so the screen stays full through the first four stages. That is
  // about 1.5 extra per beat at the start, 0.8 at 350 m, 0.4 at 700 m and 0.2 at 1050 m. They are all cheap food, so a fuller screen does not make it harder.
  startFood: { untilMeters: 1400, extraChance: 0.6 },
} as const;

export const SCENES = {
  boot: 'Boot',
  home: 'Home',
  menu: 'Menu',
  orders: 'Orders',
  promos: 'Promos',
  sfx: 'Sfx',
  fx: 'Fx',
  game: 'Game',
  receipt: 'Receipt',
} as const;
