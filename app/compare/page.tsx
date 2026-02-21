import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import SupplierTable from '@/components/supplier-table';
import AIRecommendation from '@/components/ai-recommendation';
import { getSuppliersForUtility } from '@/lib/data';
import { utilities, utilityMap } from '@/lib/utilities';
import { formatCurrency, formatRate } from '@/lib/utils';

const AVG_KWH = 900;

export default function ComparePage({
  searchParams
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';
  const utility = utilityMap[utilityId];

  if (!utility) {
    return (
      <main className="pb-16">
        <SiteHeader />
        <section className="px-5 pt-12 md:px-10">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-card backdrop-blur">
            <h1 className="text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Start with your zip code and utility
            </h1>
            <p className="mt-3 text-sm text-ink/70">
              We need your utility to match you with the right suppliers.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white"
            >
              Go to homepage
            </Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const suppliers = getSuppliersForUtility(utilityId)
    .map((supplier) => {
      const yearlySavings = (utility.priceToCompare - supplier.ratePerKwh) * AVG_KWH * 12;
      return { ...supplier, yearlySavings };
    })
    .sort((a, b) => b.yearlySavings - a.yearlySavings);

  const bestSavings = suppliers[0]?.yearlySavings ?? 0;

  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="px-5 pt-10 md:px-10">
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
                  <p className="mt-1 text-xs text-ink/60">Based on 900 kWh/month</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
              <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                Savings Calculator
              </h2>
              <p className="mt-2 text-sm text-ink/70">
                Compare any supplier against the default rate. Average Ohio usage is 900 kWh/month.
              </p>
              <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink/80">
                <p className="font-semibold text-ink">Formula</p>
                <p className="mt-2">({formatRate(utility.priceToCompare)} - Supplier Rate) × 900 kWh × 12 months</p>
              </div>
              <div className="mt-4 rounded-2xl bg-mist p-4 text-sm text-ink/70">
                <p>Suppliers are sorted by estimated savings. Green means you save money, red means you pay more than the default rate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <SupplierTable suppliers={suppliers} priceToCompare={utility.priceToCompare} />
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
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Warning Flags to Watch
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-3">
            <div className="rounded-2xl bg-sun/30 p-4">
              Variable rates can jump after the intro period ends.
            </div>
            <div className="rounded-2xl bg-sun/20 p-4">
              Early termination fees (ETF) cost money if you switch early.
            </div>
            <div className="rounded-2xl bg-sun/10 p-4">
              Introductory rates can expire in 1-6 months.
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-6 text-sm text-ink/70 shadow-card backdrop-blur">
          <p>
            Want to compare another utility? Use the utility selector below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {utilities.map((item) => (
              <Link
                key={item.id}
                href={`/compare?utility=${item.id}&zip=${zip}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${item.id === utilityId ? 'bg-sea text-white' : 'bg-white text-ink'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
