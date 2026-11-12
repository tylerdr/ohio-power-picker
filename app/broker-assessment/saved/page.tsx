'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { prepareFirstSavedReport } from '@/lib/assessment/saved-client';
import { Label } from '@/components/ui/label';
import type { Saved } from '@/lib/assessment/custody';
type SessionView = { owner: string; tenant: string; fingerprint: string; expiresAt: number; authChannel: string };
export default function SavedAssessment() {
  const [gapOnly, setGapOnly] = useState(false);
  const [id, setId] = useState('');
  const [view, setView] = useState<(Saved & { evidenceStatus: string }) | null>(null);
  const [usage, setUsage] = useState('900');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const epoch = useRef(0), alive = useRef(false), session = useRef<SessionView | null>(null);
  const pending = useRef<AbortController | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function invalidate() {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    epoch.current++; pending.current?.abort(); pending.current = null; session.current = null;
    if (alive.current) { setView(null); setUsage('900'); setGapOnly(false); setBusy(false); setSessionReady(false); setMessage('Session changed or requires verification. Reload after signing in.'); }
  }
  function adopt(verified: SessionView) {
    session.current = verified; setSessionReady(true);
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    expiryTimer.current = setTimeout(invalidate, Math.min(verified.expiresAt - Date.now(), 2147483647));
  }
  async function verify(signal?: AbortSignal): Promise<SessionView> {
    const r = await fetch('/api/broker-assessments/session', { credentials: 'same-origin', cache: 'no-store', signal });
    const data = await r.json();
    if (!r.ok || typeof data.owner !== 'string' || typeof data.tenant !== 'string' || !/^[a-f0-9]{64}$/.test(data.fingerprint) || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now() || !/^sb-[a-z0-9]+-auth-token$/.test(data.authChannel)) throw new Error('Current session unavailable.');
    return data;
  }
  useEffect(() => {
    alive.current = true;
    let channel: BroadcastChannel | undefined;
    const probe = async (clear: boolean) => {
      if (clear) invalidate();
      const generation = epoch.current;
      try {
        const verified = await verify();
        if (!alive.current || generation !== epoch.current) return;
        if (session.current && session.current.fingerprint !== verified.fingerprint) { invalidate(); return; }
        adopt(verified);
        if (!channel && typeof BroadcastChannel !== 'undefined') {
          // Supabase GoTrue's storage-key channel. Event data is NEVER identity authority.
          channel = new BroadcastChannel(verified.authChannel); channel.onmessage = () => { void probe(true); };
        }
      } catch { if (alive.current && generation === epoch.current) invalidate(); }
    };
    const changed = () => { void probe(true); };
    const storage = (e: StorageEvent) => { if (e.key === null || e.key === session.current?.authChannel || /^sb-.*-auth-token$/.test(e.key ?? '')) changed(); };
    const visibility = () => { invalidate(); if (document.visibilityState === 'visible') void probe(false); };
    window.addEventListener('storage', storage); window.addEventListener('focus', changed);
    window.addEventListener('pageshow', changed); window.addEventListener('pagehide', invalidate);
    document.addEventListener('visibilitychange', visibility);
    // Revocation without a local auth event is detected by a bounded server probe.
    const interval = setInterval(() => { void probe(false); }, 5000);
    void probe(false);
    return () => { alive.current = false; epoch.current++; pending.current?.abort(); session.current = null; channel?.close(); if (expiryTimer.current) clearTimeout(expiryTimer.current); clearInterval(interval); window.removeEventListener('storage', storage); window.removeEventListener('focus', changed); window.removeEventListener('pageshow', changed); window.removeEventListener('pagehide', invalidate); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  async function action(kind: 'load' | 'prepare' | 'edit') {
    const oldView = view, reference = id, amount = Number(usage), consent = gapOnly;
    const generation = ++epoch.current; pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    setView(null); setMessage(''); setBusy(true);
    const current = () => alive.current && generation === epoch.current && !controller.signal.aborted;
    try {
      const owner = await verify(controller.signal); if (!current()) return;
      if (session.current && owner.fingerprint !== session.current.fingerprint) { invalidate(); return; }
      session.current = owner;
      let data;
      if (kind === 'prepare') data = await prepareFirstSavedReport(reference, amount, consent, (url, init) => fetch(url, { ...init, signal: controller.signal }));
      else {
        const r = await fetch(`/api/broker-assessments/${encodeURIComponent(reference)}`, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal, ...(kind === 'edit' ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedVersion: oldView?.version, input: { ...oldView?.editedInput, monthlyKwh: amount } }) } : {}) });
        data = await r.json(); if (!r.ok) throw new Error(data.error || 'Assessment unavailable.');
      }
      if (!current()) return;
      const fresh = await verify(controller.signal); if (!current()) return;
      if (fresh.fingerprint !== owner.fingerprint || data.registration?.owner !== fresh.owner || data.registration?.tenant !== fresh.tenant || data.registration?.id !== reference) { invalidate(); return; }
      adopt(fresh); setView(data); setUsage(String(data.editedInput.monthlyKwh));
    } catch (e) { if (current()) { invalidate(); setMessage(e instanceof Error ? e.message : 'Unable to load; verify your session before retrying.'); } }
    finally { if (current()) setBusy(false); }
  }
  function changeReference(value: string) {
    epoch.current++; pending.current?.abort(); pending.current = null;
    setId(value); setView(null); setUsage('900'); setGapOnly(false); setMessage(''); setBusy(false);
  }
  const load = () => action('load');
  const prepareFirst = () => action('prepare');
  const saveEdits = () => action('edit');
  return <main className="mx-auto max-w-4xl p-6"><h1 className="text-3xl">Private saved assessment</h1><p className="my-4">Requires an existing authenticated owner session and current qualifying invoice. This route is unavailable until the isolated server runtime is configured. A report reference alone grants no access.</p><Label htmlFor="report-reference">Assessment reference</Label><Input id="report-reference" value={id} onChange={e => changeReference(e.target.value)} maxLength={80} disabled={busy} /><Button onClick={load} disabled={busy || !id || !sessionReady}>Load original saved report</Button><section className="my-6 space-y-3" aria-labelledby="initial-preparation"><h2 id="initial-preparation">Prepare the first saved report</h2><p>Only an existing owner-bound registration with accepted $500 measurement-gap scope, available one-pilot authority and current qualifying invoice can prepare an original. This form does not create a registration, accept legal terms, reserve capacity or establish a customer baseline. The report remains synthetic preparation, not completed professional delivery.</p><Label htmlFor="initial-usage">Synthetic monthly kWh assumption</Label><Input id="initial-usage" type="number" min="1" max="100000" value={usage} onChange={e => setUsage(e.target.value)} disabled={busy} /><div className="flex gap-3"><Checkbox id="initial-gap-scope" checked={gapOnly} onCheckedChange={v => setGapOnly(v === true)} disabled={busy} /><Label htmlFor="initial-gap-scope">Prepare measurement-gap-only content; no buyer baseline is available.</Label></div><Button onClick={prepareFirst} disabled={busy || !id || !gapOnly || !!view || !sessionReady}>Prepare and save first original</Button><p>Uses initial version zero. If an original already exists, preparation is refused; load it instead. Original sources, scope and bytes remain immutable.</p></section><p role="status">{message}</p>{view && <section><h2>Version {view.version}</h2><p>{view.evidenceStatus}</p><h3>Immutable original report</h3><pre className="whitespace-pre-wrap">{view.original.report}</pre><h3>Edited inputs (not a regenerated original)</h3><Label htmlFor="edited-usage">Edited synthetic kWh assumption</Label><Input id="edited-usage" type="number" min="1" max="100000" value={usage} onChange={e => setUsage(e.target.value)} disabled={busy} /><Button onClick={saveEdits} disabled={busy}>Save edited inputs with version check</Button><pre className="whitespace-pre-wrap">{JSON.stringify(view.editedInput, null, 2)}</pre></section>}</main>;
}
