import { AssessmentError, type Invoice } from './custody';
import type { VerifiedInvoiceReader } from './invoice-authority';
import type { ServerFetch } from '../supabase/server';
export function stripeInvoiceReader(binding: { key: string; account: string; livemode: boolean }, transport: ServerFetch = fetch): VerifiedInvoiceReader {
  async function get(path: string) {
    const r = await transport(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${binding.key}`, 'Stripe-Version': '2024-06-20' }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new AssessmentError(503, 'Authoritative invoice provider unavailable.');
    return r.json();
  }
  return { async retrieveVerified(id): Promise<Invoice> {
    if (!/^in_[a-zA-Z0-9]+$/.test(id)) throw new AssessmentError(503, 'Invalid registered invoice.');
    // Verify actual key scope/mode, not environment labels or caller metadata. Never use Connect impersonation.
    const [account, balance] = await Promise.all([get('account'), get('balance')]);
    if (account.id !== binding.account || balance.livemode !== binding.livemode) throw new AssessmentError(503, 'Invoice account/mode mismatch.');
    const i = await get(`invoices/${encodeURIComponent(id)}?expand[]=charge&expand[]=payment_intent`);
    const base = { id: i.id, customer: typeof i.customer === 'string' ? i.customer : i.customer?.id, status: i.status, amountPaid: i.amount_paid, currency: i.currency, account: account.id, livemode: i.livemode };
    if (i.id !== id || i.livemode !== binding.livemode) throw new AssessmentError(503, 'Invoice identity mismatch.');
    // Unpaid/draft states deny without pretending that missing charge evidence is a paid receipt.
    if (i.status !== 'paid') return { ...base, amountRefunded: 0, disputed: false, paidOutOfBand: false };
    const c = i.charge, pi = i.payment_intent;
    if (!c || typeof c !== 'object' || !pi || typeof pi !== 'object' || c.invoice !== id || c.payment_intent !== pi.id || pi.latest_charge !== c.id || pi.status !== 'succeeded' || c.customer !== base.customer || pi.customer !== base.customer || c.livemode !== binding.livemode || pi.livemode !== binding.livemode || c.currency !== i.currency || pi.currency !== i.currency || c.amount_captured !== i.amount_paid || pi.amount_received !== i.amount_paid || c.paid !== true || c.captured !== true || c.status !== 'succeeded' || !Number.isSafeInteger(c.amount_refunded) || typeof c.disputed !== 'boolean' || typeof i.paid_out_of_band !== 'boolean' || i.pre_payment_credit_notes_amount !== 0 || i.post_payment_credit_notes_amount !== 0 || i.starting_balance !== 0 || i.ending_balance !== 0) throw new AssessmentError(503, 'Unsupported or incomplete invoice/charge reconciliation.');
    // Only single fully attributable captured-charge invoices supported. Credits/multi-payment forms fail closed.
    return { ...base, amountRefunded: c.amount_refunded, disputed: c.disputed, paidOutOfBand: i.paid_out_of_band };
  } };
}
