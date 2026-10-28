// Called when a run ends. Spends the run token, checks the score is possible for how long the run lasted,
// and only then writes to `scores`. Browsers can't insert into `scores` themselves (see schema.sql).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

const NAME_MAX = 20;
/** Generous ceiling on how fast anyone can earn: height plus the best items under double points, with a margin. */
const MAX_POINTS_PER_SECOND = 800;
const SCORE_HEAD_ROOM = 150;
const MIN_RUN_MS = 1_000;
const MAX_RUN_MS = 3 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // deno-lint-ignore no-control-regex
  return Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, '').trim()).slice(0, NAME_MAX).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { token?: unknown; name?: unknown; score?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const name = cleanName(body.name);
  const score = body.score;
  if (typeof body.token !== 'string' || !UUID.test(body.token)) return json({ error: 'bad_token' }, 400);
  if (!name) return json({ error: 'bad_name' }, 400);
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) return json({ error: 'bad_score' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Spend the token first, atomically: of two simultaneous submits only one gets a row back.
  // An implausible score also burns the token, so it can't be retried with a smaller number.
  const { data: run } = await db.from('runs').update({ used: true }).eq('token', body.token).eq('used', false).select('started_at').maybeSingle();
  if (!run) return json({ error: 'token_used_or_unknown' }, 409);

  const runMs = Date.now() - Date.parse(run.started_at);
  if (runMs < MIN_RUN_MS || runMs > MAX_RUN_MS) return json({ error: 'bad_duration' }, 422);
  if (score > SCORE_HEAD_ROOM + (runMs / 1000) * MAX_POINTS_PER_SECOND) return json({ error: 'implausible_score' }, 422);

  // Keeps only this player's best: a lower score than the one on file is accepted but changes nothing.
  const { error } = await db.rpc('submit_best_score', { p_name: name, p_score: score, p_run_ms: Math.round(runMs) });
  if (error) return json({ error: 'could_not_save' }, 500);
  return json({ ok: true });
});
