'use client';

import { useMemo, useState } from 'react';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';

const MIN_USAGE = 500;
const MAX_USAGE = 2000;
const DEFAULT_USAGE = 900;

const pluralize = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

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

const riskColor = (score: number) => {
  if (score <= 2) return 'bg-leaf';
  if (score <= 3) return 'bg-sun';
  return 'bg-danger';
};

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
};

export default function SupplierCompare({ suppliers, priceToCompare }: Props) {
  const defaultSelection = useMemo(() => {
    return [...suppliers]
      .sort((a, b) => a.ratePerKwh - b.ratePerKwh)
      .slice(0, 2)
      .map((supplier) => supplier.id);
  }, [suppliers]);

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelection);
  const [usage, setUsage] = useState(DEFAULT_USAGE);

  const selectedSuppliers = useMemo(
    () => suppliers.filter((supplier) => selectedIds.includes(supplier.id)),
    [selectedIds, suppliers]
  );

  const maxRate = useMemo(() => {
    const rates = selectedSuppliers.map((supplier) => supplier.ratePerKwh);
    return Math.max(priceToCompare, ...rates, 0.01);
  }, [selectedSuppliers, priceToCompare]);

  const toggleSupplier = (supplierId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, supplierId];
    });
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Compare Side by Side</p>
          <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            See how plans stack up
          </h3>
        </div>
        <div className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink/70">
          Select 2-3 suppliers
        </div>
      </div>

      {/* Supplier Picker — compact horizontal scroll on mobile, scrollable list on desktop */}
      <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-sea/10 bg-white p-3">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {suppliers.map((supplier) => {
            const isSelected = selectedIds.includes(supplier.id);
            const isDisabled = !isSelected && selectedIds.length >= 3;
            return (
              <label
                key={supplier.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  isSelected ? 'bg-sea/10 ring-1 ring-sea' : 'hover:bg-mist'
                } ${isDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggleSupplier(supplier.id)}
                  className="h-3.5 w-3.5 rounded border-sea/40 text-sea"
                />
                <span className="truncate font-medium text-ink">{supplier.name}</span>
                <span className="ml-auto shrink-0 text-xs text-ink/50">{formatRate(supplier.ratePerKwh)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Usage Slider */}
      <div className="mt-4 rounded-2xl border border-sea/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/70">Monthly usage</p>
          <span className="rounded-full bg-leaf/15 px-3 py-1 text-sm font-bold text-ink">{usage.toLocaleString()} kWh</span>
        </div>
        <input
          type="range"
          min={MIN_USAGE}
          max={MAX_USAGE}
          step={50}
          value={usage}
          onChange={(event) => setUsage(Number(event.target.value))}
          className="mt-3 w-full accent-sea"
        />
        <div className="mt-1 flex justify-between text-[11px] text-ink/40">
          <span>500</span>
          <span>1,000</span>
          <span>1,500</span>
          <span>2,000</span>
        </div>
      </div>

      {/* Comparison Cards */}
      {selectedSuppliers.length < 2 ? (
        <div className="mt-4 rounded-2xl bg-mist p-5 text-center text-sm text-ink/60">
          Pick at least two suppliers above to compare side by side.
        </div>
      ) : (
        <div className={`mt-4 grid gap-4 ${selectedSuppliers.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {selectedSuppliers.map((supplier) => {
            const monthlyCost = supplier.ratePerKwh * usage;
            const savings = (priceToCompare - supplier.ratePerKwh) * usage;
            const rateWidth = Math.max(10, Math.round((supplier.ratePerKwh / maxRate) * 100));
            const riskScore = getRiskScore(supplier);

            return (
              <article key={supplier.id} className="rounded-2xl border border-sea/10 bg-gradient-to-b from-white to-mist/50 p-5">
                {/* Header */}
                <div className="mb-4 border-b border-sea/10 pb-4">
                  <h4 className="text-lg font-bold text-ink leading-tight">{supplier.name}</h4>
                  <p className="mt-1 text-xs text-ink/50">
                    {supplier.termMonths === 0 ? 'Default rate' : `${pluralize(supplier.termMonths, 'month')} · ${supplier.rateType}`}
                  </p>
                </div>

                {/* Rate */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-ink">{formatRate(supplier.ratePerKwh)}</p>
                    <p className="text-xs text-ink/50">per kWh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-ink">{formatCurrency(monthlyCost)}</p>
                    <p className="text-xs text-ink/50">est/month</p>
                  </div>
                </div>

                {/* Savings badge */}
                <div className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-bold ${
                  savings >= 0 ? 'bg-leaf/10 text-leaf' : 'bg-danger/10 text-danger'
                }`}>
                  {savings >= 0
                    ? `Save ${formatCurrency(savings)}/mo vs default`
                    : `${formatCurrency(Math.abs(savings))}/mo more than default`}
                </div>

                {/* Rate bar */}
                <div className="mt-4">
                  <div className="h-2.5 w-full rounded-full bg-sea/10">
                    <div className="h-2.5 rounded-full bg-sea transition-all" style={{ width: `${rateWidth}%` }} />
                  </div>
                </div>

                {/* Details grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-2.5">
                    <p className="text-ink/40 uppercase">Risk</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-1.5 w-3 rounded-full ${i < riskScore ? riskColor(riskScore) : 'bg-sea/10'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-ink">{riskLabel(riskScore)}</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-2.5">
                    <p className="text-ink/40 uppercase">Green</p>
                    <p className="mt-1 font-semibold text-ink">{supplier.renewablePercent}% renewable</p>
                  </div>
                  {supplier.earlyTerminationFee > 0 && (
                    <div className="rounded-xl bg-sun/10 p-2.5">
                      <p className="text-ink/40 uppercase">ETF</p>
                      <p className="mt-1 font-semibold text-ink">${supplier.earlyTerminationFee}</p>
                    </div>
                  )}
                  {supplier.introRateMonths && (
                    <div className="rounded-xl bg-sun/10 p-2.5">
                      <p className="text-ink/40 uppercase">Intro period</p>
                      <p className="mt-1 font-semibold text-ink">{pluralize(supplier.introRateMonths, 'month')}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
