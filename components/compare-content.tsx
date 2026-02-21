'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import HomeProfile from '@/components/home-profile';
import SupplierTable from '@/components/supplier-table';
import AIRecommendation from '@/components/ai-recommendation';
import AIChat from '@/components/ai-chat';
import SupplierCompare from '@/components/supplier-compare';
import ScamShield from '@/components/scam-shield';
import { Supplier } from '@/lib/types';
import { formatCurrency, formatRate } from '@/lib/utils';

type UtilityInfo = {
  id: string;
  name: string;
  serviceArea: string;
  priceToCompare: number;
};

type Props = {
  utility: UtilityInfo;
  rawSuppliers: Supplier[];
  zip: string;
  allUtilities: { id: string; name: string }[];
};

export default function CompareContent({ utility, rawSuppliers, zip, allUtilities }: Props) {
  const [estimatedKwh, setEstimatedKwh] = useState(1000);

  const suppliers = useMemo(() => {
    return rawSuppliers
      .filter((s) => s.termMonths > 0) // Exclude Standard Offer (default utility rate)
      .map((supplier) => {
        const yearlySavings = (utility.priceToCompare - supplier.ratePerKwh) * estimatedKwh * 12;
        return { ...supplier, yearlySavings };
      })
      .sort((a, b) => b.yearlySavings - a.yearlySavings);
  }, [rawSuppliers, utility.priceToCompare, estimatedKwh]);

  const bestSavings = suppliers[0]?.yearlySavings ?? 0;

  return (
    <>
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <HomeProfile onEstimateChange={setEstimatedKwh} />
        </div>
      </section>

      <section className="px-5 pt-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Results</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                {utility.name}
              </h1>
              <p className="mt-2 text-sm text-ink/70">
                {utility.serviceArea} · Zip {zip || 'not provided'}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-sky/60 p-4">
                  <p className="text-xs uppercase text-ink/50">Price to Compare</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{formatRate(utility.priceToCompare)}</p>
                  <p className="mt-1 text-xs text-ink/60">Default utility supply rate</p>
                </div>
                <div className="rounded-2xl bg-leaf/10 p-4">
                  <p className="text-xs uppercase text-ink/50">Best Estimated Savings</p>
                  <p className="mt-2 text-2xl font-semibold text-leaf">
                    {bestSavings > 0 ? formatCurrency(bestSavings) : '$0'} / yr
                  </p>
                  <p className="mt-1 text-xs text-ink/60">Based on {estimatedKwh.toLocaleString()} kWh/month</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
              <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                How it works
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-ink/70">
                <div className="rounded-2xl bg-leaf/10 p-4">
                  <p className="font-semibold text-ink">✅ Green = saves money</p>
                  <p className="mt-1">Supplier rate is below your utility&apos;s Price to Compare ({formatRate(utility.priceToCompare)}).</p>
                </div>
                <div className="rounded-2xl bg-danger/10 p-4">
                  <p className="font-semibold text-ink">🔴 Red = costs more</p>
                  <p className="mt-1">You&apos;d pay more than sticking with the default rate.</p>
                </div>
                <div className="rounded-2xl bg-sky/60 p-4">
                  <p className="font-semibold text-ink">📊 Personalized estimates</p>
                  <p className="mt-1">Based on your home profile: {estimatedKwh.toLocaleString()} kWh/month. Adjust above to refine.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <SupplierTable suppliers={suppliers} priceToCompare={utility.priceToCompare} estimatedKwh={estimatedKwh} />
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <AIRecommendation
            utilityName={utility.name}
            priceToCompare={utility.priceToCompare}
            suppliers={suppliers}
            zip={zip || null}
          />
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SupplierCompare suppliers={suppliers} priceToCompare={utility.priceToCompare} />
          <div className="lg:sticky lg:top-24 h-fit">
            <AIChat
              utilityName={utility.name}
              priceToCompare={utility.priceToCompare}
              suppliers={suppliers}
              zip={zip || null}
            />
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <ScamShield priceToCompare={utility.priceToCompare} suppliers={suppliers} />
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-6 text-sm text-ink/70 shadow-card backdrop-blur">
          <p>Want to compare another utility?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allUtilities.map((item) => (
              <Link
                key={item.id}
                href={`/compare?utility=${item.id}&zip=${zip}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${item.id === utility.id ? 'bg-sea text-white' : 'bg-white text-ink'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
