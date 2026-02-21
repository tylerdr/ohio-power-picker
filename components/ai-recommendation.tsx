'use client';

import { useCompletion } from 'ai/react';
import { useMemo } from 'react';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatCurrencyPrecise, formatRate } from '@/lib/utils';

const AVG_KWH = 900;

type Props = {
  utilityName: string;
  priceToCompare: number;
  suppliers: Supplier[];
  zip: string | null;
};

export default function AIRecommendation({
  utilityName,
  priceToCompare,
  suppliers,
  zip
}: Props) {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/recommend'
  });

  const topSuppliers = useMemo(() => {
    return [...suppliers]
      .map((supplier) => {
        const monthly = (priceToCompare - supplier.ratePerKwh) * AVG_KWH;
        return {
          ...supplier,
          yearlySavings: monthly * 12
        };
      })
      .sort((a, b) => b.yearlySavings - a.yearlySavings)
      .slice(0, 6);
  }, [suppliers, priceToCompare]);

  const prompt = useMemo(() => {
    const supplierLines = topSuppliers
      .map((supplier) => {
        const savingsText =
          supplier.yearlySavings >= 0
            ? `${formatCurrency(supplier.yearlySavings)} savings/year`
            : `${formatCurrency(Math.abs(supplier.yearlySavings))} higher/year`;
        return `- ${supplier.name}: ${formatRate(supplier.ratePerKwh)}, ${supplier.termMonths} months, ${supplier.rateType} rate, ${supplier.renewablePercent}% renewable, ETF ${formatCurrencyPrecise(supplier.earlyTerminationFee)}, intro ${supplier.introRateMonths ?? 'none'} months, ${savingsText}`;
      })
      .join('\n');

    return `You are an Ohio electricity advisor. Recommend the best 2-3 supplier options for a residential homeowner.\n\nUtility: ${utilityName}\nZip: ${zip ?? 'unknown'}\nPrice to Compare: ${formatRate(priceToCompare)}\nAverage usage: ${AVG_KWH} kWh/month\n\nTop supplier options:\n${supplierLines}\n\nRules:\n- Prefer fixed rates when savings are similar.\n- Flag variable rates and intro periods.\n- Mention early termination fees if over $75.\n- Keep it plain English, 3-5 short paragraphs.\n- End with a simple recommendation list (bullets).`;
  }, [topSuppliers, utilityName, priceToCompare, zip]);

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            AI Recommendation
          </h3>
          <p className="text-sm text-ink/70">
            Tailored guidance based on rate, terms, and risk factors.
          </p>
        </div>
        <button
          onClick={() => complete(prompt)}
          disabled={isLoading}
          className="rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white transition hover:bg-leaf disabled:opacity-60"
        >
          {isLoading ? 'Analyzing...' : 'Generate recommendation'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-sea/10 bg-mist p-4 text-sm text-ink/80">
        {completion ? (
          <div className="whitespace-pre-line">{completion}</div>
        ) : (
          <p>
            Click generate to get a plain-English summary of the best options for your home.
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-danger">AI recommendation failed. Please try again.</p>
        )}
      </div>
    </section>
  );
}
