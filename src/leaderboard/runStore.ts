import type { ZoneId } from '../core/zones';

/**
 * One finished run ("order") kept on this device. The worldwide leaderboard receives the
 * final score separately, together with the player name and server-issued run token.
 */
export interface RunRecord {
  /** Running order number on this device: Order #1, #2, ... */
  no: number;
  /** When the run ended, ISO 8601. */
  playedAt: string;
  score: number;
  heightMeters: number;
  /** The last location reached. */
  zoneId: ZoneId;
  durationMs: number;
  /** Total number of items picked up. */
  itemCount: number;
}

export type NewRun = Omit<RunRecord, 'no'>;

/**
 * Where finished runs are kept. `LocalRunStore` keeps the five best on this device; the worldwide
 * ladder has its own read/write flow in `client.ts`.
 */
export interface RunStore {
  /** Save a finished run. Returns the saved record and whether it is the best so far. */
  add(run: NewRun): { record: RunRecord; isBest: boolean };
  /** Newest first. */
  recent(limit?: number): RunRecord[];
  /** Highest score first. */
  top(limit?: number): RunRecord[];
  best(): RunRecord | null;
}

const KEY = 'vimmy-fly.runs';
const MAX_RUNS = 5;

interface Saved {
  nextNo: number;
  runs: RunRecord[]; // oldest first
}

/** Runs saved in this browser's localStorage. Safe to use when storage is blocked: it just won't remember. */
export class LocalRunStore implements RunStore {
  private memory: Saved = { nextNo: 1, runs: [] };

  private load(): Saved {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Saved;
        if (Array.isArray(parsed.runs) && typeof parsed.nextNo === 'number') return parsed;
      }
    } catch {
      // Storage blocked or corrupted: fall back to this session's memory.
    }
    return this.memory;
  }

  private save(data: Saved): void {
    this.memory = data;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Not persisted; still available this session.
    }
  }

  add(run: NewRun): { record: RunRecord; isBest: boolean } {
    const data = this.load();
    const previousBest = data.runs.reduce((m, r) => Math.max(m, r.score), -1);
    const record: RunRecord = { ...run, no: data.nextNo };
    data.nextNo += 1;
    data.runs.push(record);
    // Keep only the best runs. Ties go to the earlier run, matching `top`.
    if (data.runs.length > MAX_RUNS) {
      data.runs = [...data.runs].sort((a, b) => b.score - a.score || a.no - b.no).slice(0, MAX_RUNS).sort((a, b) => a.no - b.no);
    }
    this.save(data);
    return { record, isBest: run.score > previousBest && run.score > 0 };
  }

  recent(limit = 50): RunRecord[] {
    return [...this.load().runs].reverse().slice(0, limit);
  }

  top(limit = 50): RunRecord[] {
    // Ties go to the earlier run, so the first time you reach a score is the one on the ladder.
    return [...this.load().runs].sort((a, b) => b.score - a.score || a.no - b.no).slice(0, limit);
  }

  best(): RunRecord | null {
    return this.top(1)[0] ?? null;
  }
}

/** The local history store used by receipts and the My Orders view. */
export const runStore: RunStore = new LocalRunStore();
