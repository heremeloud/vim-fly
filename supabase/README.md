# supabase

Database definitions for the leaderboard.

- `schema.sql`: the `scores` table (one row per player name, best score only, saved through `submit_best_score`), an index on score, and row-level security that allows public reads only. Inserts must come from a server function using the service role.

Apply it by pasting into the Supabase SQL editor. See `src/leaderboard/README.md` for the full flow and the anti-cheat reasoning.

If you change the schema, edit `schema.sql` so it stays the record of what the database should look like.
