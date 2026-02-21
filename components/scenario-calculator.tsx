'use client';

import { useMemo } from 'react';
import { formatCurrency, formatCurrencyPrecise, formatRate } from '@/lib/utils';
import type { HistoricalRate } from '@/lib/types';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  recentRates: HistoricalRate[];
  usageKwh: number;
  onUsageChange: (value: number) => void;
  planType: 'fixed' | 'variable';
  onPlanTypeChange: (value: 'fixed' | 'variable') => void;
  fixedRateCents: number;
  onFixedRateChange: (value: number) => void;
};

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-');
  const monthIndex = Number(month) - 1;
  return `${monthLabels[monthIndex]} ${year}`;
};

export default function ScenarioCalculator({
  recentRates,
  usageKwh,
  onUsageChange,
  planType,
  onPlanTypeChange,
  fixedRateCents,
  onFixedRateChange
}: Props) {
  const fixedRate = fixedRateCents / 100;

  const rows = useMemo(() => {
    let runningFixed = 0;
    let runningVariable = 0;

    return recentRates.map((item) => {
      const variableCost = item.avgVariableRate * usageKwh;
      const fixedCost = fixedRate * usageKwh;
      runningVariable += variableCost;
      runningFixed += fixedCost;
      return {
        ...item,
        variableCost,
        fixedCost,
        runningVariable,
        runningFixed,
        delta: variableCost - fixedCost
      };
    });
  }, [recentRates, usageKwh, fixedRate]);

  const totals = rows.reduce(
    (acc, row) => {
      acc.fixed += row.fixedCost;
      acc.variable += row.variableCost;
      return acc;
    },
    { fixed: 0, variable: 0 }
  );

  const winner = totals.variable > totals.fixed ? 'Fixed' : 'Variable';
  const savings = Math.abs(totals.variable - totals.fixed);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-sea/10 bg-mist p-4">
          <p className="text-xs uppercase text-ink/60">Monthly usage</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{usageKwh.toLocaleString()} kWh</p>
          <input
            type="range"
            min={500}
            max={2000}
            step={50}
            value={usageKwh}
            onChange={(event) => onUsageChange(Number(event.target.value))}
            className="mt-4 w-full accent-sea"
          />
          <div className="mt-2 flex justify-between text-xs text-ink/50">
            <span>500 kWh</span>
            <span>2,000 kWh</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sea/10 bg-mist p-4">
          <p className="text-xs uppercase text-ink/60">Plan selection</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onPlanTypeChange('fixed')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                planType === 'fixed'
                  ? 'bg-sea text-white'
                  : 'bg-white text-ink/70 hover:bg-sky/60'
              }`}
              aria-pressed={planType === 'fixed'}
            >
              Fixed
            </button>
            <button
              type="button"
              onClick={() => onPlanTypeChange('variable')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                planType === 'variable'
                  ? 'bg-sea text-white'
                  : 'bg-white text-ink/70 hover:bg-sky/60'
              }`}
              aria-pressed={planType === 'variable'}
            >
              Variable
            </button>
          </div>
          <label className="mt-4 block text-xs uppercase text-ink/60">
            Fixed rate (¢/kWh)
            <input
              type="number"
              min={4}
              max={15}
              step={0.01}
              value={Number.isNaN(fixedRateCents) ? '' : fixedRateCents}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next)) {
                  onFixedRateChange(Math.min(15, Math.max(4, next)));
                }
              }}
              className="mt-2 w-full rounded-2xl border border-sea/20 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-sky/60 p-4 text-sm text-ink/70">
        <p className="font-semibold text-ink">
          {planType === 'fixed' ? 'Fixed plan' : 'Variable plan'} total: {formatCurrency(planType === 'fixed'
            ? totals.fixed
            : totals.variable)}
        </p>
        <p className="mt-1">
          {winner} would have saved you {formatCurrency(savings)} over the last 12 months.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sea/10 bg-white">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-ink/60">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Variable rate</th>
              <th className="px-4 py-3">Variable cost</th>
              <th className="px-4 py-3">Fixed cost</th>
              <th className="px-4 py-3">Difference</th>
              <th className="px-4 py-3">Running total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sea/10">
            {rows.map((row) => {
              const cheaper = row.delta < 0;
              return (
                <tr key={row.period} className={cheaper ? 'bg-leaf/5' : 'bg-danger/5'}>
                  <td className="px-4 py-3 font-semibold text-ink">{formatPeriod(row.period)}</td>
                  <td className="px-4 py-3 text-ink/70">{formatRate(row.avgVariableRate)}</td>
                  <td className="px-4 py-3 text-ink/70">{formatCurrencyPrecise(row.variableCost)}</td>
                  <td className="px-4 py-3 text-ink/70">{formatCurrencyPrecise(row.fixedCost)}</td>
                  <td className={`px-4 py-3 font-semibold ${cheaper ? 'text-leaf' : 'text-danger'}`}>
                    {cheaper ? '-' : '+'}{formatCurrencyPrecise(Math.abs(row.delta))}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {formatCurrencyPrecise(row.runningFixed)} / {formatCurrencyPrecise(row.runningVariable)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
