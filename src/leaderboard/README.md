# leaderboard

Score submission and the top-scores list, backed by Supabase (Postgres, free tier).

## Orders tab: local runs now, ladder later

Every finished run is saved as a `RunRecord` by `runStore.ts` (`LocalRunStore`, in this browser's localStorage, only your 5 best runs are kept). The **Orders** tab shows them two ways:

- **My orders:** your run history, newest first, with the best marked.
- **Top customers:** your runs ranked by score. Ties go to the earlier run.

The Orders screen only talks to the `RunStore` interface. When the worldwide leaderboard exists, a server-backed store implements the same interface and the Orders screen becomes the ladder without a redesign: same rows, same tabs, a different source. (The server-side rules below still apply: scores go through a server function with a run token, never a direct insert.)

## Status

Built: `client.ts` (start, submit, fetch), the game starts a run token, the Receipt submits the score under the saved player name, and Top Customers reads the worldwide ladder (falling back to this device's best runs when it can't be reached). The server side is two Edge Functions in `supabase/functions/` (`start-run`, `submit-score`) plus the `scores` and `runs` tables in `supabase/schema.sql`.

Deploy the functions with `--no-verify-jwt` (the browser sends the public key, not a user login; the run token is the check):

```
supabase login
supabase link --project-ref <project-ref>
supabase functions deploy start-run --no-verify-jwt
supabase functions deploy submit-score --no-verify-jwt
```

## Why scores go through a server function

If the browser inserts scores straight into the database, fake scores appear within days of launch. So:

1. **Server function only.** The browser never inserts into `scores`. Row-level security allows reads only.
2. **Run token.** `startRun()` asks the server for a token and records the start time. On submit the server checks the token is valid and unused.
3. **Plausibility check.** The server compares the score to the run's duration (time since the token was issued) and rejects impossible scores.
4. **Rate limit** submissions per client.

## Planned flow

1. Run starts: `startRun()` returns `{ token, startedAt }`.
2. Run ends: the Receipt screen asks for a name.
3. `submitScore(session, name, score)` calls the server function.
4. Top Customers screen calls `fetchTopScores(100)`.

## Setup (when you get to it)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and fill in the URL and anon key. The anon key is public by design; the service-role key must never be in the browser or this repo.
4. Write the two server functions (start run, submit score).

## Table: `scores`

`name` (1-20 chars), `score` (>= 0), `run_ms`, `created_at`. Indexed on `score desc`.
