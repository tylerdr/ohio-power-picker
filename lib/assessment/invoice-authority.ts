import { type InvoiceAuthority, type Invoice, type Registration, AssessmentError } from './custody';

export interface VerifiedInvoiceReader {
  // Must use server credentials scoped to named account/mode. Reader must reconcile reversals
  // across invoice payments/charges; absent or unavailable reversal state MUST throw.
  retrieveVerified(id: string): Promise<Invoice>;
}
export function invoiceAuthority(reader: VerifiedInvoiceReader, binding: Pick<Registration, 'account' | 'livemode'>): InvoiceAuthority {
  return { async retrieve(id) {
    const i = await reader.retrieveVerified(id);
    if (!i || i.id !== id || i.account !== binding.account || i.livemode !== binding.livemode || !Number.isSafeInteger(i.amountPaid) || !Number.isSafeInteger(i.amountRefunded) || i.amountRefunded < 0 || typeof i.disputed !== 'boolean' || typeof i.paidOutOfBand !== 'boolean') throw new AssessmentError(503, 'Authoritative invoice/reversal evidence unavailable.');
    return i;
  } };
}
