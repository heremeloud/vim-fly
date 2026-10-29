// Updates the display name for an existing leaderboard identity. The opaque player UUID is stored only
// in that player's browser and is not exposed by public leaderboard reads.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';
import { cleanPlayerName } from '../_shared/player-name.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { playerId?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  if (typeof body.playerId !== 'string' || !UUID.test(body.playerId)) return json({ error: 'bad_player_id' }, 400);
  const name = cleanPlayerName(body.name);
  if (!name) return json({ error: 'bad_name' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await db.from('scores').update({ name }).eq('player_id', body.playerId);
  if (error) return json({ error: 'could_not_update_name' }, 500);
  return json({ ok: true });
});
