# supabase

Database definitions for the leaderboard.

- `schema.sql`: the `scores` table (one best score per opaque player ID), short-lived `runs` tokens and atomic `run_rate_limits` buckets. Public clients can read only the three display columns; all writes use server functions with the service role.

The database does **not** keep every run:

- A submitted run token is atomically deleted by `submit-score`, whether the score is accepted or rejected.
- An abandoned token can live for at most three hours. The next `start-run` request removes expired tokens.
- `scores` keeps one row per browser player ID, permits duplicate display names, only updates the score when that player beats their best, and retains at most the best 1,000 players overall. The app displays the top 100.
- Rate limiting is independent of run tokens: one hashed-IP/minute bucket is incremented atomically and removed after ten minutes.

This cleanup needs no cron job. The indexes in `schema.sql` keep expiry and rate-limit queries inexpensive.

Apply it by pasting into the Supabase SQL editor. See `src/leaderboard/README.md` for the full flow and the anti-cheat reasoning.

Tracked production changes also live in `migrations/`; apply them with `supabase db push` from the linked checkout.

If you change the schema, edit `schema.sql` so it stays the record of what the database should look like.
