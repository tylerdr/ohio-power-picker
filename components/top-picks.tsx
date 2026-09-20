'use client';

import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';
import { rateSnapshot } from '@/lib/rate-snapshot';
import { Button } from '@/components/ui/button';

const getRiskScore = (supplier: Supplier) => {
  let score = 1;
  if (supplier.rateType === 'variable') score += 2;
  if (supplier.introRateMonths && supplier.introRateMonths > 0) score += 1;
  if (supplier.earlyTerminationFee >= 100) score += 1;
  return Math.min(5, score);
};

const riskLabel = (score: number) => {
  if (score <= 1) return 'Lower contract risk';
  if (score <= 2) return 'Lower contract risk';
  if (score <= 3) return 'Moderate contract risk';
  if (score <= 4) return 'Higher contract risk';
  return 'Higher contract risk';
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

const pickLabels = ['Snapshot screen', 'Fixed-rate screen', 'Lowest stored rate'];

const buildWhy = (supplier: Supplier, yearlyDifference: number) => {
  const differenceText = yearlyDifference > 0
    ? `${formatCurrency(yearlyDifference)}/year below the stored utility benchmark at the selected usage`
    : 'Not below the stored utility benchmark at the selected usage';

  if (supplier.rateType === 'fixed' && supplier.renewablePercent >= 50) {
    return `${differenceText}. Stored terms show a fixed rate with ${supplier.renewablePercent}% renewable content.`;
  }
  if (supplier.rateType === 'fixed' && supplier.earlyTerminationFee === 0) {
    return `${differenceText}. Stored terms show a fixed rate and no early termination fee.`;
  }
  if (supplier.rateType === 'fixed') {
    return `${differenceText}. Stored terms show a fixed rate; verify the current disclosure and renewal terms.`;
  }
  if (supplier.rateType === 'variable') {
    return `${differenceText}. Stored terms show a variable rate, which can change; verify the current price and formula before enrolling.`;
  }
  return `${differenceText}. Stored term: ${supplier.termMonths} months.`;
};

function selectSnapshotPicks(suppliers: Supplier[], priceToCompare: number, estimatedKwh: number) {
  const withDifferences = suppliers.map((supplier) => ({
    supplier,
    yearlyDifference: (priceToCompare - supplier.ratePerKwh) * estimatedKwh * 12,
    riskScore: getRiskScore(supplier)
  }));

  const screened = [...withDifferences]
    .sort((a, b) => {
      const scoreA = a.yearlyDifference - a.riskScore * 40;
      const scoreB = b.yearlyDifference - b.riskScore * 40;
      return scoreB - scoreA;
    })[0];

  const fixed = [...withDifferences]
    .filter((item) => item.supplier.rateType === 'fixed' && item.supplier.id !== screened?.supplier.id)
    .sort((a, b) => b.yearlyDifference - a.yearlyDifference)[0];

  const usedIds = new Set([screened?.supplier.id, fixed?.supplier.id]);
  const lowestStoredRate = [...withDifferences]
    .filter((item) => !usedIds.has(item.supplier.id))
    .sort((a, b) => a.supplier.ratePerKwh - b.supplier.ratePerKwh)[0];

  return [screened, fixed, lowestStoredRate].filter(Boolean);
}

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
  estimatedKwh: number;
  utility?: string;
};

export default function TopPicks({ suppliers, priceToCompare, estimatedKwh }: Props) {
  const picks = selectSnapshotPicks(suppliers, priceToCompare, estimatedKwh);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Snapshot Screening</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Three plans worth re-checking
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Based on {estimatedKwh.toLocaleString()} kWh/month, supplier data scraped {rateSnapshot.supplierOffersLabel}, and a stored utility benchmark. These are not live offers or enrollment recommendations.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {picks.map((pick, index) => {
          const { supplier, yearlyDifference, riskScore } = pick;
          const monthlySupplyCost = supplier.ratePerKwh * estimatedKwh;
          const differencePositive = yearlyDifference >= 0;

          return (
            <article
              key={supplier.id}
              className={`relative rounded-3xl border border-white/60 border-l-4 ${accents[index]} bg-white/80 p-6 shadow-card backdrop-blur`}
            >
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

              <div className="mt-5 flex items-end gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Stored rate</p>
                  <p className="text-2xl font-bold text-ink">{formatRate(supplier.ratePerKwh)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Supply-only / mo</p>
                  <p className="text-xl font-bold text-ink">{formatCurrency(monthlySupplyCost)}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] uppercase tracking-wider text-ink/40">Stored annual diff.</p>
                  <p className={`text-xl font-bold ${differencePositive ? 'text-leaf' : 'text-danger'}`}>
                    {differencePositive ? `-${formatCurrency(yearlyDifference)}` : `+${formatCurrency(Math.abs(yearlyDifference))}`}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink/60">
                {buildWhy(supplier, yearlyDifference)}
              </p>

              {supplier.earlyTerminationFee > 0 && (
                <p className="mt-2 text-xs text-ink/40">
                  Stored early termination fee: ${supplier.earlyTerminationFee}
                </p>
              )}

              <Button asChild className="mt-5 w-full rounded-full bg-sea text-white hover:bg-leaf">
                <a href={rateSnapshot.sourceUrl} target="_blank" rel="noreferrer">
                  Verify current offer at PUCO
                </a>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
