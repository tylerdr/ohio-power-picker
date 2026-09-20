'use client';

import { useMemo, useState } from 'react';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';
import { rateSnapshot } from '@/lib/rate-snapshot';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Props = {
  suppliers: Supplier[];
  priceToCompare: number;
  estimatedKwh?: number;
  initialShowAll?: boolean;
  utility?: string;
};

const getYearlyDifference = (priceToCompare: number, supplier: Supplier, kwh: number) =>
  (priceToCompare - supplier.ratePerKwh) * kwh * 12;

const getDifferenceLabel = (value: number) =>
  value >= 0 ? `${formatCurrency(value)}/yr below stored PTC` : `${formatCurrency(Math.abs(value))}/yr above stored PTC`;

type SortKey = 'difference' | 'rate' | 'term' | 'type';

const INITIAL_SHOW = 8;

export default function SupplierTable({ suppliers, priceToCompare, estimatedKwh = 900, initialShowAll = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('difference');
  const [showAll, setShowAll] = useState(initialShowAll);

  const sortLabel = useMemo(() => {
    switch (sortKey) {
      case 'rate':
        return 'Sorted by lowest stored rate.';
      case 'term':
        return 'Sorted by shortest stored term.';
      case 'type':
        return 'Sorted by stored rate type.';
      case 'difference':
      default:
        return 'Sorted by estimated difference from the stored utility benchmark.';
    }
  }, [sortKey]);

  const sortedSuppliers = useMemo(() => {
    const withDifferences = suppliers.map((supplier) => ({
      supplier,
      yearlyDifference: getYearlyDifference(priceToCompare, supplier, estimatedKwh)
    }));

    const sorted = [...withDifferences].sort((a, b) => {
      switch (sortKey) {
        case 'rate':
          return a.supplier.ratePerKwh - b.supplier.ratePerKwh;
        case 'term':
          return a.supplier.termMonths - b.supplier.termMonths;
        case 'type':
          return a.supplier.rateType.localeCompare(b.supplier.rateType);
        case 'difference':
        default:
          return b.yearlyDifference - a.yearlyDifference;
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
            Archived Supplier Comparison
          </h3>
          <p className="text-sm text-ink/70">{sortLabel}</p>
          <p className="mt-1 text-xs text-ink/50">
            Supplier offers were scraped {rateSnapshot.supplierOffersLabel}. Verify current price, eligibility, fees, and terms before enrolling.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink/60">
          <span>Usage assumption: {estimatedKwh.toLocaleString()} kWh/month</span>
          <div className="flex items-center gap-2 text-xs text-ink/70">
            <Label htmlFor="sort-suppliers" className="text-xs font-medium text-ink/70">
              Sort by
            </Label>
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
              <SelectTrigger
                id="sort-suppliers"
                className="h-auto w-[170px] rounded-full border-sea/20 bg-white px-3 py-1 text-xs text-ink shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="difference">Snapshot difference</SelectItem>
                <SelectItem value="rate">Stored rate</SelectItem>
                <SelectItem value="term">Stored term</SelectItem>
                <SelectItem value="type">Rate type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {visibleSuppliers.map((supplier) => {
          const yearlyDifference = getYearlyDifference(priceToCompare, supplier, estimatedKwh);
          const isBelowStoredBenchmark = yearlyDifference >= 0;

          return (
            <article key={supplier.id} className="rounded-2xl border border-sea/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-ink">{supplier.name}</h4>
                  <p className="text-xs text-ink/60">{supplier.termMonths} months · {supplier.rateType} · {supplier.renewablePercent}% renewable</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isBelowStoredBenchmark ? 'bg-leaf/10 text-leaf' : 'bg-danger/10 text-danger'}`}>
                  {getDifferenceLabel(yearlyDifference)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{formatRate(supplier.ratePerKwh)}</span>
                <span className="text-xs text-ink/60">Stored ETF ${supplier.earlyTerminationFee}</span>
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
              <Button asChild className="mt-4 w-full rounded-full bg-sea text-white hover:bg-leaf">
                <a href={rateSnapshot.sourceUrl} target="_blank" rel="noreferrer">
                  Verify current offer at PUCO
                </a>
              </Button>
            </article>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase text-ink/60">
            <tr>
              <th className="pb-3">Snapshot Supplier</th>
              <th className="pb-3">Stored Rate</th>
              <th className="pb-3">Stored Term</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Renewable</th>
              <th className="pb-3">Stored ETF</th>
              <th className="pb-3">Snapshot Difference</th>
              <th className="pb-3">Current Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sea/10">
            {visibleSuppliers.map((supplier) => {
              const yearlyDifference = getYearlyDifference(priceToCompare, supplier, estimatedKwh);
              const isBelowStoredBenchmark = yearlyDifference >= 0;
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
                  <td className={`py-4 font-semibold ${isBelowStoredBenchmark ? 'text-leaf' : 'text-danger'}`}>
                    {getDifferenceLabel(yearlyDifference)}
                  </td>
                  <td className="py-4">
                    <Button asChild size="sm" className="rounded-full bg-sea text-white hover:bg-leaf">
                      <a href={rateSnapshot.sourceUrl} target="_blank" rel="noreferrer">
                        Verify at PUCO
                      </a>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && !showAll && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="h-auto rounded-full bg-mist px-6 py-2 text-sm font-semibold text-ink transition hover:bg-sky/60 hover:text-ink"
          >
            Show all {sortedSuppliers.length} snapshot suppliers
          </Button>
        </div>
      )}
    </section>
  );
}
