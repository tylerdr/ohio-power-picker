import fixture from './fixture.json';
import { assess } from './compare.mjs';

export const scenarioOptions = [
  { id: 'seasonal', label: 'Seasonal usage', explanation: 'Compare fixed, scheduled and variable scenarios across 10,300 fictional kWh.' },
  { id: 'fees', label: 'When fees outweigh rates', explanation: 'Raise Harbor’s fictional monthly fee to $100: its lower energy rate now loses to staying.' },
  { id: 'renewal', label: 'Unknown renewal', explanation: 'Remove Meadow’s months 4–12 rate. The full-year comparison is now incomplete.' },
  { id: 'tie', label: 'Exact break-even', explanation: 'At 600 fictional kWh each month, Harbor ties the incumbent after monthly and exit fees.' },
] as const;
export type ScenarioId = typeof scenarioOptions[number]['id'];
export function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === 'string' && scenarioOptions.some(x => x.id === value);
}
export function comparisonScenario(id: ScenarioId) {
  const input = structuredClone(fixture);
  input.caseId = `fictional-${id}`;
  if (id === 'fees') input.plans[0].monthlyFeeCents = 10000;
  if (id === 'renewal') input.plans[1].rateSchedule!.pop();
  if (id === 'tie') { input.usageKwh = Array(12).fill(600); input.plans = [input.plans[0]]; }
  return assess(input);
}
