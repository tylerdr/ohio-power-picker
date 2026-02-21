'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
  estimatedKwh?: number;
  initialShowAll?: boolean;
};

const getYearlySavings = (priceToCompare: number, supplier: Supplier, kwh: number) =>
  (priceToCompare - supplier.ratePerKwh) * kwh * 12;

const getSavingsLabel = (value: number) =>
  value >= 0 ? `Save ${formatCurrency(value)}/yr` : `+${formatCurrency(Math.abs(value))}/yr`;

type SortKey = 'savings' | 'rate' | 'term' | 'type';

const INITIAL_SHOW = 8;

export default function SupplierTable({ suppliers, priceToCompare, estimatedKwh = 900, initialShowAll = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('savings');
  const [showAll, setShowAll] = useState(initialShowAll);

  const sortLabel = useMemo(() => {
    switch (sortKey) {
      case 'rate':
        return 'Sorted by lowest rate.';
      case 'term':
        return 'Sorted by shortest term.';
      case 'type':
        return 'Sorted by rate type.';
      case 'savings':
      default:
        return 'Sorted by estimated yearly savings.';
    }
  }, [sortKey]);

  const sortedSuppliers = useMemo(() => {
    const withSavings = suppliers.map((supplier) => ({
      supplier,
      yearlySavings: getYearlySavings(priceToCompare, supplier, estimatedKwh)
    }));

    const sorted = [...withSavings].sort((a, b) => {
      switch (sortKey) {
        case 'rate':
          return a.supplier.ratePerKwh - b.supplier.ratePerKwh;
        case 'term':
          return a.supplier.termMonths - b.supplier.termMonths;
        case 'type':
          return a.supplier.rateType.localeCompare(b.supplier.rateType);
        case 'savings':
        default:
          return b.yearlySavings - a.yearlySavings;
      }
    });

    return sorted.map((item) => item.supplier);
  }, [suppliers, priceToCompare, sortKey, estimatedKwh]);

  const visibleSuppliers = showAll ? sortedSuppliers : sortedSuppliers.slice(0, INITIAL_SHOW);
  const hasMore = sortedSuppliers.length > INITIAL_SHOW;

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Supplier Comparison
          </h3>
          <p className="text-sm text-ink/70">{sortLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink/60">
          <span>Usage: {estimatedKwh.toLocaleString()} kWh/month</span>
          <label className="flex items-center gap-2 text-xs text-ink/70">
            Sort by
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded-full border border-sea/20 bg-white px-3 py-1 text-xs text-ink"
            >
              <option value="savings">Savings</option>
              <option value="rate">Rate</option>
              <option value="term">Term length</option>
              <option value="type">Rate type</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {visibleSuppliers.map((supplier) => {
          const yearlySavings = getYearlySavings(priceToCompare, supplier, estimatedKwh);
          const isSaving = yearlySavings >= 0;

          return (
            <article key={supplier.id} className="rounded-2xl border border-sea/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-ink">{supplier.name}</h4>
                  <p className="text-xs text-ink/60">{supplier.termMonths} months · {supplier.rateType} · {supplier.renewablePercent}% renewable</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSaving ? 'bg-leaf/10 text-leaf' : 'bg-danger/10 text-danger'}`}>
                  {getSavingsLabel(yearlySavings)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{formatRate(supplier.ratePerKwh)}</span>
                <span className="text-xs text-ink/60">ETF ${supplier.earlyTerminationFee}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {supplier.rateType === 'variable' && (
                  <span className="rounded-full bg-sun/40 px-3 py-1 text-[11px] font-semibold text-ink">Variable rate</span>
                )}
                {supplier.earlyTerminationFee > 0 && (
                  <span className="rounded-full bg-sun/20 px-3 py-1 text-[11px] font-semibold text-ink">Early termination fee</span>
                )}
                {supplier.introRateMonths && (
                  <span className="rounded-full bg-sun/20 px-3 py-1 text-[11px] font-semibold text-ink">Intro rate {supplier.introRateMonths} months</span>
                )}
              </div>
              <Link
                href={supplier.website}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                View plan
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="text-xs uppercase text-ink/60">
            <tr>
              <th className="pb-3">Supplier</th>
              <th className="pb-3">Rate</th>
              <th className="pb-3">Term</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Renewable</th>
              <th className="pb-3">ETF</th>
              <th className="pb-3">Savings</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sea/10">
            {visibleSuppliers.map((supplier) => {
              const yearlySavings = getYearlySavings(priceToCompare, supplier, estimatedKwh);
              const isSaving = yearlySavings >= 0;
              return (
                <tr key={supplier.id} className="align-top">
                  <td className="py-4">
                    <div className="font-semibold text-ink">{supplier.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {supplier.rateType === 'variable' && (
                        <span className="rounded-full bg-sun/40 px-2 py-0.5 text-[11px] font-semibold text-ink">Variable</span>
                      )}
                      {supplier.earlyTerminationFee > 0 && (
                        <span className="rounded-full bg-sun/20 px-2 py-0.5 text-[11px] font-semibold text-ink">ETF</span>
                      )}
                      {supplier.introRateMonths && (
                        <span className="rounded-full bg-sun/20 px-2 py-0.5 text-[11px] font-semibold text-ink">Intro</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-ink">{formatRate(supplier.ratePerKwh)}</td>
                  <td className="py-4 text-ink/70">{supplier.termMonths} mo</td>
                  <td className="py-4 text-ink/70">{supplier.rateType}</td>
                  <td className="py-4 text-ink/70">{supplier.renewablePercent}%</td>
                  <td className="py-4 text-ink/70">${supplier.earlyTerminationFee}</td>
                  <td className={`py-4 font-semibold ${isSaving ? 'text-leaf' : 'text-danger'}`}>
                    {getSavingsLabel(yearlySavings)}
                  </td>
                  <td className="py-4">
                    <Link
                      href={supplier.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
                    >
                      View plan
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && !showAll && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-full bg-mist px-6 py-2 text-sm font-semibold text-ink transition hover:bg-sky/60"
          >
            Show all {sortedSuppliers.length} suppliers
          </button>
        </div>
      )}
    </section>
  );
}
