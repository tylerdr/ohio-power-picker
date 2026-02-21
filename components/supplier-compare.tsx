'use client';

import { useMemo, useState } from 'react';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';

const MIN_USAGE = 500;
const MAX_USAGE = 2000;
const DEFAULT_USAGE = 900;

const getRiskScore = (supplier: Supplier) => {
  let score = 1;
  if (supplier.rateType === 'variable') score += 2;
  if (supplier.introRateMonths && supplier.introRateMonths > 0) score += 1;
  if (supplier.earlyTerminationFee >= 100) score += 1;
  return Math.min(5, score);
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

  const maxTerm = useMemo(() => {
    const terms = selectedSuppliers.map((supplier) => supplier.termMonths);
    return Math.max(...terms, 12);
  }, [selectedSuppliers]);

  const toggleSupplier = (supplierId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, supplierId];
    });
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Compare Side by Side</p>
          <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            See how plans stack up for your usage
          </h3>
        </div>
        <div className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink/70">
          Select 2-3 suppliers
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-sea/10 bg-white p-4">
          <p className="text-xs uppercase text-ink/50">Pick suppliers</p>
          <div className="mt-3 grid gap-2">
            {suppliers.map((supplier) => {
              const isSelected = selectedIds.includes(supplier.id);
              const isDisabled = !isSelected && selectedIds.length >= 3;
              return (
                <label
                  key={supplier.id}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                    isSelected ? 'border-sea bg-sea/5 text-ink' : 'border-sea/10 bg-mist text-ink/70'
                  } ${isDisabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleSupplier(supplier.id)}
                      className="h-4 w-4 rounded border-sea/40 text-sea"
                    />
                    <span className="font-semibold text-ink">{supplier.name}</span>
                  </div>
                  <span className="text-xs text-ink/60">{formatRate(supplier.ratePerKwh)}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-sea/10 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase text-ink/50">Usage slider</p>
              <p className="text-sm text-ink/70">Adjust to match your monthly usage.</p>
            </div>
            <div className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink/70">
              {usage} kWh/month
            </div>
          </div>
          <input
            type="range"
            min={MIN_USAGE}
            max={MAX_USAGE}
            step={50}
            value={usage}
            onChange={(event) => setUsage(Number(event.target.value))}
            className="mt-4 w-full accent-sea"
          />

          {selectedSuppliers.length < 2 ? (
            <div className="mt-6 rounded-2xl bg-mist p-4 text-sm text-ink/70">
              Pick at least two suppliers to compare side by side.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {selectedSuppliers.map((supplier) => {
                const monthlyCost = supplier.ratePerKwh * usage;
                const savings = (priceToCompare - supplier.ratePerKwh) * usage;
                const savingsLabel = savings >= 0
                  ? `Save ${formatCurrency(savings)} / mo`
                  : `Pay ${formatCurrency(Math.abs(savings))} more / mo`;
                const rateWidth = Math.max(8, Math.round((supplier.ratePerKwh / maxRate) * 100));
                const termWidth = Math.max(8, Math.round((supplier.termMonths / maxTerm) * 100));
                const renewableWidth = Math.max(6, Math.round(supplier.renewablePercent));
                const riskScore = getRiskScore(supplier);

                return (
                  <article key={supplier.id} className="rounded-2xl border border-sea/10 bg-mist p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-ink">{supplier.name}</h4>
                        <p className="text-xs text-ink/60">{supplier.termMonths} months · {supplier.rateType} rate</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                        {formatRate(supplier.ratePerKwh)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase text-ink/50">Rate per kWh</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white">
                        <div className="h-2 rounded-full bg-sea" style={{ width: `${rateWidth}%` }} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase text-ink/50">Monthly estimate</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(monthlyCost)}</p>
                      <p className={`text-xs font-semibold ${savings >= 0 ? 'text-leaf' : 'text-danger'}`}>{savingsLabel}</p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase text-ink/50">Contract timeline</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white">
                        <div className="h-2 rounded-full bg-sky" style={{ width: `${termWidth}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-ink/60">{supplier.termMonths} months</p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase text-ink/50">Risk score</p>
                      <div className="mt-2 flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={`${supplier.id}-risk-${index}`}
                            className={`h-2 w-6 rounded-full ${index < riskScore ? 'bg-sun' : 'bg-white'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-ink/60">{riskScore} / 5</p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase text-ink/50">Green energy</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white">
                        <div className="h-2 rounded-full bg-leaf" style={{ width: `${renewableWidth}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-ink/60">{supplier.renewablePercent}% renewable</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-ink">
                      {supplier.earlyTerminationFee > 0 && (
                        <span className="rounded-full bg-white px-3 py-1">ETF ${supplier.earlyTerminationFee}</span>
                      )}
                      {supplier.introRateMonths && (
                        <span className="rounded-full bg-white px-3 py-1">Intro {supplier.introRateMonths} months</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
