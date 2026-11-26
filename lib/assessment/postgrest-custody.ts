import type { VerifiedOwnerSession } from '../supabase/server';
import { AssessmentError, type Actor, type CustodyStore, type RecordRow } from './custody';
export type CustodyRpc = (name: string, body: unknown) => Promise<unknown>;
export class PostgrestCustody implements CustodyStore {
  constructor(private rpc: CustodyRpc, private actor: VerifiedOwnerSession) {}
  async transact<T>(id: string, run: (row: RecordRow) => Promise<{ row: RecordRow; result: T }>): Promise<T> {
    if (!this.actor.session || !Number.isFinite(this.actor.expiresAt) || this.actor.expiresAt <= Date.now()) throw new AssessmentError(401, 'Live verified session required.');
    const args = { p_id: id, p_owner: this.actor.owner, p_tenant: this.actor.tenant, p_session: this.actor.session };
    const loaded = await this.rpc('ohio_assessment_load', args) as { revision: number; row: RecordRow } | null;
    if (!loaded) throw new AssessmentError(404, 'Assessment unavailable.');
    if (!Number.isSafeInteger(loaded.revision) || loaded.revision < 0 || !loaded.row?.registration || loaded.row.registration.owner !== this.actor.owner || loaded.row.registration.tenant !== this.actor.tenant || loaded.row.registration.id !== id) throw new AssessmentError(503, 'Invalid custody response.');
    const next = await run(structuredClone(loaded.row));
    if (!next.row.saved || !Number.isSafeInteger(next.row.saved.version) || next.row.saved.version < 1) throw new AssessmentError(409, 'Invalid saved version.');
    if (JSON.stringify(next.row.registration) !== JSON.stringify(loaded.row.registration)) throw new AssessmentError(409, 'Registration is immutable.');
    // SQL atomically checks fresh membership, owner, internal revision and immutable original.
    // A conflict throws; callback (read-only provider checks) is safe to retry only on an explicit request.
    const committed = await this.rpc('ohio_assessment_commit', { ...args, p_revision: loaded.revision, p_saved: next.row.saved ?? null });
    if (committed !== true) throw new AssessmentError(409, 'Custody changed; reload before retrying.');
    // Fresh response boundary check after all provider/load/CAS work. Never substitute
    // the actor cached at request authentication, even for read-only recovery.
    const live = await this.rpc('ohio_assessment_actor', { p_owner: this.actor.owner, p_tenant: this.actor.tenant, p_session: this.actor.session }) as { owner?: string; tenant?: string; session_id?: string } | null;
    if (!live || live.owner !== this.actor.owner || live.tenant !== this.actor.tenant || live.session_id !== this.actor.session || this.actor.expiresAt <= Date.now()) throw new AssessmentError(401, 'Session no longer authorizes this response.');
    return next.result;
  }
}
