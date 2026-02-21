'use client';

import { useMemo, useState } from 'react';
import RateChart from '@/components/rate-chart';
import SeasonalChart from '@/components/seasonal-chart';
import ScenarioCalculator from '@/components/scenario-calculator';
import { formatCurrency, formatRate } from '@/lib/utils';
import type { HistoricalRate } from '@/lib/types';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type RateChartPoint = HistoricalRate & { avgPtcRate: number };

type Props = {
  data: HistoricalRate[];
};

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const formatMonthYear = (period: string) => {
  const [year, month] = period.split('-');
  const monthIndex = Number(month) - 1;
  return `${monthLabels[monthIndex]} ${year}`;
};

export default function AnalyticsContent({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [usageKwh, setUsageKwh] = useState(1000);
  const [planType, setPlanType] = useState<'fixed' | 'variable'>('fixed');
  const [fixedRateCents, setFixedRateCents] = useState(6.49);

  const chartData = useMemo<RateChartPoint[]>(() => {
    return data.map((item) => {
      const ptcValues = Object.values(item.priceToCompare);
      const avgPtcRate = ptcValues.length ? average(ptcValues) : item.avgFixedRate;
      return { ...item, avgPtcRate };
    });
  }, [data]);

  const last12 = chartData.slice(-12);

  const seasonalData = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);
    const counts = Array.from({ length: 12 }, () => 0);

    chartData.forEach((item) => {
      const monthIndex = Number(item.period.split('-')[1]) - 1;
      totals[monthIndex] += item.avgVariableRate;
      counts[monthIndex] += 1;
    });

    return totals.map((total, index) => ({
      month: monthLabels[index],
      value: total / counts[index]
    }));
  }, [chartData]);

  const variableCheaperCount = useMemo(
    () => chartData.filter((item) => item.avgVariableRate < item.avgFixedRate).length,
    [chartData]
  );

  const highestVariable = useMemo(() => {
    return chartData.reduce((current, item) =>
      item.avgVariableRate > current.avgVariableRate ? item : current
    );
  }, [chartData]);

  const avgFixedRate = useMemo(
    () => average(chartData.map((item) => item.avgFixedRate)),
    [chartData]
  );

  const avgVariableRate = useMemo(
    () => average(chartData.map((item) => item.avgVariableRate)),
    [chartData]
  );

  const avgAnnualSavings = Math.max(0, (avgVariableRate - avgFixedRate) * 1000 * 12);

  const scenarioUsage = 1000;
  const scenarioFixedRate = 0.0649;
  const scenarioVariableTotal = last12.reduce(
    (sum, item) => sum + item.avgVariableRate * scenarioUsage,
    0
  );
  const scenarioFixedTotal = scenarioFixedRate * scenarioUsage * last12.length;
  const scenarioDiff = scenarioVariableTotal - scenarioFixedTotal;
  const scenarioOutcome = scenarioDiff >= 0 ? 'cost' : 'saved';
  const scenarioBadgeClass = scenarioDiff >= 0 ? 'bg-danger/10 text-danger' : 'bg-leaf/10 text-leaf';

  const variableLinePoints = useMemo(() => {
    if (last12.length === 0) return '';
    const width = 160;
    const height = 48;
    const values = last12.map((item) => item.avgVariableRate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [last12]);

  const fixedLinePoints = '0,24 160,24';

  return (
    <>
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Rate Trends</p>
            <h1
              className="mt-3 text-3xl font-semibold text-ink md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Ohio Electricity Rate History
            </h1>
            <p className="mt-3 text-sm text-ink/70">
              See how supplier rates and default utility pricing have moved over the last 3 years.
            </p>

            <div className="mt-6 overflow-x-auto">
              <RateChart
                data={chartData}
                activeIndex={activeIndex}
                onActiveIndexChange={setActiveIndex}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Variable Rate Risk</p>
            <h2
              className="mt-3 text-2xl font-semibold text-ink"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              The Real Cost of Variable Rates
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              Variable plans can start low, but Ohio’s seasonal spikes add up fast. Here’s what the last 12
              months actually looked like.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-sky/60 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-ink/60">Fixed Rate</p>
                    <p className="mt-2 text-lg font-semibold text-ink">6.49¢/kWh</p>
                    <p className="mt-1 text-sm text-ink/70">Predictable monthly bills.</p>
                  </div>
                  <svg viewBox="0 0 160 48" className="h-12 w-40">
                    <polyline
                      points={fixedLinePoints}
                      fill="none"
                      stroke="#1b8f5a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="rounded-2xl bg-sun/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-ink/60">Variable Rate</p>
                    <p className="mt-2 text-lg font-semibold text-ink">Starts at 5.49¢/kWh</p>
                    <p className="mt-1 text-sm text-ink/70">Spikes to 9-12¢ in peak months.</p>
                  </div>
                  <svg viewBox="0 0 160 48" className="h-12 w-40">
                    <polyline
                      points={variableLinePoints}
                      fill="none"
                      stroke="#f6c453"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-mist p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase text-ink/60">12-month total at 1,000 kWh/mo</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-ink">
                      Fixed: {formatCurrency(scenarioFixedTotal)}
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-ink">
                      Variable: {formatCurrency(scenarioVariableTotal)}
                    </span>
                  </div>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${scenarioBadgeClass}`}>
                  Variable rates started cheaper but {scenarioOutcome} {formatCurrency(Math.abs(scenarioDiff))} over
                  12 months.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Seasonal Pattern</p>
            <h2
              className="mt-3 text-2xl font-semibold text-ink"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              When Rates Spike
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              Average variable supply rates by month, based on the last 48 months.
            </p>

            <div className="mt-6">
              <SeasonalChart data={seasonalData} />
            </div>

            <div className="mt-6 rounded-2xl bg-sky/60 p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">Peak months: January, February, July, August.</p>
              <p className="mt-1">
                Variable rates follow wholesale electricity prices, which spike during extreme weather.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Scenario Calculator</p>
            <h2
              className="mt-3 text-2xl font-semibold text-ink"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              What would YOU have paid?
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              Adjust your usage to see the last 12 months of costs on fixed vs variable plans.
            </p>

            <div className="mt-6">
              <ScenarioCalculator
                recentRates={last12}
                usageKwh={usageKwh}
                onUsageChange={setUsageKwh}
                planType={planType}
                onPlanTypeChange={setPlanType}
                fixedRateCents={fixedRateCents}
                onFixedRateChange={setFixedRateCents}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Key Insights</p>
            <h2
              className="mt-3 text-2xl font-semibold text-ink"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              What the data says
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-sky/60 p-5">
                <p className="text-xs uppercase text-ink/60">Variable vs Fixed</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {variableCheaperCount} out of {chartData.length} months
                </p>
                <p className="mt-1 text-sm text-ink/70">Variable rates were cheaper than fixed.</p>
              </div>
              <div className="rounded-2xl bg-sun/20 p-5">
                <p className="text-xs uppercase text-ink/60">Highest spike</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatRate(highestVariable.avgVariableRate)}
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Hit in {formatMonthYear(highestVariable.period)}.
                </p>
              </div>
              <div className="rounded-2xl bg-leaf/10 p-5">
                <p className="text-xs uppercase text-ink/60">Average savings</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(avgAnnualSavings)} per year
                </p>
                <p className="mt-1 text-sm text-ink/70">Fixed rates beat variable on average.</p>
              </div>
              <div className="rounded-2xl bg-mist p-5">
                <p className="text-xs uppercase text-ink/60">Default rate adoption</p>
                <p className="mt-2 text-2xl font-semibold text-ink">62%</p>
                <p className="mt-1 text-sm text-ink/70">
                  Ohio homeowners still on the default utility rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
