import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSuppliersForUtility } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { utilityMap } from '@/lib/utilities';
import { cityPageConfigs, cityPageMap } from '@/lib/city-pages';
import { formatRate } from '@/lib/utils';

type PageParams = {
  city: string;
};

const utilitySlugMap: Record<string, string> = {
  'aep-ohio': 'aep-ohio',
  'duke-energy': 'duke-energy',
  'ohio-edison': 'ohio-edison',
  'aes-ohio': 'dayton-power-light',
  'toledo-edison': 'toledo-edison',
  illuminating: 'illuminating-company',
};

export const generateStaticParams = () =>
  cityPageConfigs.map((config) => ({ city: config.slug }));

export const generateMetadata = ({
  params,
}: {
  params: PageParams;
}): Metadata => {
  const config = cityPageMap[params.city];

  if (!config) {
    return {
      title: `City Not Found | ${SITE_NAME}`,
      description: 'The requested Ohio city rate page was not found.',
    };
  }

  return {
    title: `${config.pageTitle} | ${SITE_NAME}`,
    description: config.metaDescription,
    openGraph: {
      title: `${config.pageTitle} | ${SITE_NAME}`,
      description: config.metaDescription,
      url: `${SITE_URL}/cities/${config.slug}`,
      type: 'website',
    },
  };
};

export default function CityRatesPage({
  params,
}: {
  params: PageParams;
}) {
  const config = cityPageMap[params.city];

  if (!config) {
    notFound();
  }

  const utility = utilityMap[config.utilityId];
  if (!utility) {
    notFound();
  }

  const utilityPageSlug = utilitySlugMap[config.utilityId];

  const suppliers = getSuppliersForUtility(config.utilityId)
    .filter((supplier) => supplier.termMonths > 0)
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh);

  const bestFixed = suppliers
    .filter((supplier) => supplier.rateType === 'fixed')
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh)[0];

  const bestGreen = suppliers
    .filter((supplier) => supplier.renewablePercent >= 50)
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh)[0];

  const compareHref = `/compare?utility=${config.utilityId}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cities',
        item: `${SITE_URL}/cities`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${config.cityName} Electricity Rates`,
        item: `${SITE_URL}/cities/${config.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main className="pb-16">
      <Suspense>
        <SiteHeader />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/75 p-8 shadow-card backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sea text-white hover:bg-sea">{config.cityName}, Ohio</Badge>
            <Badge variant="outline" className="border-sea/20 text-ink/70">
              {utility.name}
            </Badge>
            <Badge variant="outline" className="border-sea/20 text-ink/70">
              {config.county} County
            </Badge>
          </div>

          <h1
            className="mt-4 text-3xl font-semibold text-ink md:text-4xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {config.pageTitle}
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-ink/75 md:text-base">
            {config.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-sea text-white hover:bg-leaf">
              <Link href={compareHref}>Compare suppliers in {config.cityName}</Link>
            </Button>
            {utilityPageSlug && (
              <Button asChild variant="outline" className="rounded-full border-sea/20 bg-white">
                <Link href={`/rates/${utilityPageSlug}`}>
                  See all {utility.name} suppliers
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Utility benchmark</CardTitle>
              <CardDescription className="text-ink/70">
                {utility.name} Price to Compare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-semibold text-ink"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {formatRate(utility.priceToCompare)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Lowest fixed plan</CardTitle>
              <CardDescription className="text-ink/70">
                Best fixed rate in {utility.name} territory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-ink">
                {bestFixed ? bestFixed.name : 'Not available'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-leaf">
                {bestFixed ? formatRate(bestFixed.ratePerKwh) : '\u2014'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Available suppliers</CardTitle>
              <CardDescription className="text-ink/70">
                Current listings for {config.cityName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-semibold text-ink"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {suppliers.length}
              </p>
              <p className="mt-1 text-sm text-ink/70">
                Serving {utility.name} territory including {config.cityName}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Top suppliers for {config.cityName}
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            These suppliers serve {config.cityName} through the {utility.name} territory.
            Rates shown are for residential generation supply.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Rate</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Term</th>
                  <th className="pb-3">Renewable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea/10 text-ink/80">
                {suppliers.slice(0, 6).map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="py-3 font-medium">{supplier.name}</td>
                    <td className="py-3">{formatRate(supplier.ratePerKwh)}</td>
                    <td className="py-3 capitalize">{supplier.rateType}</td>
                    <td className="py-3">{supplier.termMonths} months</td>
                    <td className="py-3">{supplier.renewablePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-mist p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Best green option</p>
              <p className="mt-1">
                {bestGreen
                  ? `${bestGreen.name} at ${formatRate(bestGreen.ratePerKwh)} (${bestGreen.renewablePercent}% renewable).`
                  : 'No high-renewable supplier currently listed.'}
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">City details</p>
              <p className="mt-1">
                {config.cityName} is located in {config.county} County with a population of approximately {config.population}.
              </p>
            </div>
          </div>

          {utilityPageSlug && (
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-full border-sea/20">
                <Link href={`/rates/${utilityPageSlug}`}>
                  View all {utility.name} territory rates and details
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Frequently asked questions
          </h2>
          <div className="mt-5 grid gap-4">
            {config.faq.map((item) => (
              <div key={item.question} className="rounded-2xl bg-mist p-4">
                <h3 className="text-sm font-semibold text-ink md:text-base">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Other Ohio cities
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            Compare electricity rates in other Ohio cities and utility territories.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cityPageConfigs
              .filter((c) => c.slug !== config.slug)
              .slice(0, 12)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}`}
                  className="rounded-2xl border border-sea/10 bg-mist px-4 py-3 text-sm font-medium text-ink transition hover:border-sea/30 hover:text-sea"
                >
                  {c.cityName}
                </Link>
              ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="rounded-full border-sea/20">
              <Link href="/cities">View all Ohio cities</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
