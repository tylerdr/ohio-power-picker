'use client';

import { useMemo, useState } from 'react';
import HomeProfile from '@/components/home-profile';
import SupplierTable from '@/components/supplier-table';
import AIChat from '@/components/ai-chat';
import ScamShield from '@/components/scam-shield';
import TopPicks from '@/components/top-picks';
import { Supplier } from '@/lib/types';
import { formatRate } from '@/lib/utils';
import { rateSnapshot, rateSnapshotNotice } from '@/lib/rate-snapshot';
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
        const yearlyDifference = (utility.priceToCompare - supplier.ratePerKwh) * estimatedKwh * 12;
        return { ...supplier, yearlySavings: yearlyDifference };
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
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Archived Market Screen</p>
                <h1 className="mt-2 text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  {utility.name}
                </h1>
                <p className="mt-1 text-sm text-ink/70">
                  {utility.serviceArea} · Zip {zip || 'not provided'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sky/60 p-4">
                  <p className="text-xs uppercase text-ink/50">Stored Price to Compare</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{formatRate(utility.priceToCompare)}</p>
                  <p className="mt-1 text-xs text-ink/60">Static repository value — verify current PTC</p>
                </div>
                <div className="rounded-2xl bg-leaf/10 p-4">
                  <p className="text-xs uppercase text-ink/50">Usage Assumption</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{estimatedKwh.toLocaleString()} kWh/mo</p>
                  <p className="mt-1 text-xs text-ink/60">Used only for snapshot comparisons</p>
                </div>
              </div>
            </div>
            {hasProfileSet && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/60">
                <span>Adjust your profile to change the snapshot cost comparison.</span>
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p>{rateSnapshotNotice}</p>
            <a
              href={rateSnapshot.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex font-semibold underline underline-offset-2"
            >
              Check current PUCO Apples to Apples offers →
            </a>
          </div>

          {!profileCollapsed && (
            <HomeProfile onEstimateChange={handleEstimateChange} />
          )}
          {profileCollapsed && (
            <div className="rounded-2xl border border-sea/10 bg-mist p-4 text-sm text-ink/70">
              Profile saved for this comparison. Tap "Edit home profile" to make changes.
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
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Snapshot Explainer</p>
              <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                Need help reading the stored terms?
              </h3>
              <p className="mt-2 text-sm text-ink/70">
                Ask for plain-English help interpreting rate type, term length, fees, and the limits of this {rateSnapshot.supplierOffersLabel} snapshot. The assistant cannot verify a current offer.
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setChatOpen(true)}
                className="mt-4 h-auto rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white transition hover:bg-leaf hover:text-white"
              >
                Explain this snapshot
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
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Archived Suppliers</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                    See all {suppliers.length} stored offers
                  </h3>
                  <p className="mt-2 text-sm text-ink/70">Comparison table sorted by the selected snapshot metric; current availability may differ.</p>
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
                  <p className="mt-2 text-sm text-ink/70">Quick red flags to check against the current supplier disclosure.</p>
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
