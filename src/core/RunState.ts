import type { ItemDef } from '../items/itemDefs';

export interface ReceiptLine {
  id: string;
  label: string;
  count: number;
  points: number;
}

export interface RunResult {
  heightMeters: number;
  lines: ReceiptLine[];
  total: number;
  durationMs: number;
}

/**
 * Pure game-rules state for one run: score, active effects and what was
 * collected. No Phaser here, so it is easy to reason about and test.
 */
export class RunState {
  heightMeters = 0;
  shield = false;
  dashMs = 0;
  dashVelocity = 0;
  /** Downward speed (px/s) the scene should apply once, then reset to 0. Set by a car crash. */
  pendingKnockback = 0;
  stunMs = 0;
  strongFlapMs = 0;
  strongFlapFactor = 1;
  disorientMs = 0;
  doublePointsMs = 0;
  elapsedMs = 0;
  private lines = new Map<string, ReceiptLine>();

  get isStunned(): boolean {
    return this.stunMs > 0;
  }

  get isDisoriented(): boolean {
    return this.disorientMs > 0;
  }

  get itemPoints(): number {
    let sum = 0;
    for (const l of this.lines.values()) sum += l.points;
    return sum;
  }

  get score(): number {
    return Math.max(0, Math.floor(this.heightMeters) + this.itemPoints);
  }

  tick(dtMs: number): void {
    this.elapsedMs += dtMs;
    this.dashMs = Math.max(0, this.dashMs - dtMs);
    this.stunMs = Math.max(0, this.stunMs - dtMs);
    this.strongFlapMs = Math.max(0, this.strongFlapMs - dtMs);
    this.disorientMs = Math.max(0, this.disorientMs - dtMs);
    this.doublePointsMs = Math.max(0, this.doublePointsMs - dtMs);
  }

  /** Apply a collected item. Returns false if a shield blocked it. */
  collect(item: ItemDef): boolean {
    const e = item.effect;
    if (item.kind === 'debuff' && this.shield) {
      this.shield = false;
      return false;
    }
    let points = 0;
    switch (e.type) {
      case 'points':
        // Double points only boosts gains, never doubles a penalty.
        points = e.amount > 0 && this.doublePointsMs > 0 ? e.amount * 2 : e.amount;
        break;
      case 'dash':
        this.dashMs = e.durationMs;
        this.dashVelocity = e.velocity;
        break;
      case 'shield':
        this.shield = true;
        break;
      case 'doublePoints':
        this.doublePointsMs = e.durationMs;
        break;
      case 'disorient':
        this.disorientMs = e.durationMs;
        break;
      case 'stun':
        this.stunMs = e.durationMs;
        break;
      case 'cleanse':
        this.stunMs = 0;
        this.disorientMs = 0;
        break;
      case 'strongFlap':
        this.strongFlapMs = e.durationMs;
        this.strongFlapFactor = e.factor;
        break;
      case 'crash':
        this.stunMs = e.stunMs;
        this.dashMs = 0; // a crash cancels any dash
        this.pendingKnockback = e.knockback;
        points = e.points;
        break;
    }
    const line = this.lines.get(item.id) ?? { id: item.id, label: item.label, count: 0, points: 0 };
    line.count += 1;
    line.points += points;
    this.lines.set(item.id, line);
    return true;
  }

  result(): RunResult {
    return {
      heightMeters: Math.floor(this.heightMeters),
      lines: [...this.lines.values()],
      total: this.score,
      durationMs: Math.round(this.elapsedMs),
    };
  }
}
