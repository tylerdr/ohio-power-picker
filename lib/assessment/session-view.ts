import { createHash } from 'node:crypto';
import { supabaseServer, type ServerFetch } from '../supabase/server';
import type { RuntimeConfig } from './runtime';
export function assessmentSessionView(config: RuntimeConfig | null, transport: ServerFetch = fetch) {
  return async (request: Request) => {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' };
    if (!config) return new Response(JSON.stringify({ error: 'Private assessment runtime is not configured.' }), { status: 503, headers });
    try {
      const actor = await supabaseServer({ ...config.target, publishableKey: config.publishableKey, serviceKey: config.serviceKey }, transport).authenticate(request);
      if (!actor) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers });
      return new Response(JSON.stringify({ owner: actor.owner, tenant: actor.tenant, expiresAt: actor.expiresAt, fingerprint: createHash('sha256').update(JSON.stringify([actor.tenant, actor.owner, actor.session])).digest('hex'), authChannel: `sb-${new URL(config.target.origin).hostname.split('.')[0]}-auth-token` }), { status: 200, headers });
    } catch { return new Response(JSON.stringify({ error: 'Session verification unavailable.' }), { status: 503, headers }); }
  };
}
