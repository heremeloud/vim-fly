// Called when a run begins. Issues a one-time run token and records when the run started.
// The server's clock decides how long a run lasted, so the client can't claim a longer one.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

const MAX_STARTS_PER_MINUTE = 20;
/** Matches submit-score's maximum accepted run length. Anything older can never produce a valid score. */
const RUN_TOKEN_TTL_MS = 3 * 60 * 60 * 1000;

async function clientKey(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // Opportunistic cleanup keeps `runs` bounded without a cron job. Submitted tokens are deleted immediately;
  // this only removes abandoned games. A cleanup failure should not prevent somebody from playing.
  const expiresBefore = new Date(Date.now() - RUN_TOKEN_TTL_MS).toISOString();
  const { error: cleanupError } = await db.from('runs').delete().lt('started_at', expiresBefore);
  if (cleanupError) console.error('run token cleanup failed', cleanupError);

  // The database increments one hashed-IP/minute bucket atomically. This stays correct when submitted run
  // tokens are deleted and when several starts arrive at the same instant.
  const { data: allowed, error: limitError } = await db.rpc('claim_run_start', {
    p_client_key: await clientKey(ip),
    p_limit: MAX_STARTS_PER_MINUTE,
  });
  if (limitError) return json({ error: 'rate_limit_unavailable' }, 500);
  if (!allowed) return json({ error: 'rate_limited' }, 429);

  const { data, error } = await db.from('runs').insert({}).select('token, started_at').single();
  if (error || !data) return json({ error: 'could_not_start' }, 500);
  return json({ token: data.token, startedAt: Date.parse(data.started_at) });
});
