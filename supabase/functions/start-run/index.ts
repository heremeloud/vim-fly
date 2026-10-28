// Called when a run begins. Issues a one-time run token and records when the run started.
// The server's clock decides how long a run lasted, so the client can't claim a longer one.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

const MAX_STARTS_PER_MINUTE = 20;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db.from('runs').select('*', { count: 'exact', head: true }).eq('client_ip', ip).gte('started_at', since);
  if ((count ?? 0) >= MAX_STARTS_PER_MINUTE) return json({ error: 'rate_limited' }, 429);

  const { data, error } = await db.from('runs').insert({ client_ip: ip }).select('token, started_at').single();
  if (error || !data) return json({ error: 'could_not_start' }, 500);
  return json({ token: data.token, startedAt: Date.parse(data.started_at) });
});
