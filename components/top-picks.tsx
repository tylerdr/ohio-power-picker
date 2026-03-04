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
  'border-l-leaf',
  'border-l-sea',
  'border-l-sun'
];

const pickLabels = ['🏆 Best Overall', '🔒 Best Fixed Rate', '💰 Lowest Price'];

const buildWhy = (supplier: Supplier, yearlySavings: number) => {
  const savingsText = yearlySavings > 0
    ? `Save ~${formatCurrency(yearlySavings)}/year`
    : 'Competitive rate';

  if (supplier.rateType === 'fixed' && supplier.renewablePercent >= 50) {
    return `${savingsText}. Fixed rate with ${supplier.renewablePercent}% renewable energy.`;
  }
  if (supplier.rateType === 'fixed' && supplier.earlyTerminationFee === 0) {
    return `${savingsText}. Fixed rate with no early termination fee — cancel anytime.`;
  }
  if (supplier.rateType === 'fixed') {
    return `${savingsText}. Predictable fixed rate — your bill won't surprise you.`;
  }
  if (supplier.rateType === 'variable') {
    return `${savingsText}. ⚠️ Variable rate — can spike in summer/winter. Best for short-term savings.`;
  }
  return `${savingsText}. ${supplier.termMonths}-month term.`;
};

/** Pick 3 diverse top picks: best overall (fixed+savings), best fixed, lowest price */
function selectTopPicks(suppliers: Supplier[], priceToCompare: number, estimatedKwh: number) {
  const withSavings = suppliers.map((s) => ({
    supplier: s,
    yearlySavings: (priceToCompare - s.ratePerKwh) * estimatedKwh * 12,
    riskScore: getRiskScore(s)
  }));

  // Best overall: highest savings with lowest risk (weighted score)
  const bestOverall = [...withSavings]
    .sort((a, b) => {
      const scoreA = a.yearlySavings - a.riskScore * 40;
      const scoreB = b.yearlySavings - b.riskScore * 40;
      return scoreB - scoreA;
    })[0];

  // Best fixed: highest savings among fixed-rate plans
  const bestFixed = [...withSavings]
    .filter((s) => s.supplier.rateType === 'fixed' && s.supplier.id !== bestOverall?.supplier.id)
    .sort((a, b) => b.yearlySavings - a.yearlySavings)[0];

  // Lowest price: cheapest rate regardless of type (different from above picks)
  const usedIds = new Set([bestOverall?.supplier.id, bestFixed?.supplier.id]);
  const lowestPrice = [...withSavings]
    .filter((s) => !usedIds.has(s.supplier.id))
    .sort((a, b) => a.supplier.ratePerKwh - b.supplier.ratePerKwh)[0];

  return [bestOverall, bestFixed, lowestPrice].filter(Boolean);
}

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
  estimatedKwh: number;
};

export default function TopPicks({ suppliers, priceToCompare, estimatedKwh }: Props) {
  const picks = selectTopPicks(suppliers, priceToCompare, estimatedKwh);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Top 3 Picks</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            The best options for your home
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Based on {estimatedKwh.toLocaleString()} kWh/month usage.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {picks.map((pick, index) => {
          const { supplier, yearlySavings, riskScore } = pick;
          const monthlyCost = supplier.ratePerKwh * estimatedKwh;
          const savingsPositive = yearlySavings >= 0;

          return (
            <article
              key={supplier.id}
              className={`relative rounded-3xl border border-white/60 border-l-4 ${accents[index]} bg-white/80 p-6 shadow-card backdrop-blur`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-sea">{pickLabels[index]}</p>
                  <h3 className="mt-1.5 text-lg font-bold leading-tight text-ink">
                    {supplier.name}
                  </h3>
                  <p className="mt-1 text-xs text-ink/50">
                    {supplier.termMonths === 1 ? '1 month' : `${supplier.termMonths} months`} · {supplier.rateType} · {supplier.renewablePercent}% green
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${riskTone(riskScore)}`}>
                  {riskLabel(riskScore)}
                </span>
              </div>

              {/* Key metrics */}
              <div className="mt-5 flex items-end gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Rate</p>
                  <p className="text-2xl font-bold text-ink">{formatRate(supplier.ratePerKwh)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Monthly</p>
                  <p className="text-xl font-bold text-ink">{formatCurrency(monthlyCost)}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Yearly</p>
                  <p className={`text-xl font-bold ${savingsPositive ? 'text-leaf' : 'text-danger'}`}>
                    {savingsPositive ? `+${formatCurrency(yearlySavings)}` : `-${formatCurrency(Math.abs(yearlySavings))}`}
                  </p>
                </div>
              </div>

              {/* Why this pick */}
              <p className="mt-4 text-sm leading-relaxed text-ink/60">
                {buildWhy(supplier, yearlySavings)}
              </p>

              {/* ETF warning if applicable */}
              {supplier.earlyTerminationFee > 0 && (
                <p className="mt-2 text-xs text-ink/40">
                  Early termination fee: ${supplier.earlyTerminationFee}
                </p>
              )}

              {/* CTA */}
              <Link
                href={supplier.website}
                target="_blank"
                rel="nofollow sponsored noreferrer"
                data-supplier={supplier.id}
                data-action="switch_supplier"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-sea py-3 text-sm font-bold text-white transition hover:bg-leaf"
              >
                Switch to This Supplier
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
