import Link from 'next/link';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';

const getRiskScore = (supplier: Supplier) => {
  let score = 1;
  if (supplier.rateType === 'variable') score += 2;
  if (supplier.introRateMonths && supplier.introRateMonths > 0) score += 1;
  if (supplier.earlyTerminationFee >= 100) score += 1;
  return Math.min(5, score);
};

const riskLabel = (score: number) => {
  if (score <= 1) return 'Very Low';
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Moderate';
  if (score <= 4) return 'High';
  return 'Very High';
};

const riskTone = (score: number) => {
  if (score <= 2) return 'bg-leaf/10 text-leaf';
  if (score <= 3) return 'bg-sun/30 text-ink';
  return 'bg-danger/10 text-danger';
};

const accents = [
  'border-leaf/60 from-leaf/15 via-white to-white',
  'border-sea/40 from-sky/60 via-white to-white',
  'border-sun/70 from-sun/25 via-white to-white'
];

const buildWhy = (supplier: Supplier, yearlySavings: number) => {
  const savingsText = yearlySavings > 0
    ? `${formatCurrency(yearlySavings)} est. yearly savings`
    : 'a competitive rate compared to other offers';

  if (supplier.rateType === 'fixed' && supplier.renewablePercent >= 50) {
    return `Fixed rate with ${supplier.renewablePercent}% renewable energy and ${savingsText}.`;
  }

  if (supplier.rateType === 'fixed') {
    return `Fixed rate for stability with ${savingsText}.`;
  }

  if (supplier.rateType === 'variable') {
    return 'Lowest starting rate, but variable pricing means higher risk.';
  }

  return `${supplier.termMonths}-month term with ${savingsText}.`;
};

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
  estimatedKwh: number;
};

export default function TopPicks({ suppliers, priceToCompare, estimatedKwh }: Props) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Top 3 Picks</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            The best options for your home
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Estimated with {estimatedKwh.toLocaleString()} kWh/month and your utility rate.
          </p>
        </div>
        <div className="rounded-full bg-leaf/10 px-4 py-2 text-xs font-semibold text-ink">
          Top picks update as you adjust your usage
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {suppliers.slice(0, 3).map((supplier, index) => {
          const monthlyCost = supplier.ratePerKwh * estimatedKwh;
          const yearlySavings = (priceToCompare - supplier.ratePerKwh) * estimatedKwh * 12;
          const savingsPositive = yearlySavings >= 0;
          const riskScore = getRiskScore(supplier);
          const accent = accents[index % accents.length];

          return (
            <article
              key={supplier.id}
              className={`relative overflow-hidden rounded-3xl border border-white/60 border-l-4 bg-gradient-to-br ${accent} p-6 shadow-card`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Pick #{index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                    {supplier.name}
                  </h3>
                  <p className="mt-1 text-xs text-ink/60">
                    {supplier.termMonths} mo | {supplier.rateType} | {supplier.renewablePercent}% renewable
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone(riskScore)}`}>
                  Risk: {riskLabel(riskScore)}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs uppercase text-ink/40">Rate</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{formatRate(supplier.ratePerKwh)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs uppercase text-ink/40">Est. Monthly</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(monthlyCost)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs uppercase text-ink/40">Yearly Savings</p>
                    <p className={`mt-2 text-2xl font-semibold ${savingsPositive ? 'text-leaf' : 'text-danger'}`}>
                      {savingsPositive ? formatCurrency(yearlySavings) : `-${formatCurrency(Math.abs(yearlySavings))}`}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-ink/70">
                  {buildWhy(supplier, yearlySavings)}
                </p>
              </div>

              <Link
                href={supplier.website}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-sea"
              >
                View Plan
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
