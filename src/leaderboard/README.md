# leaderboard

Score submission and the top-scores list, backed by Supabase (Postgres, free tier).

## Status

Interface only. `client.ts` defines `startRun`, `submitScore` and `fetchTopScores`; each throws "not implemented". The draft table is in `supabase/schema.sql`.

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
