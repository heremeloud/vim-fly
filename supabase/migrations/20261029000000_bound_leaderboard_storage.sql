-- Keep Vimmy Fly's leaderboard storage bounded.

-- Existing abandoned tokens older than the maximum valid run cannot be submitted anymore.
delete from public.runs
where started_at < now() - interval '3 hours';

-- Keep token expiry and per-IP rate-limit checks inexpensive.
create index if not exists runs_started_at_idx on public.runs (started_at);
create index if not exists runs_client_ip_started_at_idx on public.runs (client_ip, started_at);

-- Rank reads and the bounded-leaderboard trim use this ordering.
create index if not exists scores_rank_idx on public.scores (score desc, created_at asc);

-- Retain one best score per name and at most the best 1,000 players overall.
create or replace function public.submit_best_score(p_name text, p_score integer, p_run_ms integer)
returns void
language sql
as $$
  insert into public.scores (name, score, run_ms)
  values (p_name, p_score, p_run_ms)
  on conflict (lower(name)) do update
    set score = excluded.score, run_ms = excluded.run_ms, created_at = now()
    where excluded.score > public.scores.score;

  delete from public.scores
  where id in (
    select id
    from public.scores
    order by score desc, created_at asc, id asc
    offset 1000
  );
$$;

revoke all on function public.submit_best_score(text, integer, integer) from public, anon, authenticated;
grant execute on function public.submit_best_score(text, integer, integer) to service_role;

-- Apply the cap immediately instead of waiting for the next score submission.
delete from public.scores
where id in (
  select id
  from public.scores
  order by score desc, created_at asc, id asc
  offset 1000
);
