'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { prepareReport, packReport, recoverReport } from '@/lib/assessment/report';

export default function AssessmentPreparer() {
  const recoverySequence = useRef(0);
  const [usage, setUsage] = useState('900');
  const [accepted, setAccepted] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  function prepare() {
    recoverySequence.current += 1;
    try {
      setReport(prepareReport({ caseLabel: 'Synthetic broker case 001', territory: 'ohio-edison', monthlyKwh: Number(usage), baselineAvailable: false, measurementGapScopeAccepted: accepted }));
      setError('');
    } catch (e) { setReport(''); setError(e instanceof Error ? e.message : 'Preparation failed.'); }
  }
  function download(content: string, name: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(file?: File) {
    const sequence = ++recoverySequence.current;
    setError(''); setReport('');
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error('Recovery file exceeds 100 KB.');
      const restored = await recoverReport(await file.text());
      if (sequence === recoverySequence.current) setReport(restored);
    } catch (e) { if (sequence === recoverySequence.current) setError(e instanceof Error ? e.message : 'Recovery failed.'); }
  }
  return <section className="mt-8 rounded-3xl border bg-white p-6" aria-labelledby="prepare-title">
    <h2 id="prepare-title" className="text-2xl font-semibold">Try a synthetic assessment</h2>
    <p className="mt-3">This local demonstration sends no intake or file to a server. Do not enter customer information. It creates no contract, payment rights or capacity reservation. Export files before leaving; this page does not store them.</p>
    <div className="mt-4 max-w-sm"><Label htmlFor="synthetic-usage">Synthetic monthly usage (kWh)</Label><Input id="synthetic-usage" type="number" min="1" max="100000" value={usage} onChange={e => setUsage(e.target.value)} /></div>
    <div className="mt-4 flex items-start gap-3"><Checkbox id="gap-scope" checked={accepted} onCheckedChange={v => setAccepted(v === true)} /><Label htmlFor="gap-scope">Prepare a measurement-gap-only demonstration; no buyer baseline is available.</Label></div>
    <Button className="mt-4" onClick={prepare}>Prepare synthetic report</Button>
    {error && <p role="alert" className="mt-3 text-red-800">{error}</p>}
    {report && <div className="mt-5"><pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-mist p-4 text-sm">{report}</pre><div className="mt-4 flex flex-wrap gap-3"><Button onClick={() => download(report, 'ohio-synthetic-report.md', 'text/markdown')}>Download report</Button><Button variant="outline" onClick={async () => download(JSON.stringify(await packReport(report)), 'ohio-report-recovery.json', 'application/json')}>Export recovery file</Button></div></div>}
    <div className="mt-6"><Label htmlFor="recovery-file">Recover an exported report (.json, maximum 100 KB)</Label><Input id="recovery-file" type="file" accept=".json,application/json" onChange={e => void restore(e.target.files?.[0])} /></div>
    <p className="mt-3 text-sm">Recovery checks file integrity and retains original content. It does not verify authorship, payment or buyer identity. Files may contain sensitive information if edited outside this demonstration; keep them private.</p>
  </section>;
}
