import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { utilityMap } from '@/lib/utilities';
import { cityPageConfigs } from '@/lib/city-pages';

export const metadata: Metadata = {
  title: `Ohio City Electricity Rates — All Cities | ${SITE_NAME}`,
  description:
    'Browse electricity rates and supplier comparisons for 60+ Ohio cities. Find your city and compare competitive electricity plans.',
  openGraph: {
    title: `Ohio City Electricity Rates — All Cities | ${SITE_NAME}`,
    description:
      'Browse electricity rates and supplier comparisons for 60+ Ohio cities.',
    url: `${SITE_URL}/cities`,
    type: 'website',
  },
};

const utilitySections = [
  { utilityId: 'aep-ohio', label: 'AEP Ohio' },
  { utilityId: 'duke-energy', label: 'Duke Energy Ohio' },
  { utilityId: 'ohio-edison', label: 'Ohio Edison (FirstEnergy)' },
  { utilityId: 'aes-ohio', label: 'AES Ohio (Dayton Power & Light)' },
  { utilityId: 'toledo-edison', label: 'Toledo Edison (FirstEnergy)' },
  { utilityId: 'illuminating', label: 'The Illuminating Company (FirstEnergy)' },
];

export default function CitiesIndexPage() {
  return (
    <main className="pb-16">
      <Suspense>
        <SiteHeader />
      </Suspense>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/75 p-8 shadow-card backdrop-blur">
          <Badge className="bg-sea text-white hover:bg-sea">All Cities</Badge>
          <h1
            className="mt-4 text-3xl font-semibold text-ink md:text-4xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Ohio City Electricity Rates
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-ink/75 md:text-base">
            Browse electricity supplier comparisons for cities across Ohio. Each city page shows
            which utility serves the area, top supplier rates, and answers to common questions
            about switching providers.
          </p>
        </div>
      </section>

      {utilitySections.map((section) => {
        const cities = cityPageConfigs
          .filter((c) => c.utilityId === section.utilityId)
          .sort((a, b) => a.cityName.localeCompare(b.cityName));

        if (cities.length === 0) return null;

        const utility = utilityMap[section.utilityId];

        return (
          <section key={section.utilityId} className="px-5 pt-8 md:px-10">
            <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
              <h2
                className="text-2xl font-semibold text-ink"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {section.label}
              </h2>
              {utility && (
                <p className="mt-2 text-sm text-ink/70">
                  {utility.serviceArea} &middot; Price to Compare:{' '}
                  {(utility.priceToCompare * 100).toFixed(2)}&cent;/kWh
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="rounded-2xl border border-sea/10 bg-mist px-4 py-3 transition hover:border-sea/30 hover:text-sea"
                  >
                    <p className="text-sm font-medium text-ink">{city.cityName}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{city.county} County</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <SiteFooter />
    </main>
  );
}
