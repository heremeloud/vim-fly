import { DIFFICULTY } from './constants';

/** 0 at the start of a run, rising exponentially (DIFFICULTY.growth) to 1 at DIFFICULTY.fullAtMeters, then staying at 1. */
export function difficulty(heightMeters: number): number {
  const x = Math.min(1, Math.max(0, heightMeters / DIFFICULTY.fullAtMeters));
  return (Math.exp(DIFFICULTY.growth * x) - 1) / (Math.exp(DIFFICULTY.growth) - 1);
}

/** Interpolate from `start` (difficulty 0) to `end` (difficulty 1). */
export function ramp(range: readonly [start: number, end: number], d: number): number {
  return range[0] + (range[1] - range[0]) * d;
}
