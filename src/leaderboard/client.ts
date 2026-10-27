// Leaderboard client. Scores are NEVER inserted directly from the browser:
// the browser asks a server function for a run token, then submits through
// another server function that validates it. See src/leaderboard/README.md.
//
// Not wired up yet; this file pins down the interface the game will call.

export interface ScoreEntry {
  name: string;
  score: number;
  createdAt: string;
}

export interface RunSession {
  token: string;
  startedAt: number;
}

export async function startRun(): Promise<RunSession> {
  throw new Error('Leaderboard not implemented yet');
}

export async function submitScore(_session: RunSession, _name: string, _score: number): Promise<void> {
  throw new Error('Leaderboard not implemented yet');
}

export async function fetchTopScores(_limit = 100): Promise<ScoreEntry[]> {
  throw new Error('Leaderboard not implemented yet');
}
