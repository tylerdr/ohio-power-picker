import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import CompareContent from '@/components/compare-content';
import { getSuppliersForUtility } from '@/lib/data';
import { utilities, utilityMap } from '@/lib/utilities';

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

  const rawSuppliers = getSuppliersForUtility(utilityId);

  return (
    <main className="pb-16">
      <SiteHeader />
      <CompareContent
        utility={{
          id: utility.id,
          name: utility.name,
          serviceArea: utility.serviceArea,
          priceToCompare: utility.priceToCompare,
        }}
        rawSuppliers={rawSuppliers}
        zip={zip}
        allUtilities={utilities.map((u) => ({ id: u.id, name: u.name }))}
      />
      <SiteFooter />
    </main>
  );
}
