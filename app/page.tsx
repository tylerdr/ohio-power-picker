import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ScamShield from '@/components/scam-shield';
import QuickQuiz from '@/components/quick-quiz';
import EmailCapture from '@/components/email-capture';
import { supplierData } from '@/lib/data';
import { utilities } from '@/lib/utilities';
import { formatRate } from '@/lib/utils';
import { rateSnapshot, rateSnapshotNotice } from '@/lib/rate-snapshot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function HomePage({
  searchParams
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ohioelectricityrates.com';
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ohio Power Picker',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'Compare an archived Ohio electricity supplier snapshot against static utility benchmarks, then verify current terms with PUCO before enrolling.',
    areaServed: 'Ohio',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';
  const compareQuery = new URLSearchParams();
  if (zip) compareQuery.set('zip', zip);
  if (utilityId) compareQuery.set('utility', utilityId);
  const compareHref = compareQuery.toString() ? `/compare?${compareQuery.toString()}` : '/compare';

  const utilityComparison = utilities.map((utility) => {
    const availableSuppliers = supplierData.filter((supplier) =>
      supplier.utilityTerritories.includes(utility.id)
    );
    const bestSupplier = availableSuppliers.reduce((best, supplier) => {
      if (!best || supplier.ratePerKwh < best.ratePerKwh) return supplier;
      return best;
    }, undefined as undefined | (typeof availableSuppliers)[number]);

    return {
      utility,
      bestSupplier
    };
  });

  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <SiteHeader zip={zip} utility={utilityId} />
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Ohio Power Picker</p>
            <h1 className="mt-4 text-4xl font-semibold text-ink md:text-5xl" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Screen electricity offers before you switch.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Ohio is deregulated, which means you can choose your electricity supplier. Use our archived PUCO-sourced snapshot to compare plan structure and estimated savings, then verify the current offer before enrolling.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-ink/70">
              <div className="rounded-2xl bg-sky/60 p-4">
                <p className="font-semibold text-ink">Archived PUCO supplier snapshot</p>
                <p>Supplier offers in the app were scraped {rateSnapshot.supplierOffersLabel}; they are not represented as live quotes.</p>
              </div>
              <div className="rounded-2xl bg-leaf/10 p-4">
                <p className="font-semibold text-ink">Plain-English screening</p>
                <p>Compare rate type, term length, fees, and estimated savings before checking the current contract.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Start your comparison
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Enter your zip code and select your current utility.
            </p>

            <form action="/compare" method="get" className="mt-6 grid gap-4">
              <div className="grid gap-2 text-sm font-medium text-ink">
                <Label htmlFor="zip-input" className="text-sm font-medium text-ink">
                  Zip code
                </Label>
                <Input
                  id="zip-input"
                  name="zip"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  placeholder="43215"
                  defaultValue={zip}
                  className="h-auto rounded-2xl border-sea/20 bg-white px-4 py-3 text-base text-ink shadow-sm focus-visible:ring-sea"
                  required
                />
              </div>
              <div className="grid gap-2 text-sm font-medium text-ink">
                <Label htmlFor="utility-select" className="text-sm font-medium text-ink">
                  Utility
                </Label>
                <Select
                  name="utility"
                  defaultValue={utilityId || undefined}
                  required
                >
                  <SelectTrigger
                    id="utility-select"
                    className="h-auto rounded-2xl border-sea/20 bg-white px-4 py-3 text-base text-ink shadow-sm focus:ring-sea data-[placeholder]:text-ink/50"
                  >
                    <SelectValue placeholder="Select your utility" />
                  </SelectTrigger>
                  <SelectContent>
                  {utilities.map((utility) => (
                    <SelectItem key={utility.id} value={utility.id}>
                      {utility.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                variant="ghost"
                className="h-auto rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf hover:text-white"
              >
                Compare snapshot
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-mist p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">Need help finding your utility?</p>
              <p className="mt-1">Look at the top of your electric bill, or check the utility service area list.</p>
              <Link href="/about" className="mt-3 inline-flex text-sm font-semibold text-sea">
                See utility territories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <QuickQuiz />
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <ScamShield variant="compact" />
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 1</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Enter zip + utility</h3>
              <p className="mt-2 text-sm text-ink/70">We match you to offers in the archived supplier dataset for that territory.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 2</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Screen the snapshot</h3>
              <p className="mt-2 text-sm text-ink/70">Compare rate type, term, fees, and estimated savings using the stored snapshot.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 3</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Verify before enrolling</h3>
              <p className="mt-2 text-sm text-ink/70">Confirm the current PTC and complete supplier terms with PUCO and the supplier.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Archived Statewide Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                Ohio utility comparison at a glance
              </h2>
              <p className="mt-2 text-sm text-ink/70">
                Supplier offers are from {rateSnapshot.supplierOffersLabel}; utility Price to Compare values are static repository values and may have changed.
              </p>
            </div>
            <Link
              href={compareHref}
              className="inline-flex items-center justify-center rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white"
            >
              Screen snapshot
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-ink/60">
                <tr>
                  <th className="pb-3">Utility</th>
                  <th className="pb-3">Stored Price to Compare</th>
                  <th className="pb-3">Lowest rate in snapshot</th>
                  <th className="pb-3">Snapshot supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea/10">
                {utilityComparison.map(({ utility, bestSupplier }) => (
                  <tr key={utility.id}>
                    <td className="py-3 font-semibold text-ink">{utility.name}</td>
                    <td className="py-3 text-ink/70">{formatRate(utility.priceToCompare)}</td>
                    <td className="py-3 text-ink/70">
                      {bestSupplier ? formatRate(bestSupplier.ratePerKwh) : 'No offers listed'}
                    </td>
                    <td className="py-3 text-ink/70">{bestSupplier ? bestSupplier.name : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
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
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <EmailCapture />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}