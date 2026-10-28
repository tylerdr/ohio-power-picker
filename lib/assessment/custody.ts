import { createHash } from 'node:crypto';
import { prepareReport, observations, type Intake } from './report';

export type Actor = { tenant: string; owner: string };
export type Scope = { revision: string; acceptedAt: string; kind: 'measurement-gap-only'; priceCents: 50000; pilot: 1; exclusions: string[] };
export type Registration = { id: string; tenant: string; owner: string; customer: string; invoice: string; account: string; livemode: boolean; scope: Scope };
export type Saved = { registration: Registration; version: number; original: { report: string; digest: string; input: Intake; sources: typeof observations; preparedAt: string; scope: Scope }; editedInput: Intake };
export type RecordRow = { registration: Registration; saved?: Saved };
export interface CustodyStore {
  // Implementations must serialize across processes, clone reads, and atomically replace only on success.
  transact<T>(id: string, run: (row: RecordRow) => Promise<{ row: RecordRow; result: T }>): Promise<T>;
}
export type Invoice = { id: string; customer: string; status: string; amountPaid: number; currency: string; amountRefunded: number; disputed: boolean; paidOutOfBand: boolean; account: string; livemode: boolean };
export interface InvoiceAuthority { retrieve(invoice: string): Promise<Invoice> }
export class AssessmentError extends Error { constructor(public status: number, message: string) { super(message); } }
export const hashReport = (report: string) => createHash('sha256').update(report).digest('hex');
export class AssessmentCustody {
  constructor(private store: CustodyStore, private invoices: InvoiceAuthority, private now: () => string = () => new Date().toISOString()) {}
  private owner(row: RecordRow, actor: Actor) {
    if (!actor?.tenant || !actor?.owner || row.registration.tenant !== actor.tenant || row.registration.owner !== actor.owner) throw new AssessmentError(404, 'Assessment unavailable.');
    const s = row.registration.scope;
    if (!s || s.kind !== 'measurement-gap-only' || s.priceCents !== 50000 || s.pilot !== 1 || !s.revision || !Number.isFinite(Date.parse(s.acceptedAt)) || !Array.isArray(s.exclusions) || !s.exclusions.length) throw new AssessmentError(409, 'Accepted bounded scope required.');
  }
  private async rights(r: Registration) {
    const i = await this.invoices.retrieve(r.invoice); // No caller metadata/redirect is authority.
    if (i.id !== r.invoice || i.customer !== r.customer || i.account !== r.account || i.livemode !== r.livemode || i.status !== 'paid' || i.currency !== 'usd' || i.amountPaid !== 50000 || i.amountRefunded !== 0 || i.disputed !== false || i.paidOutOfBand !== false) throw new AssessmentError(403, 'Current qualifying invoice payment required.');
  }
  async access(actor: Actor, id: string, change?: { expectedVersion: number; input: Intake }): Promise<Saved & { evidenceStatus: string }> {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new AssessmentError(404, 'Assessment unavailable.');
    return this.store.transact(id, async row => {
      this.owner(row, actor); // Before provider or artifact read.
      await this.rights(row.registration);
      let saved = row.saved;
      if (saved && (saved.registration.id !== id || saved.registration.tenant !== actor.tenant || saved.registration.owner !== actor.owner || JSON.stringify(saved.registration) !== JSON.stringify(row.registration) || hashReport(saved.original.report) !== saved.original.digest)) throw new AssessmentError(409, 'Custody integrity check failed.');
      if (change) {
        if (!Number.isInteger(change.expectedVersion) || change.expectedVersion !== (saved?.version ?? 0)) throw new AssessmentError(409, 'Stale version; reload before editing.');
        // Real engine validates bounds, accepted gap-only preparation and unavailable baseline.
        let report: string;
        try { report = prepareReport(change.input); } catch { throw new AssessmentError(400, 'Invalid measurement-gap input.'); }
        if (!saved) saved = { registration: structuredClone(row.registration), version: 1, original: { report, digest: hashReport(report), input: structuredClone(change.input), sources: structuredClone(observations), scope: structuredClone(row.registration.scope), preparedAt: this.now() }, editedInput: structuredClone(change.input) };
        else saved = { ...saved, version: saved.version + 1, editedInput: structuredClone(change.input) };
      }
      if (!saved) throw new AssessmentError(404, 'No prepared report saved.');
      // Fresh check at actual response/write boundary; provider outage never authorizes cached paid rights.
      await this.rights(row.registration);
      const today = this.now().slice(0, 10);
      const evidenceStatus = saved.original.sources.some(s => s.date < today) ? 'DATED EVIDENCE — recheck at delivery; not a current offer' : 'DATED SNAPSHOT — eligibility and complete contract unverified';
      return { row: { ...row, saved }, result: { ...structuredClone(saved), evidenceStatus } };
    });
  }
}
