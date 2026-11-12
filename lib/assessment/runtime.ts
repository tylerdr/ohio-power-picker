import { supabaseServer, type ServerFetch } from '../supabase/server';
import { AssessmentCustody } from './custody';
import { PostgrestCustody } from './postgrest-custody';
import { invoiceAuthority } from './invoice-authority';
import { stripeInvoiceReader } from './stripe-invoice-reader';
import { assessmentHandlers } from './http';
export type ApprovedTarget = { origin: string; tenant: string; stripeAccount: string; livemode: false };
// Deliberately empty: no actual isolated project/session/store binding has been verified.
export const APPROVED_ASSESSMENT_TARGETS: readonly ApprovedTarget[] = [];
export type RuntimeConfig = { target: ApprovedTarget; publishableKey: string; serviceKey: string; stripeKey: string };
export function configFromEnvironment(env: Record<string, string | undefined>, approved = APPROVED_ASSESSMENT_TARGETS): RuntimeConfig | null {
  if (env.OHIO_ASSESSMENT_ENABLED !== 'true' || env.VERCEL_ENV !== 'preview') return null;
  const target = approved.find(t => t.origin === env.OHIO_ASSESSMENT_SUPABASE_URL && t.tenant === env.OHIO_ASSESSMENT_TENANT && t.stripeAccount === 'acct_1Re4ltEQ7c58oLZ4' && t.livemode === false);
  if (!target || !env.OHIO_ASSESSMENT_PUBLISHABLE_KEY || !env.OHIO_ASSESSMENT_SERVICE_KEY || !env.OHIO_ASSESSMENT_STRIPE_KEY) return null;
  return { target, publishableKey: env.OHIO_ASSESSMENT_PUBLISHABLE_KEY, serviceKey: env.OHIO_ASSESSMENT_SERVICE_KEY, stripeKey: env.OHIO_ASSESSMENT_STRIPE_KEY };
}
export function mountedAssessmentHandlers(config: RuntimeConfig | null, transport: ServerFetch = fetch) {
  async function handle(request: Request, id: string, edit: boolean) {
    if (!config) return assessmentHandlers(null).GET(request, id);
    // Per-request actor/store instance; no mutable global current user or paid cache.
    const sb = supabaseServer({ ...config.target, publishableKey: config.publishableKey, serviceKey: config.serviceKey }, transport);
    let actor: Awaited<ReturnType<typeof sb.authenticate>>;
    try { actor = await sb.authenticate(request); } catch { return new Response(JSON.stringify({ error: 'Session verification unavailable.' }), { status: 503, headers: { 'Cache-Control': 'private, no-store' } }); }
    if (!actor) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
    const authority = invoiceAuthority(stripeInvoiceReader({ key: config.stripeKey, account: config.target.stripeAccount, livemode: config.target.livemode }, transport), { account: config.target.stripeAccount, livemode: config.target.livemode });
    const handlers = assessmentHandlers({ authenticate: async () => actor, custody: new AssessmentCustody(new PostgrestCustody(sb.rpc, actor), authority) });
    return edit ? handlers.POST(request, id) : handlers.GET(request, id);
  }
  return { GET: (r: Request, id: string) => handle(r, id, false), POST: (r: Request, id: string) => handle(r, id, true) };
}
