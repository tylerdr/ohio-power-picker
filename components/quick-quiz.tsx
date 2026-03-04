'use client';

import { useMemo, useState } from 'react';
import { Supplier } from '@/lib/types';
import { supplierData } from '@/lib/data';
import { utilities } from '@/lib/utilities';
import { formatCurrency, formatRate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const usageMap = {
  low: 600,
  average: 900,
  high: 1400
} as const;

type Priority = 'price' | 'stable' | 'green' | 'short';
type UsageLevel = keyof typeof usageMap;
type Commitment = 'month' | 'six' | 'year';

type Answers = {
  priority?: Priority;
  usage?: UsageLevel;
  commitment?: Commitment;
};

const utilityNameMap = Object.fromEntries(utilities.map((utility) => [utility.id, utility.name]));

const getCommitmentFit = (supplier: Supplier, commitment: Commitment) => {
  if (commitment === 'month') return supplier.termMonths <= 6 ? 1 : -0.5;
  if (commitment === 'six') return supplier.termMonths >= 4 && supplier.termMonths <= 9 ? 1 : -0.2;
  return supplier.termMonths >= 12 ? 1 : -0.5;
};

export default function QuickQuiz() {
  const [answers, setAnswers] = useState<Answers>({});

  const allComplete = answers.priority && answers.usage && answers.commitment;

  const results = useMemo(() => {
    if (!allComplete) return [];

    const usage = usageMap[answers.usage as UsageLevel];
    const rates = supplierData.map((supplier) => supplier.ratePerKwh);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const rateRange = Math.max(maxRate - minRate, 0.01);

    const scored = supplierData.map((supplier) => {
      const priceScore = 1 - (supplier.ratePerKwh - minRate) / rateRange;
      const greenScore = supplier.renewablePercent / 100;
      const stabilityScore = supplier.rateType === 'fixed' ? 1 : 0;
      const shortScore = 1 - Math.min(supplier.termMonths, 24) / 24;
      const commitmentFit = getCommitmentFit(supplier, answers.commitment as Commitment);

      const weights = {
        price: { price: 0.6, stable: 0.1, green: 0.1, short: 0.2 },
        stable: { price: 0.2, stable: 0.5, green: 0.1, short: 0.2 },
        green: { price: 0.2, stable: 0.1, green: 0.6, short: 0.1 },
        short: { price: 0.2, stable: 0.1, green: 0.1, short: 0.6 }
      };

      const weight = weights[answers.priority as Priority];
      const baseScore =
        priceScore * weight.price +
        stabilityScore * weight.stable +
        greenScore * weight.green +
        shortScore * weight.short;

      const riskPenalty =
        (supplier.rateType === 'variable' ? -0.2 : 0) +
        (supplier.earlyTerminationFee >= 100 ? -0.2 : 0) +
        (supplier.introRateMonths ? -0.1 : 0);

      return {
        supplier,
        score: baseScore + commitmentFit + riskPenalty,
        estimatedMonthly: supplier.ratePerKwh * usage
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 4);
  }, [allComplete, answers]);

  const updateAnswer = <T extends keyof Answers>(key: T, value: Answers[T]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const resetQuiz = () => setAnswers({});

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Quick Quiz</p>
      <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
        Get a recommendation in 30 seconds
      </h3>
      <p className="mt-2 text-sm text-ink/70">
        Answer three questions and we’ll surface suppliers that best match your priorities.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="rounded-2xl border border-sea/10 bg-mist p-4">
          <p className="text-sm font-semibold text-ink">1. What matters most?</p>
          <RadioGroup
            value={answers.priority}
            onValueChange={(value) => updateAnswer('priority', value as Priority)}
            className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-2"
          >
            {[
              { value: 'price', label: 'Lowest price' },
              { value: 'stable', label: 'Stable rate' },
              { value: 'green', label: 'Green energy' },
              { value: 'short', label: 'Short commitment' }
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem
                  id={`priority-${option.value}`}
                  value={option.value}
                  className="border-sea text-sea"
                />
                <Label htmlFor={`priority-${option.value}`} className="font-normal text-ink/70">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="rounded-2xl border border-sea/10 bg-mist p-4">
          <p className="text-sm font-semibold text-ink">2. How much electricity do you use?</p>
          <RadioGroup
            value={answers.usage}
            onValueChange={(value) => updateAnswer('usage', value as UsageLevel)}
            className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-3"
          >
            {[
              { value: 'low', label: 'Low (600 kWh)' },
              { value: 'average', label: 'Average (900 kWh)' },
              { value: 'high', label: 'High (1,400 kWh)' }
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem
                  id={`usage-${option.value}`}
                  value={option.value}
                  className="border-sea text-sea"
                />
                <Label htmlFor={`usage-${option.value}`} className="font-normal text-ink/70">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="rounded-2xl border border-sea/10 bg-mist p-4">
          <p className="text-sm font-semibold text-ink">3. How long do you want to commit?</p>
          <RadioGroup
            value={answers.commitment}
            onValueChange={(value) => updateAnswer('commitment', value as Commitment)}
            className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-3"
          >
            {[
              { value: 'month', label: 'Month-to-month' },
              { value: 'six', label: '6 months' },
              { value: 'year', label: '12+ months' }
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem
                  id={`commitment-${option.value}`}
                  value={option.value}
                  className="border-sea text-sea"
                />
                <Label htmlFor={`commitment-${option.value}`} className="font-normal text-ink/70">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {allComplete && (
        <div className="mt-6 rounded-2xl border border-sea/10 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-ink">Top matches</h4>
              <p className="text-sm text-ink/70">Based on your answers and statewide supplier data.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={resetQuiz}
              className="h-auto rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink hover:bg-sky/60 hover:text-ink"
            >
              Reset quiz
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {results.map((result) => (
              <div key={result.supplier.id} className="rounded-2xl border border-sea/10 bg-mist p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-ink">{result.supplier.name}</p>
                    <p className="text-xs text-ink/60">
                      {result.supplier.termMonths === 1 ? "1 month" : `${result.supplier.termMonths} months`} · {result.supplier.rateType} · {result.supplier.renewablePercent}% renewable
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{formatRate(result.supplier.ratePerKwh)}</p>
                    <p className="text-xs text-ink/60">Est. {formatCurrency(result.estimatedMonthly)} / mo</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink/60">
                  Available in: {result.supplier.utilityTerritories.map((territory) => utilityNameMap[territory]).join(', ')}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink/60">
            These are statewide suggestions. Confirm availability for your utility before enrolling.
          </p>
        </div>
      )}
    </section>
  );
}
