// Called when a run ends. Spends the run token, checks the score is possible for how long the run lasted,
// and only then writes to `scores`. Browsers can't insert into `scores` themselves (see schema.sql).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';
import { cleanPlayerName } from '../_shared/player-name.ts';

/** Generous ceiling on how fast anyone can earn: height plus the best items under double points, with a margin. */
const MAX_POINTS_PER_SECOND = 2500;
const SCORE_HEAD_ROOM = 150;
const MIN_RUN_MS = 1_000;
const MAX_RUN_MS = 3 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { token?: unknown; playerId?: unknown; name?: unknown; score?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const name = cleanPlayerName(body.name);
  const score = body.score;
  if (typeof body.token !== 'string' || !UUID.test(body.token)) return json({ error: 'bad_token' }, 400);
  if (body.playerId !== undefined && (typeof body.playerId !== 'string' || !UUID.test(body.playerId))) return json({ error: 'bad_player_id' }, 400);
  if (!name) return json({ error: 'bad_name' }, 400);
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) return json({ error: 'bad_score' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Spend and remove the token atomically: of two simultaneous submits only one gets a row back.
  // No completed run history is retained. An invalid score also consumes its token, as before.
  const { data: run, error: tokenError } = await db.from('runs').delete().eq('token', body.token).eq('used', false).select('started_at').maybeSingle();
  if (tokenError) return json({ error: 'could_not_spend_token' }, 500);
  if (!run) return json({ error: 'token_used_or_unknown' }, 409);

  const runMs = Date.now() - Date.parse(run.started_at);
  if (runMs < MIN_RUN_MS || runMs > MAX_RUN_MS) return json({ error: 'bad_duration' }, 422);
  if (score > SCORE_HEAD_ROOM + (runMs / 1000) * MAX_POINTS_PER_SECOND) return json({ error: 'implausible_score' }, 422);

  // Keeps only this player's best: a lower score than the one on file is accepted but changes nothing.
  // Compatibility: the currently hosted pre-ID client may omit playerId until its next frontend deploy.
  // The three-argument database overload maps that name to a deterministic legacy ID.
  const args = body.playerId
    ? { p_player_id: body.playerId, p_name: name, p_score: score, p_run_ms: Math.round(runMs) }
    : { p_name: name, p_score: score, p_run_ms: Math.round(runMs) };
  const { error } = await db.rpc('submit_best_score', args);
  if (error) return json({ error: 'could_not_save' }, 500);
  return json({ ok: true });
});
