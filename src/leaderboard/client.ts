// Leaderboard client. Scores are NEVER inserted directly from the browser:
// the browser asks a server function for a run token, then submits through
// another server function that validates it. See src/leaderboard/README.md.
//
// Every call can fail (offline, no .env, server down). Callers treat that as "play on without the ladder".

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const TIMEOUT_MS = 8000;

export interface ScoreEntry {
  name: string;
  score: number;
  createdAt: string;
}

export interface RunSession {
  token: string;
  startedAt: number;
}

// A game running on localhost never talks to the worldwide ladder, so dev runs don't pollute it.
const isLocalHost = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) || location.hostname.endsWith('.localhost');

/** True when the Supabase URL and public key are set in .env and the game is not running locally. */
export const leaderboardConfigured = Boolean(URL && KEY) && !isLocalHost;

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  if (!URL || !KEY || !leaderboardConfigured) throw new Error('Leaderboard is not configured (.env) or running locally');
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: { apikey: KEY, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Leaderboard request failed (${res.status})`);
  return res;
}

export async function startRun(): Promise<RunSession> {
  const res = await request('/functions/v1/start-run', { method: 'POST', body: '{}' });
  return (await res.json()) as RunSession;
}

export async function submitScore(session: RunSession, name: string, score: number): Promise<void> {
  await request('/functions/v1/submit-score', { method: 'POST', body: JSON.stringify({ token: session.token, name, score }) });
}

export async function fetchTopScores(limit = 100): Promise<ScoreEntry[]> {
  // Reads go straight to the table: row-level security allows select for everyone and nothing else.
  const res = await request(`/rest/v1/scores?select=name,score,created_at&order=score.desc,created_at.asc&limit=${limit}`);
  const rows = (await res.json()) as { name: string; score: number; created_at: string }[];
  return rows.map((r) => ({ name: r.name, score: r.score, createdAt: r.created_at }));
}

// The run in progress. Started when the game scene opens; the receipt submits it. A failed start just means no submit.
let current: Promise<RunSession | null> | null = null;

export function beginRun(): void {
  current = leaderboardConfigured ? startRun().catch(() => null) : Promise.resolve(null);
}

/** Submit the finished run once. Resolves true if the server accepted it. */
export async function submitFinishedRun(name: string, score: number): Promise<boolean> {
  const pending = current;
  current = null; // a token is single-use
  const session = await pending;
  if (!session) return false;
  try {
    await submitScore(session, name, score);
    return true;
  } catch {
    return false;
  }
}
