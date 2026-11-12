import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/fictional-comparison/compare.mjs';
import { comparisonScenario, isScenarioId, scenarioOptions } from '@/lib/fictional-comparison/scenarios';

export const metadata: Metadata = {
  title: 'Fictional electricity comparison lab',
  description: 'A free fictional exercise showing how rates, monthly fees and contract terms affect supply costs.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Fictional electricity comparison lab',
    description: 'Free fictional scenarios for understanding supply costs, fees and contract terms. No current offers or savings claims.',
  },
  twitter: {
    title: 'Fictional electricity comparison lab',
    description: 'Free fictional scenarios for understanding supply costs, fees and contract terms. No current offers or savings claims.',
  },
};

export default function ComparisonLab({ searchParams }: { searchParams?: { scenario?: string | string[] } }) {
  const selection = searchParams?.scenario;
  const id = isScenarioId(selection) ? selection : 'seasonal';
  const result = comparisonScenario(id);
  const scenario = scenarioOptions.find(x => x.id === id)!;
  const ledger = [
    { id: 'baseline', name: 'Stay with fictional incumbent', months: result.baseline.months },
    ...result.results.flatMap(x => x.status === 'comparable' ? [{ id: x.id, name: x.name, months: x.months }]
      : x.status === 'scenario-only' ? [{ id: `${x.id}-low`, name: `${x.name}: low scenario`, months: x.lowCost.months }, { id: `${x.id}-high`, name: `${x.name}: high scenario`, months: x.highCost.months }] : []),
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-ink">
      <Button asChild variant="outline"><Link href="/about">Back to About</Link></Button>
      <header className="space-y-4">
        <p className="font-semibold text-sea">Free fictional comparison lab</p>
        <h1 className="text-3xl font-semibold md:text-4xl">See what changes the cost of a plan.</h1>
        <p className="rounded-2xl border border-sea/20 bg-mist p-4" role="note">
          All tariffs and usage below are fictional. This exercise provides no current offer, enrollment, brokerage service or achievable-savings claim. It does not take bills, payments or customer details.
        </p>
        <p>Choose an example to inspect the assumptions and reproduce every monthly supply charge.</p>
      </header>
      <nav aria-label="Fictional comparison examples" className="flex flex-wrap gap-3">
        {scenarioOptions.map(x => <Button key={x.id} asChild variant={x.id === id ? 'default' : 'outline'}><Link href={`/comparison-lab?scenario=${x.id}`} aria-current={x.id === id ? 'page' : undefined}>{x.label}</Link></Button>)}
      </nav>
      <section aria-labelledby="scenario-title" className="space-y-4">
        <h2 id="scenario-title" className="text-2xl font-semibold">{scenario.label}</h2>
        {selection !== undefined && !isScenarioId(selection) ? <p>Unknown example; showing seasonal usage.</p> : null}
        <p>{scenario.explanation}</p>
        <p>{result.horizonMonths} fictional months · {result.totalKwh.toLocaleString('en-US')} kWh · USD · supply costs only</p>
        <p>Lowest fully modeled cost, including staying: <strong>{result.lowestModeledKnownCostIds.map(planId => planId === 'baseline' ? 'Stay with fictional incumbent' : result.results.find(x => x.id === planId)!.name).join(' and ')}</strong>.</p>
        <p>Positive differences mean lower modeled costs than staying; negative differences mean higher costs. Variable scenarios stay out of this ranking.</p>
        <div className="overflow-x-auto rounded-2xl border border-sea/20" tabIndex={0} role="region" aria-label="Comparison table; scroll horizontally on narrow screens">
          <table className="w-full min-w-[800px] text-left text-sm">
            <caption className="p-4 text-left font-semibold">Fictional cost comparison — includes monthly fees and one incumbent exit fee when switching</caption>
            <thead className="bg-mist"><tr>{['Option', 'Modeled cost', 'Difference vs stay', 'First / sustained crossing month', 'Months left at horizon', 'Uncharged exit exposure'].map(h => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              <tr className="border-t border-sea/20"><th scope="row" className="p-3">Stay with fictional incumbent</th><td className="p-3">{money(result.baseline.totalCents)}</td><td className="p-3">$0.00</td><td className="p-3">n/a</td><td className="p-3">{result.baseline.remainingTermMonths}</td><td className="p-3">{money(result.baseline.exitFeeExposureCents)}</td></tr>
              {result.results.map(x => <tr key={x.id} className="border-t border-sea/20">
                <th scope="row" className="p-3">{x.name}</th>
                <td className="p-3">{x.status === 'comparable' ? money(x.totalCents) : x.status === 'scenario-only' ? `${money(x.lowCost.totalCents)} to ${money(x.highCost.totalCents)} (unranked scenarios)` : x.status === 'incomplete' ? 'Incomplete — renewal unknown' : 'Excluded — eligibility unverified'}</td>
                <td className="p-3">{x.status === 'comparable' ? money(x.modeledDifferenceCents) : x.status === 'scenario-only' ? `${money(x.highCost.modeledDifferenceCents)} to ${money(x.lowCost.modeledDifferenceCents)}` : 'Unknown'}</td>
                <td className="p-3">{x.status === 'comparable' ? `${x.firstNonnegativeMonth ?? 'never'} / ${x.sustainedNonnegativeMonth ?? 'never'}` : 'n/a'}</td>
                <td className="p-3">{x.remainingTermMonths}</td><td className="p-3">{money(x.exitFeeExposureCents)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="text-sm">Crossing is the first month cumulative modeled difference reaches zero or above; sustained crossing stays nonnegative through the horizon. No second switch is modeled. Contract exposure after the horizon is disclosed separately.</p>
        <Button asChild><a href={`/comparison-lab/report?scenario=${id}`} download>Download this fictional report</a></Button>
      </section>
      <section aria-labelledby="assumptions-title" className="space-y-3">
        <h2 id="assumptions-title" className="text-2xl font-semibold">Assumptions and exclusions</h2>
        <ul className="list-disc space-y-2 pl-6">{result.limitations.map(line => <li key={line}>{line}</li>)}</ul>
      </section>
      <section aria-labelledby="ledger-title" className="space-y-4">
        <h2 id="ledger-title" className="text-2xl font-semibold">Reproduce the monthly charges</h2>
        {ledger.map(option => <section key={option.id} className="rounded-2xl border border-sea/20 p-4" aria-labelledby={`ledger-${option.id}`}>
          <h3 id={`ledger-${option.id}`} className="font-semibold">{option.name} — monthly ledger</h3>
          <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label={`${option.name} ledger; scroll horizontally on narrow screens`}>
            <table className="w-full min-w-[650px] text-left text-sm">
              <caption className="sr-only">{option.name} monthly fictional supply charges</caption>
              <thead><tr>{['Month', 'kWh', 'USD/kWh', 'Energy', 'Monthly fee', 'Incumbent exit fee', 'Total'].map(h => <th key={h} scope="col" className="p-2">{h}</th>)}</tr></thead>
              <tbody>{option.months.map(m => <tr key={m.month} className="border-t border-sea/20"><th scope="row" className="p-2">{m.month}</th><td className="p-2">{m.kwh}</td><td className="p-2">{(m.rateMicroUsdPerKwh / 1000000).toFixed(6)}</td><td className="p-2">{money(m.energyCents)}</td><td className="p-2">{money(m.monthlyFeeCents)}</td><td className="p-2">{money(m.incumbentExitFeeCents)}</td><td className="p-2">{money(m.totalCents)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>)}
      </section>
    </main>
  );
}
