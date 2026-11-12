export type Month = { month: number; kwh: number; rateMicroUsdPerKwh: number; energyCents: number; monthlyFeeCents: number; incumbentExitFeeCents: number; totalCents: number };
export type Cost = { totalCents: number; modeledDifferenceCents: number; firstNonnegativeMonth: number | null; sustainedNonnegativeMonth: number | null; cumulativeDifferenceCents: number[]; months: Month[] };
export type PlanIdentity = { id: string; name: string; termMonths: number; remainingTermMonths: number; exitFeeExposureCents: number };
export type Result = PlanIdentity & (
  | ({ status: 'comparable' } & Cost)
  | { status: 'scenario-only'; lowCost: Cost; highCost: Cost; reason: string }
  | { status: 'excluded' | 'incomplete'; reason: string }
);
export type Assessment = {
  schema: 'fictional-tariff-assessment.1'; fictional: true; caseId: string; horizonMonths: number; totalKwh: number;
  baseline: { id: string; termMonths: number; remainingTermMonths: number; totalCents: number; months: Month[]; exitFeeExposureCents: number };
  results: Result[]; lowestModeledKnownCostIds: string[]; limitations: string[];
};
export function validate(input: unknown): void;
export function assess(input: unknown): Assessment;
export function money(cents: number): string;
export function renderReport(result: Assessment): string;
