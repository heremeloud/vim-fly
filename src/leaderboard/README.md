# leaderboard

Score submission and the top-scores list, backed by Supabase (Postgres, free tier).

## Orders tab: local runs and worldwide ladder

Every finished run is saved as a `RunRecord` by `runStore.ts` (`LocalRunStore`, in this browser's localStorage, only your 5 best runs are kept). The **Orders** tab shows them two ways:

- **My orders:** your run history, newest first, with the best marked.
- **Top customers:** your runs ranked by score. Ties go to the earlier run.

**My Orders** reads the local store. **World’s Top Customers** calls `fetchTopScores(100)` and falls back to the device's best runs when the server is unavailable. Scores go through a server function with a run token, never a direct database insert.

## Status

Built: `client.ts` (start, submit, fetch, rename), the game starts a run token, the Receipt submits the score under a stable browser player ID and editable display name, and Top Customers reads the worldwide ladder (falling back to this device's best runs when it can't be reached). The server side uses `start-run`, `submit-score` and `update-player-name` Edge Functions plus the tables in `supabase/schema.sql`.

Deploy the functions with `--no-verify-jwt` (the browser sends the public key, not a user login; the run token is the check):

```
supabase login
supabase link --project-ref <project-ref>
supabase functions deploy start-run --no-verify-jwt
supabase functions deploy submit-score --no-verify-jwt
supabase functions deploy update-player-name --no-verify-jwt
```

## Why scores go through a server function

If the browser inserts scores straight into the database, fake scores appear within days of launch. So:

1. **Server function only.** The browser never inserts into `scores`. Row-level security allows reads only.
2. **Run token.** `startRun()` asks the server for a token and records the start time. On submit the server atomically deletes the token, so it can only be used once and completed runs do not accumulate.
3. **Plausibility check.** The server compares the score to the run's duration (time since the token was issued) and rejects impossible scores.
4. **Atomic rate limit.** `claim_run_start` increments one short-lived hashed-IP/minute bucket in the database. Parallel requests cannot bypass it, and deleting completed run tokens does not reset it.
5. **Name moderation.** Reserved/impersonating names, obvious profanity and URL-like names are rejected in both the browser and Edge Functions.

## Player identity and names

`playerName.ts` creates a random UUID once per browser and stores it separately from the public name. `scores.player_id` is the unique key, so different players can safely choose the same display name. Public reads only have column permission for `name`, `score` and `created_at`; player IDs are not exposed by the leaderboard API.

The Settings card lets the player edit their name. `update-player-name` syncs it immediately when online, and the next accepted score submission also syncs it if the rename request was offline.

## Storage bounds

- `scores` stores one best row per case-insensitive player name, not one row per run, and trims itself to the best 1,000 players. The game displays the top 100.
- `runs` contains active tokens only. `submit-score` deletes a token as it spends it.
- Abandoned tokens expire after three hours and are cleaned by the next `start-run` request.
- `run_rate_limits` contains one hashed client/minute counter and deletes buckets after ten minutes.
- The browser separately keeps only five local best runs in `localStorage`; those never enter Supabase.

## Submission flow

1. Run starts: `startRun()` returns `{ token, startedAt }`.
2. Run ends: the Receipt screen asks for a name.
3. `submitScore(session, name, score)` calls the server function.
4. Top Customers screen calls `fetchTopScores(100)`.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and fill in the URL and anon key. The anon key is public by design; the service-role key must never be in the browser or this repo.
4. Deploy all three Edge Functions with the commands above.

## Table: `scores`

`name` (1-20 chars), `score` (>= 0), `run_ms`, `created_at`. Indexed on `score desc`.
