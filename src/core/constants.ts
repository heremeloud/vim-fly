// Portrait logical resolution; Phaser scales it to fit any screen.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

// Starting values to tune in playtesting (see src/core/README.md).
export const PHYSICS = {
  gravity: 900, // px/s^2 pulling the character down
  flapVelocity: -420, // upward velocity set on each tap
  driftVelocity: 220, // horizontal velocity set on each tap
  horizontalDrag: 0.92, // per-frame-ish damping of horizontal speed
  maxFallSpeed: 700,
} as const;

export const SCENES = {
  boot: 'Boot',
  home: 'Home',
  game: 'Game',
  receipt: 'Receipt',
} as const;
