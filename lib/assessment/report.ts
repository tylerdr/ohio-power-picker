export type Intake = { caseLabel: string; territory: 'ohio-edison'; monthlyKwh: number; baselineAvailable: boolean; measurementGapScopeAccepted: boolean };
export type Packet = { schema: 'ohio-assessment-recovery.1'; report: string; sha256: string };
export const observations = [
  { url: 'https://www.ravennaoh.gov/departments/utilities/electricity/', date: '2026-10-22', text: 'Municipal page publishes fixed $0.09740/kWh, May 2026–May 2028 meter reads. Program-specific; eligibility and complete contract unknown.' },
  { url: 'https://www.energychoice.ohio.gov/ApplestoApples.aspx', date: '2026-10-22', text: 'PUCO describes offers as changeable supplier-reported snapshots and requires careful review of contract terms. This observation supplies no current supplier offer.' },
] as const;

export function prepareReport(input: Intake): string {
  if (!input || input.territory !== 'ohio-edison' || typeof input.caseLabel !== 'string' || !input.caseLabel.trim() || input.caseLabel.length > 80 || !Number.isFinite(input.monthlyKwh) || input.monthlyKwh < 1 || input.monthlyKwh > 100000 || typeof input.baselineAvailable !== 'boolean' || typeof input.measurementGapScopeAccepted !== 'boolean') throw new Error('Invalid bounded intake.');
  // This preparer does not ingest buyer evidence and cannot assert a verified baseline.
  if (input.baselineAvailable) throw new Error('Buyer baseline verification is not implemented; do not substitute counts.');
  if (!input.measurementGapScopeAccepted) throw new Error('Confirm measurement-gap-only scope before preparing this report.');
  return [
    '# Ohio comparison evidence assessment',
    'SYNTHETIC CASE / PREPARATION ONLY — not a paid report, tariff recommendation, buyer acceptance or reserved delivery slot.',
    `Case: ${input.caseLabel.trim()}`,
    'Territory: Ohio Edison; one journey; reporting period: not supplied.',
    `Synthetic usage assumption: ${input.monthlyKwh} kWh/month. No customer bill or records supplied.`,
    '', '# Decision',
    'Do not activate automated current-rate comparison or referrals. Only a measurement-gap assessment is supported. The local scope checkbox records preparation intent, not a signed customer contract.',
    '', '# Dated source and contract comparison',
    ...observations.map(x => `${x.date} | ${x.url}\n${x.text}`),
    'Archive: suppliers.json at 44307beecc43721a2c9638f0fc432eccf789344b, row american-power-gas-of-ohio-llc-variable-0.0699-1; scraped 2026-03-15; variable $0.0699/kWh, one month. Not current.',
    `Supply-only illustration: municipal reference $${(input.monthlyKwh * .0974).toFixed(2)} versus archive $${(input.monthlyKwh * .0699).toFixed(2)}. Different dates/terms; no achievable savings or annual projection.`,
    'Contract gaps: actual delivery-date price, eligibility, complete supplier contract, renewal terms, fees and permitted maintenance/reuse method are unverified. No tariff or contract PDF has been supplied.',
    '', '# Measurement and next decision',
    'Sessions, comparisons, outbound clicks, enrollments, accepted payouts: UNKNOWN. Period, denominators, exclusions and reconciliation: NOT PROVIDED. No synthetic conversion denominator substituted.',
    'Next: buyer confirms measurement-gap-only scope or stop pilot; obtain current source/terms and aggregate evidence before changing recommendation.',
    'Acceptance question: Can the team identify what supports a decision, what is stale and which missing input would change the recommendation?',
    '', '# Commercial and recovery boundary',
    'Proposed $500 once; eight-hour ceiling; one pilot. No capacity or payment accepted by this preparation tool. No customer contact, enrollment or automatic submission.',
    'Exported recovery file retains these original report bytes. SHA-256 detects accidental corruption, not authenticity or paid entitlement. Keep files private; no server custody or staffed recovery is established.',
  ].join('\n\n');
}
async function digest(report: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(report));
  return Array.from(new Uint8Array(hash), x => x.toString(16).padStart(2, '0')).join('');
}
export async function packReport(report: string): Promise<Packet> {
  return { schema: 'ohio-assessment-recovery.1', report, sha256: await digest(report) };
}
export async function recoverReport(raw: string): Promise<string> {
  if (raw.length > 100000) throw new Error('Recovery file exceeds 100 KB.');
  const p = JSON.parse(raw) as Packet;
  if (p.schema !== 'ohio-assessment-recovery.1' || typeof p.report !== 'string' || typeof p.sha256 !== 'string' || p.sha256 !== await digest(p.report)) throw new Error('Invalid or corrupted recovery file.');
  return p.report;
}
