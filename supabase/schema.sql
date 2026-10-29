-- Current schema for the leaderboard. Production changes are also tracked under supabase/migrations/.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  player_id   uuid        not null default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 20),
  score       integer     not null check (score >= 0),
  run_ms      integer     not null check (run_ms > 0),
  created_at  timestamptz not null default now()
);

alter table public.scores add column if not exists player_id uuid default gen_random_uuid();
update public.scores set player_id = gen_random_uuid() where player_id is null;
alter table public.scores alter column player_id set default gen_random_uuid();
alter table public.scores alter column player_id set not null;

create index if not exists scores_score_idx on public.scores (score desc);
create index if not exists scores_rank_idx on public.scores (score desc, created_at asc);

-- Identity is separate from the public display name, so different players may choose the same name.
drop index if exists public.scores_name_key;
create unique index if not exists scores_player_id_key on public.scores (player_id);

-- Lock the table down: browsers may only read. Inserts happen through a
-- server function using the service role, after validating the run token.
alter table public.scores enable row level security;

-- Public leaderboard reads expose display data only; opaque player IDs remain private.
revoke select on table public.scores from anon, authenticated;
grant select (name, score, created_at) on table public.scores to anon, authenticated;

create policy "scores are publicly readable"
  on public.scores for select
  using (true);

-- One row per active run token. `start-run` inserts it when a game begins; `submit-score` atomically
-- deletes it before validating the final score. Abandoned tokens older than three hours are deleted by
-- `start-run`, so this table never becomes permanent run history. Browsers get no access at all (RLS on,
-- no policies); only server functions using the service role touch this table.
create table if not exists public.runs (
  token       uuid        primary key default gen_random_uuid(),
  started_at  timestamptz not null default now(),
  used        boolean     not null default false,
  client_ip   text
);

alter table public.runs enable row level security;

-- Supports automatic expiry and the per-IP start rate-limit query.
create index if not exists runs_started_at_idx on public.runs (started_at);
create index if not exists runs_client_ip_started_at_idx on public.runs (client_ip, started_at);

-- Short-lived, atomic rate-limit buckets. Only the service-role Edge Function can access them.
create table if not exists public.run_rate_limits (
  client_key   text        not null,
  window_start timestamptz not null,
  starts       integer     not null check (starts > 0),
  primary key (client_key, window_start)
);

alter table public.run_rate_limits enable row level security;

create or replace function public.claim_run_start(p_client_key text, p_limit integer default 20)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_starts integer;
begin
  delete from public.run_rate_limits where window_start < now() - interval '10 minutes';

  insert into public.run_rate_limits (client_key, window_start, starts)
  values (p_client_key, date_trunc('minute', now()), 1)
  on conflict (client_key, window_start) do update
    set starts = public.run_rate_limits.starts + 1
  returning starts into v_starts;

  return v_starts <= p_limit;
end;
$$;

revoke all on function public.claim_run_start(text, integer) from public, anon, authenticated;
grant execute on function public.claim_run_start(text, integer) to service_role;

-- Compatibility identity for old frontends that submitted only a display name. New clients always send
-- their random browser UUID instead. This helper is not exposed publicly.
create or replace function public.legacy_player_id(p_name text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5('legacy:' || lower(p_name)), 1, 8) || '-' ||
    substr(md5('legacy:' || lower(p_name)), 9, 4) || '-4' ||
    substr(md5('legacy:' || lower(p_name)), 14, 3) || '-8' ||
    substr(md5('legacy:' || lower(p_name)), 18, 3) || '-' ||
    substr(md5('legacy:' || lower(p_name)), 21, 12)
  )::uuid;
$$;

revoke all on function public.legacy_player_id(text) from public, anon, authenticated;
grant execute on function public.legacy_player_id(text) to service_role;

-- Saves a finished run, keeping only the player's best and the best 1,000 players overall. The app shows
-- the top 100; the extra rows leave room for players to improve without letting random names grow forever.
-- Called by `submit-score` with the service role.
create or replace function public.submit_best_score(p_player_id uuid, p_name text, p_score integer, p_run_ms integer)
returns void
language sql
as $$
  insert into public.scores (player_id, name, score, run_ms)
  values (p_player_id, p_name, p_score, p_run_ms)
  on conflict (player_id) do update
    set name = excluded.name,
        score = greatest(public.scores.score, excluded.score),
        run_ms = case when excluded.score > public.scores.score then excluded.run_ms else public.scores.run_ms end,
        created_at = case when excluded.score > public.scores.score then now() else public.scores.created_at end;

  delete from public.scores
  where id in (
    select id
    from public.scores
    order by score desc, created_at asc, id asc
    offset 1000
  );
$$;

revoke all on function public.submit_best_score(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.submit_best_score(uuid, text, integer, integer) to service_role;

-- Temporary compatibility overload for a deployed frontend from before browser player IDs existed.
create or replace function public.submit_best_score(p_name text, p_score integer, p_run_ms integer)
returns void
language sql
as $$
  select public.submit_best_score(public.legacy_player_id(p_name), p_name, p_score, p_run_ms);
$$;

revoke all on function public.submit_best_score(text, integer, integer) from public, anon, authenticated;
grant execute on function public.submit_best_score(text, integer, integer) to service_role;
