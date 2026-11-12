// Server composition only. Never import into a client component.
import { AssessmentError, type Actor } from '../assessment/custody';
if (typeof window !== 'undefined') throw new Error('Server-only assessment module.');
export type VerifiedOwnerSession = Actor & { session: string; expiresAt: number };
export type ServerFetch = typeof fetch;
export type SupabaseBinding = { origin: string; publishableKey: string; serviceKey: string; tenant: string };
export function supabaseServer(binding: SupabaseBinding, transport: ServerFetch = fetch) {
  const url = new URL(binding.origin);
  if (url.protocol !== 'https:' || url.origin !== binding.origin || !/^[a-z0-9]+\.supabase\.co$/.test(url.hostname)) throw new Error('Invalid approved auth/store origin.');
  async function request(path: string, body: unknown, token: string, key: string) {
    const r = await transport(`${url.origin}${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new AssessmentError(r.status === 401 || r.status === 403 ? 401 : 503, 'Verified session or custody service unavailable.');
    return r.json();
  }
  const rpc = (name: string, body: unknown) => request(`/rest/v1/rpc/${name}`, body, binding.serviceKey, binding.serviceKey);
  async function authenticate(req: Request): Promise<VerifiedOwnerSession | null> {
    const bearer = req.headers.get('authorization');
    const cookies = (req.headers.get('cookie') ?? '').split(';').map(x => x.trim()).filter(x => x.startsWith('__Host-ohio-access-token='));
    // An existing session issuer must set this Secure/HttpOnly/Path=/ cookie. No new login/account system.
    if (cookies.length > 1 || (bearer && cookies.length)) return null;
    const token = bearer?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1] ?? cookies[0]?.slice('__Host-ohio-access-token='.length);
    if (!token || token.length > 8192) return null;
    const user = await request('/auth/v1/user', undefined, token, binding.publishableKey);
    if (!user || typeof user.id !== 'string' || user.is_anonymous === true) return null;
    let claims;
    try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()); } catch { return null; }
    if (claims.sub !== user.id || claims.iss !== `${url.origin}/auth/v1` || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now() || typeof claims.session_id !== 'string') return null;
    // Claims are inspected only AFTER remote authentication; SQL also checks current session row.
    // No JWT/user_metadata tenant claim is authority. Membership is read fresh from private rows.
    const actor = await rpc('ohio_assessment_actor', { p_owner: user.id, p_tenant: binding.tenant, p_session: claims.session_id });
    if (!actor || actor.owner !== user.id || actor.tenant !== binding.tenant || actor.session_id !== claims.session_id) return null;
    return { owner: user.id, tenant: binding.tenant, session: claims.session_id, expiresAt: claims.exp * 1000 };
  }
  return { authenticate, rpc };
}
