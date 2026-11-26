// Shared UI request construction; contains no identity, payment or registration authority.
export function initialReportBody(monthlyKwh: number, gapOnly: boolean) {
  if (!gapOnly || !Number.isFinite(monthlyKwh) || monthlyKwh < 1 || monthlyKwh > 100000) throw new Error('Confirm measurement-gap-only preparation and a bounded usage assumption.');
  return { expectedVersion: 0, input: { caseLabel: 'Synthetic registered-owner preparation', territory: 'ohio-edison' as const, monthlyKwh, baselineAvailable: false as const, measurementGapScopeAccepted: true as const } };
}
export async function prepareFirstSavedReport(id: string, monthlyKwh: number, gapOnly: boolean, transport: typeof fetch = fetch) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('Valid registered assessment reference required.');
  const body = initialReportBody(monthlyKwh, gapOnly);
  const response = await transport(`/api/broker-assessments/${encodeURIComponent(id)}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(response.status === 409 ? 'Report already exists or version changed. Load the original before retrying; it will not be overwritten.' : result.error || 'Unable to prepare.');
  return result;
}
