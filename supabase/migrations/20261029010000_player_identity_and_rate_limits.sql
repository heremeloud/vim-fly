-- Separate leaderboard identity from display names and make run-start limiting atomic.

alter table public.scores add column if not exists player_id uuid default gen_random_uuid();
update public.scores set player_id = gen_random_uuid() where player_id is null;
alter table public.scores alter column player_id set default gen_random_uuid();
alter table public.scores alter column player_id set not null;

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

-- Preserve continuity for the frontend version that predates browser UUIDs.
update public.scores set player_id = public.legacy_player_id(name);

drop index if exists public.scores_name_key;
create unique index if not exists scores_player_id_key on public.scores (player_id);

revoke select on table public.scores from anon, authenticated;
grant select (name, score, created_at) on table public.scores to anon, authenticated;

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

create or replace function public.submit_best_score(p_name text, p_score integer, p_run_ms integer)
returns void
language sql
as $$
  select public.submit_best_score(public.legacy_player_id(p_name), p_name, p_score, p_run_ms);
$$;

revoke all on function public.submit_best_score(text, integer, integer) from public, anon, authenticated;
grant execute on function public.submit_best_score(text, integer, integer) to service_role;
