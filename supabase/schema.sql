-- Draft schema for the leaderboard. Apply in the Supabase SQL editor when ready.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text        not null check (char_length(name) between 1 and 20),
  score       integer     not null check (score >= 0),
  run_ms      integer     not null check (run_ms > 0),
  created_at  timestamptz not null default now()
);

create index if not exists scores_score_idx on public.scores (score desc);

-- One row per player: the best score under that name (case-insensitive). If the table already has repeat
-- names, run this first to keep only each name's best row (ties keep the earliest):
--   delete from public.scores s using public.scores b
--   where lower(s.name) = lower(b.name) and (b.score > s.score or (b.score = s.score and b.id < s.id));
create unique index if not exists scores_name_key on public.scores (lower(name));

-- Lock the table down: browsers may only read. Inserts happen through a
-- server function using the service role, after validating the run token.
alter table public.scores enable row level security;

create policy "scores are publicly readable"
  on public.scores for select
  using (true);

-- One row per run token. `start-run` inserts it when a game begins; `submit-score` checks it is
-- unused and the score is plausible for the elapsed time, then marks it used. Browsers get no access at all
-- (RLS on, no policies); only server functions using the service role touch this table.
create table if not exists public.runs (
  token       uuid        primary key default gen_random_uuid(),
  started_at  timestamptz not null default now(),
  used        boolean     not null default false,
  client_ip   text
);

alter table public.runs enable row level security;

-- Saves a finished run, keeping only the player's best. Called by `submit-score` with the service role.
create or replace function public.submit_best_score(p_name text, p_score integer, p_run_ms integer)
returns void
language sql
as $$
  insert into public.scores (name, score, run_ms)
  values (p_name, p_score, p_run_ms)
  on conflict (lower(name)) do update
    set score = excluded.score, run_ms = excluded.run_ms, created_at = now()
    where excluded.score > public.scores.score;
$$;

revoke all on function public.submit_best_score(text, integer, integer) from public, anon, authenticated;
grant execute on function public.submit_best_score(text, integer, integer) to service_role;
