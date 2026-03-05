'use client';

import { useMemo, useState } from 'react';
import HomeProfile from '@/components/home-profile';
import SupplierTable from '@/components/supplier-table';
import AIChat from '@/components/ai-chat';
import ScamShield from '@/components/scam-shield';
import TopPicks from '@/components/top-picks';
import { Supplier } from '@/lib/types';
import { formatRate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
};

export default function CompareContent({ utility, rawSuppliers, zip }: Props) {
  const [estimatedKwh, setEstimatedKwh] = useState(1000);
  const [hasProfileSet, setHasProfileSet] = useState(false);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const suppliers = useMemo(() => {
    return rawSuppliers
      .filter((s) => s.termMonths > 0)
      .map((supplier) => {
        const yearlySavings = (utility.priceToCompare - supplier.ratePerKwh) * estimatedKwh * 12;
        return { ...supplier, yearlySavings };
      })
      .sort((a, b) => b.yearlySavings - a.yearlySavings);
  }, [rawSuppliers, utility.priceToCompare, estimatedKwh]);

  const handleEstimateChange = (kwh: number) => {
    setEstimatedKwh(kwh);
    setHasProfileSet(true);
  };

  return (
    <>
      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Your Home</p>
                <h1 className="mt-2 text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  {utility.name}
                </h1>
                <p className="mt-1 text-sm text-ink/70">
                  {utility.serviceArea} · Zip {zip || 'not provided'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sky/60 p-4">
                  <p className="text-xs uppercase text-ink/50">Price to Compare</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{formatRate(utility.priceToCompare)}</p>
                  <p className="mt-1 text-xs text-ink/60">Default utility supply rate</p>
                </div>
                <div className="rounded-2xl bg-leaf/10 p-4">
                  <p className="text-xs uppercase text-ink/50">Estimated Usage</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{estimatedKwh.toLocaleString()} kWh/mo</p>
                  <p className="mt-1 text-xs text-ink/60">Based on your home profile</p>
                </div>
              </div>
            </div>
            {hasProfileSet && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/60">
                <span>Adjust your profile to refine savings estimates.</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setProfileCollapsed((prev) => !prev)}
                  className="h-auto rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink transition hover:bg-sky/60 hover:text-ink"
                >
                  {profileCollapsed ? 'Edit home profile' : 'Minimize profile'}
                </Button>
              </div>
            )}
          </div>

          {!profileCollapsed && (
            <HomeProfile onEstimateChange={handleEstimateChange} />
          )}
          {profileCollapsed && (
            <div className="rounded-2xl border border-sea/10 bg-mist p-4 text-sm text-ink/70">
              Profile saved. Tap "Edit home profile" to make changes.
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <TopPicks suppliers={suppliers} priceToCompare={utility.priceToCompare} estimatedKwh={estimatedKwh} utility={utility.name} />
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          {!chatOpen ? (
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">AI Assistant</p>
              <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                Not sure? Ask our AI assistant.
              </h3>
              <p className="mt-2 text-sm text-ink/70">
                Get plain-English help on rates, fees, and risk before you switch.
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setChatOpen(true)}
                className="mt-4 h-auto rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white transition hover:bg-leaf hover:text-white"
              >
                Ask a question
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setChatOpen(false)}
                  className="h-auto rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink hover:bg-sky/60 hover:text-ink"
                >
                  Hide assistant
                </Button>
              </div>
              <AIChat
                utilityName={utility.name}
                priceToCompare={utility.priceToCompare}
                suppliers={suppliers}
                zip={zip || null}
              />
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <details className="group">
            <summary className="list-none cursor-pointer rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">All Suppliers</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                    See all {suppliers.length} suppliers
                  </h3>
                  <p className="mt-2 text-sm text-ink/70">Full comparison table sorted by estimated savings.</p>
                </div>
                <span className="mt-3 inline-flex rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink md:mt-0">
                  Expand
                </span>
              </div>
            </summary>
            <div className="mt-4">
              <SupplierTable
                suppliers={suppliers}
                priceToCompare={utility.priceToCompare}
                estimatedKwh={estimatedKwh}
                initialShowAll
                utility={utility.name}
              />
            </div>
          </details>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <details className="group">
            <summary className="list-none cursor-pointer rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Protect Yourself</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                    Scam shield tips & warnings
                  </h3>
                  <p className="mt-2 text-sm text-ink/70">Quick red flags to avoid costly surprises.</p>
                </div>
                <span className="mt-3 inline-flex rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink md:mt-0">
                  Expand
                </span>
              </div>
            </summary>
            <div className="mt-4">
              <ScamShield priceToCompare={utility.priceToCompare} suppliers={suppliers} />
            </div>
          </details>
        </div>
      </section>
    </>
  );
}
