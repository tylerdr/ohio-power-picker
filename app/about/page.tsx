import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { utilities } from '@/lib/utilities';
import { utilityPageConfigs } from '@/lib/utility-pages';

export default function AboutPage({
  searchParams
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';
  const routeByUtilityId = Object.fromEntries(
    utilityPageConfigs.map((config) => [config.utilityId, config.slug])
  );

  return (
    <main className="pb-16">
      <SiteHeader zip={zip} utility={utilityId} />
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">About</p>
            <h1 className="mt-4 text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Ohio electricity choice, simplified.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Ohio has a deregulated electricity market. Your utility still delivers power, but you can choose the supplier that provides the energy. The default utility rate is called the “Price to Compare.”
            </p>
            <p className="mt-4 text-base text-ink/70">
              Ohio Power Picker compares supplier offers against the Price to Compare and helps homeowners avoid variable rates or surprise fees.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Utility Territories
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              These are the primary Ohio service territories supported in the MVP.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/80">
              {utilities.map((utility) => (
                <li key={utility.id} className="rounded-2xl bg-mist p-4">
                  <p className="font-semibold text-ink">
                    {routeByUtilityId[utility.id] ? (
                      <Link href={`/rates/${routeByUtilityId[utility.id]}`} className="hover:text-sea">
                        {utility.name}
                      </Link>
                    ) : (
                      utility.name
                    )}
                  </p>
                  <p className="text-xs text-ink/60">{utility.serviceArea}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Data & methodology
          </h2>
          <div className="mt-4 grid gap-4 text-sm text-ink/70 md:grid-cols-2">
            <p>
              Supplier offers are seed data modeled after typical Apples to Apples listings. Rates, term lengths, and fees are representative and should be verified before enrolling.
            </p>
            <p>
              We plan to refresh data via the official EnergyChoice listings. The MVP ships with a local JSON dataset for speed and simplicity.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
