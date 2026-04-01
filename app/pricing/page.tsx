import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import EmailCapture from '@/components/email-capture';
import { utilities } from '@/lib/utilities';
import { getSuppliersForUtility } from '@/lib/data';
import { formatRate } from '@/lib/utils';

export const metadata = {
  title: 'Ohio Electricity Rate Plans — Compare Supplier Pricing | Ohio Electricity Rates',
  description:
    'Compare Ohio electricity rate plans by utility. See fixed vs. variable rates, price-to-compare benchmarks, and the lowest supplier offers available in your area.',
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
        ? ((utility.priceToCompare - best.ratePerKwh) * 1000).toFixed(2)
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
          text: 'The Price to Compare (PTC) is the default electricity generation rate set by your Ohio utility. It changes periodically. If you find a supplier offering a lower rate, switching can save money on your bill.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between a fixed and variable rate plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A fixed rate stays the same for your contract term (typically 6–24 months), giving you budget predictability. A variable rate changes monthly based on market prices — it can be lower in off-peak months but may spike in summer or winter.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I switch electricity suppliers in Ohio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the Ohio Power Picker comparison tool. Enter your zip code and utility, compare offers, then contact the supplier directly or sign up through their website. Your utility still delivers power and handles outages — only the generation charge changes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there fees to switch electricity suppliers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most Ohio suppliers offer no enrollment fee. Some contracts include an early termination fee (ETF) if you cancel before the term ends. Always check the supplier\'s contract terms before switching.',
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

      {/* Hero */}
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Ohio Electricity Pricing</p>
          <h1
            className="mt-3 text-4xl font-semibold text-ink md:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Compare Ohio electricity rate plans
          </h1>
          <p className="mt-4 text-base text-ink/70">
            Ohio&apos;s deregulated market gives you the power to choose. See current supplier rates
            versus your utility&apos;s default Price to Compare — and find out if you can save.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sea px-7 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Compare rates for my area →
          </Link>
        </div>
      </section>

      {/* How pricing works */}
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
                title: 'Your utility sets the default',
                body: 'Each Ohio utility publishes a Price to Compare (PTC) — the generation rate you pay if you don\'t choose a supplier. Utilities adjust these rates periodically.',
                icon: '🏛️',
              },
              {
                title: 'Suppliers compete for your bill',
                body: 'Under Ohio deregulation (PUCO), licensed competitive retail electric suppliers offer fixed and variable rate plans. Most are more expensive; a small subset beat the PTC.',
                icon: '⚡',
              },
              {
                title: 'We find the ones that save money',
                body: 'We pull live PUCO supplier data and compare every offer against your utility\'s current PTC. Green = savings. Red = overpriced. You decide.',
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

      {/* Rate table by utility */}
      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Current rates by Ohio utility
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Data sourced from PUCO Energy Choice. Rates shown in ¢/kWh.
          </p>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-white/60 bg-white/70 shadow-card backdrop-blur">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-[0.15em] text-ink/50">
                  <th className="px-6 py-4">Utility</th>
                  <th className="px-6 py-4">Service Area</th>
                  <th className="px-6 py-4">Price to Compare</th>
                  <th className="px-6 py-4">Best Supplier Rate</th>
                  <th className="px-6 py-4">Potential Savings</th>
                  <th className="px-6 py-4">Suppliers Available</th>
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
                          ↓ {savings}¢/kWh
                        </span>
                      ) : (
                        <span className="text-ink/40 text-xs">No savings found</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink/70">{count} plans</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/compare?utility=${utility.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-sea px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                      >
                        Compare →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-ink/40">
            Rates are updated regularly from PUCO data. Actual supplier offers may vary. Always verify pricing directly with the supplier before switching.
          </p>
        </div>
      </section>

      {/* Rate types explained */}
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
                <span className="text-sm text-ink/50">Budget-friendly certainty</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Rate locked for contract term (6–24 months)</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Predictable monthly bill</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Protection from market price spikes</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> May miss savings if market prices drop</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Early termination fees may apply</li>
              </ul>
              <p className="mt-4 text-xs text-ink/50">
                Best for: households on a budget, renters, anyone who wants zero bill surprises
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-card backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Variable Rate
                </span>
                <span className="text-sm text-ink/50">Market-priced flexibility</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Rate changes month-to-month with market</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Can be lower during mild weather months</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Usually no long-term commitment</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Bills can spike in summer/winter peaks</li>
                <li className="flex gap-2"><span className="text-red-400">✗</span> Harder to budget</li>
              </ul>
              <p className="mt-4 text-xs text-ink/50">
                Best for: energy-savvy households who track market prices, or short-term situations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
                a: 'The Price to Compare (PTC) is the default electricity generation rate set by your Ohio utility. It changes periodically. If you find a supplier offering a lower rate, switching can save money on your bill.',
              },
              {
                q: 'Will my utility still deliver my electricity if I switch suppliers?',
                a: 'Yes. Your utility (AEP Ohio, Duke Energy, Ohio Edison, etc.) still owns the wires and handles delivery, outage repairs, and billing. Switching a supplier only changes who generates the electricity — you won\'t notice any difference in service.',
              },
              {
                q: 'How do I switch electricity suppliers in Ohio?',
                a: 'Use the Ohio Power Picker comparison tool. Enter your zip code and utility, compare offers, then contact the supplier directly. The switch typically takes one billing cycle.',
              },
              {
                q: 'Are there fees to switch electricity suppliers?',
                a: 'Most Ohio suppliers charge no enrollment fee. Some contracts include an early termination fee (ETF) if you cancel early. Always check terms before signing.',
              },
              {
                q: 'How often do rates change?',
                a: 'Fixed rates are locked for your contract term. Variable rates change monthly. Utility Price to Compare rates are reviewed quarterly by PUCO.',
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

      {/* CTA */}
      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/70 p-10 text-center shadow-card backdrop-blur">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Ready to find a lower rate?
          </h2>
          <p className="mt-3 text-sm text-ink/70">
            Enter your zip code to see every available supplier in your area, compared against your
            utility&apos;s current Price to Compare.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sea px-8 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Compare my electricity rates →
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
