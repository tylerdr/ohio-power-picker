import { mkdir, readFile, writeFile, rename, rmdir, unlink } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AssessmentError, type CustodyStore, type RecordRow } from './custody';

// Disposable cloud/native adapter only. Never use Vercel ephemeral filesystem as hosted durability.
// Registration is operator-supplied; no HTTP path creates or changes payment/owner/scope bindings.
export class FileCustody implements CustodyStore {
  constructor(private root: string) { if (!isAbsolute(root) || process.env.VERCEL) throw new Error('Requires explicit isolated persistent filesystem outside Vercel.'); }
  async transact<T>(id: string, run: (row: RecordRow) => Promise<{ row: RecordRow; result: T }>): Promise<T> {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new AssessmentError(404, 'Assessment unavailable.');
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const file = join(this.root, `${id}.json`), lock = join(this.root, `${id}.lock`);
    try { await mkdir(lock, { mode: 0o700 }); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw new AssessmentError(503, 'Custody busy; retry.'); throw e; }
    let temp: string | undefined;
    try {
      let row: RecordRow;
      try { row = JSON.parse(await readFile(file, 'utf8')); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') throw new AssessmentError(404, 'Assessment unavailable.'); throw e; }
      if (row.registration.id !== id) throw new AssessmentError(409, 'Custody identity mismatch.');
      const out = await run(structuredClone(row));
      temp = `${file}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(out.row), { mode: 0o600, flag: 'wx' });
      await rename(temp, file); temp = undefined;
      return out.result;
    } finally { if (temp) await unlink(temp).catch(() => {}); await rmdir(lock); }
  }
}
