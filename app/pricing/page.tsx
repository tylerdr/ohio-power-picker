import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import EmailCapture from '@/components/email-capture';
import { utilities } from '@/lib/utilities';
import { getSuppliersForUtility } from '@/lib/data';
import { formatRate } from '@/lib/utils';
import { rateSnapshot, rateSnapshotNotice } from '@/lib/rate-snapshot';

export const metadata = {
  title: 'Ohio Electricity Rate Plans — Compare Supplier Pricing | Ohio Electricity Rates',
  description:
    'Review an archived Ohio electricity supplier snapshot by utility, compare plan structures, and verify current pricing with PUCO before enrolling.',
};

function getBestAndWorstForUtility(utilityId: string) {
  const suppliers = getSuppliersForUtility(utilityId);
  if (!suppliers.length) return { best: null, worst: null, count: 0 };
  const sorted = [...suppliers].sort((a, b) => a.ratePerKwh - b.ratePerKwh);
  return { best: sorted[0], worst: sorted[sorted.length - 1], count: suppliers.length };
}

export default function PricingPage({
  searchParams,
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const zip = searchParams?.zip?.trim() ?? '';
  const utilityId = searchParams?.utility ?? '';

  const utilityRows = utilities.map((utility) => {
    const { best, worst, count } = getBestAndWorstForUtility(utility.id);
    const savings =
      best && best.ratePerKwh < utility.priceToCompare
        ? ((utility.priceToCompare - best.ratePerKwh) * 100).toFixed(2)
        : null;
    return { utility, best, worst, count, savings };
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Price to Compare in Ohio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Price to Compare (PTC) is the default electricity generation benchmark for your Ohio utility. It changes periodically, so confirm the current PTC before comparing a supplier offer.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between a fixed and variable rate plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A fixed rate stays the same for the stated contract term. A variable rate can change according to the supplier contract. Review the current disclosure, term, fees, and renewal conditions before enrolling.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I switch electricity suppliers in Ohio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use comparison information to screen options, then verify the current offer in PUCO Energy Choice and with the supplier before enrollment. Your utility continues to deliver electricity and handle outages.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there fees to switch electricity suppliers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fees vary by supplier and contract. Some offers include early termination fees or other conditions. Confirm the current contract terms before switching.',
        },
      },
    ],
  };

  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader zip={zip} utility={utilityId} />

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Ohio Electricity Pricing</p>
          <h1
            className="mt-3 text-4xl font-semibold text-ink md:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Screen Ohio electricity rate plans
          </h1>
          <p className="mt-4 text-base text-ink/70">
            Review our archived supplier snapshot and stored utility benchmarks to understand plan structure and possible savings. Verify live pricing before you switch.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sea px-7 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Screen rates for my area →
          </Link>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
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
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            How Ohio electricity pricing works
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Your utility publishes the benchmark',
                body: 'The Price to Compare (PTC) is the utility default generation benchmark. It changes periodically, so a stored value must be rechecked before making a decision.',
                icon: '🏛️',
              },
              {
                title: 'Suppliers publish competing offers',
                body: 'PUCO-certified competitive retail electric suppliers offer plans with different rate types, terms, fees, renewable content, and renewal conditions.',
                icon: '⚡',
              },
              {
                title: 'Use the snapshot to screen',
                body: `This site compares a supplier snapshot scraped ${rateSnapshot.supplierOffersLabel} against stored PTC values. It is useful for screening, not a live enrollment quote.`,
                icon: '🔍',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Archived rate snapshot by Ohio utility
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Supplier offers below were scraped {rateSnapshot.supplierOffersLabel}. Rates are shown in ¢/kWh; current availability may differ.
          </p>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-white/60 bg-white/70 shadow-card backdrop-blur">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-[0.15em] text-ink/50">
                  <th className="px-6 py-4">Utility</th>
                  <th className="px-6 py-4">Service Area</th>
                  <th className="px-6 py-4">Stored Price to Compare</th>
                  <th className="px-6 py-4">Lowest Snapshot Rate</th>
                  <th className="px-6 py-4">Snapshot Difference</th>
                  <th className="px-6 py-4">Plans in Snapshot</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {utilityRows.map(({ utility, best, savings, count }, i) => (
                  <tr
                    key={utility.id}
                    className={i < utilityRows.length - 1 ? 'border-b border-ink/5' : ''}
                  >
                    <td className="px-6 py-4 font-semibold text-ink">{utility.name}</td>
                    <td className="px-6 py-4 text-ink/70">{utility.serviceArea}</td>
                    <td className="px-6 py-4 font-mono text-ink">
                      {formatRate(utility.priceToCompare)}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {best ? (
                        <span
                          className={
                            best.ratePerKwh < utility.priceToCompare
                              ? 'text-emerald-600 font-semibold'
                              : 'text-red-500'
                          }
                        >
                          {formatRate(best.ratePerKwh)}
                        </span>
                      ) : (
                        <span className="text-ink/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {savings ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          ↓ {savings}¢/kWh in snapshot
                        </span>
                      ) : (
                        <span className="text-ink/40 text-xs">No lower snapshot rate</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink/70">{count} plans</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/compare?utility=${utility.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-sea px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-ink/50">
            Snapshot difference is the stored PTC minus the lowest stored supplier rate. It is not a guaranteed savings quote and does not include every bill component.
          </p>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Fixed vs. variable rate plans
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-card backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Fixed Rate
                </span>
                <span className="text-sm text-ink/50">Contract-priced certainty</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Supply rate is fixed for the stated contract term</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Easier to budget the supply portion of the bill</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Early termination fees or renewal terms may apply</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> A lower market offer can appear during the term</li>
              </ul>
              <p className="mt-4 text-xs text-ink/50">
                Verify the current contract term, fee schedule, renewal language, and applicable utility benchmark.
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-card backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Variable Rate
                </span>
                <span className="text-sm text-ink/50">Rate can change under contract terms</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> May offer short commitment or flexibility</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Supply price can change from month to month</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Introductory pricing can differ from later pricing</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Harder to forecast future supply cost</li>
              </ul>
              <p className="mt-4 text-xs text-ink/50">
                Read the current supplier disclosure carefully before treating an introductory or variable rate as durable savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: 'What is the Price to Compare in Ohio?',
                a: 'The Price to Compare (PTC) is the utility default generation benchmark used to compare competitive supplier offers. It changes, so verify the current value before enrolling.',
              },
              {
                q: 'Will my utility still deliver my electricity if I switch suppliers?',
                a: 'Yes. The utility continues to own the local delivery system and handle outages. Choosing a supplier changes the generation supply arrangement, subject to the current contract.',
              },
              {
                q: 'How should I use Ohio Power Picker?',
                a: `Use the ${rateSnapshot.supplierOffersLabel} supplier snapshot to understand the kinds of offers and terms in the market, then verify the current offer on PUCO Apples to Apples and with the supplier before enrolling.`,
              },
              {
                q: 'Are there fees to switch electricity suppliers?',
                a: 'Fees and eligibility vary by supplier and contract. Check enrollment, early-termination, renewal, and other disclosed terms for the specific current offer.',
              },
              {
                q: 'How often do rates change?',
                a: 'Supplier offers and utility benchmarks can change. Treat any stored comparison as a point-in-time snapshot rather than a live quote.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur"
              >
                <h3 className="text-base font-semibold text-ink">{item.q}</h3>
                <p className="mt-2 text-sm text-ink/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/70 p-10 text-center shadow-card backdrop-blur">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Ready to screen your options?
          </h2>
          <p className="mt-3 text-sm text-ink/70">
            Compare the archived snapshot, then confirm the current utility benchmark and supplier offer before you make a switch.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sea px-8 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Review my electricity options →
          </Link>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <EmailCapture />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
