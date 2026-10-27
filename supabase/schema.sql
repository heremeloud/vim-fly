-- Draft schema for the leaderboard. Apply in the Supabase SQL editor when ready.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text        not null check (char_length(name) between 1 and 20),
  score       integer     not null check (score >= 0),
  run_ms      integer     not null check (run_ms > 0),
  created_at  timestamptz not null default now()
);

create index if not exists scores_score_idx on public.scores (score desc);

-- Lock the table down: browsers may only read. Inserts happen through a
-- server function using the service role, after validating the run token.
alter table public.scores enable row level security;

create policy "scores are publicly readable"
  on public.scores for select
  using (true);
