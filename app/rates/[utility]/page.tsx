import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSuppliersForUtility } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { utilityMap } from '@/lib/utilities';
import { utilityPageConfigs, utilityPageMap } from '@/lib/utility-pages';
import { formatRate } from '@/lib/utils';

type PageParams = {
  utility: string;
};

export const generateStaticParams = () =>
  utilityPageConfigs.map((config) => ({ utility: config.slug }));

export const generateMetadata = ({
  params,
}: {
  params: PageParams;
}): Metadata => {
  const config = utilityPageMap[params.utility];

  if (!config) {
    return {
      title: `Utility Not Found | ${SITE_NAME}`,
      description: 'The requested Ohio utility rate page was not found.',
    };
  }

  return {
    title: `${config.pageTitle} | ${SITE_NAME}`,
    description: `Compare ${config.utilityName} default pricing against competitive supplier plans and review territory guidance for Ohio residential customers.`,
    openGraph: {
      title: `${config.pageTitle} | ${SITE_NAME}`,
      description: `Compare ${config.utilityName} default pricing against competitive supplier plans in Ohio.`,
      url: `${SITE_URL}/rates/${config.slug}`,
      type: 'website',
    },
  };
};

export default function UtilityRatesPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams?: { zip?: string; utility?: string };
}) {
  const config = utilityPageMap[params.utility];

  if (!config) {
    notFound();
  }

  const utility = utilityMap[config.utilityId];
  if (!utility) {
    notFound();
  }

  const suppliers = getSuppliersForUtility(config.utilityId)
    .filter((supplier) => supplier.termMonths > 0)
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh);

  const bestFixed = suppliers
    .filter((supplier) => supplier.rateType === 'fixed')
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh)[0];

  const bestGreen = suppliers
    .filter((supplier) => supplier.renewablePercent >= 50)
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh)[0];

  const lowestVariable = getSuppliersForUtility(config.utilityId)
    .filter((supplier) => supplier.rateType === 'variable' && supplier.termMonths > 0)
    .sort((a, b) => a.ratePerKwh - b.ratePerKwh)[0];

  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? config.utilityId;

  const compareParams = new URLSearchParams();
  compareParams.set('utility', config.utilityId);
  if (zip) compareParams.set('zip', zip);
  const compareHref = `/compare?${compareParams.toString()}`;

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
      <SiteHeader zip={zip} utility={utilityId} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/75 p-8 shadow-card backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sea text-white hover:bg-sea">Utility Territory</Badge>
            <Badge variant="outline" className="border-sea/20 text-ink/70">
              {config.utilityName}
            </Badge>
          </div>

          <h1
            className="mt-4 text-3xl font-semibold text-ink md:text-4xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {config.pageTitle}
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-ink/75 md:text-base">
            {config.territorySummary}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-sea text-white hover:bg-leaf">
              <Link href={compareHref}>Compare suppliers for this utility</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-sea/20 bg-white">
              <Link href="/blog">Read Ohio rate guides</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Typical benchmark</CardTitle>
              <CardDescription className="text-ink/70">
                Utility Price to Compare for residential supply.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                {formatRate(utility.priceToCompare)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Lowest fixed plan</CardTitle>
              <CardDescription className="text-ink/70">Competitive fixed-rate option in this territory.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-ink">{bestFixed ? bestFixed.name : 'Not available'}</p>
              <p className="mt-1 text-2xl font-semibold text-leaf">{bestFixed ? formatRate(bestFixed.ratePerKwh) : '—'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-ink">Available suppliers</CardTitle>
              <CardDescription className="text-ink/70">Current listings in this service territory.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                {suppliers.length}
              </p>
              <p className="mt-1 text-sm text-ink/70">{config.suppliersNote}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Territory profile
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            Major cities and communities commonly associated with this utility territory:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {config.majorCities.map((city) => (
              <Badge key={city} variant="outline" className="border-sea/20 text-ink/80">
                {city}
              </Badge>
            ))}
          </div>

          <Separator className="my-6 bg-sea/10" />

          <h3 className="text-lg font-semibold text-ink">Top supplier snapshot</h3>
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
                {suppliers.slice(0, 8).map((supplier) => (
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
              <p className="font-semibold text-ink">Lowest variable offer</p>
              <p className="mt-1">
                {lowestVariable
                  ? `${lowestVariable.name} at ${formatRate(lowestVariable.ratePerKwh)}. Monitor monthly because variable pricing can change.`
                  : 'No variable offers currently listed.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Frequently asked questions
          </h2>
          <div className="mt-5 grid gap-4">
            {config.faq.map((item) => (
              <div key={item.question} className="rounded-2xl bg-mist p-4">
                <h3 className="text-sm font-semibold text-ink md:text-base">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Compare other Ohio utility territories
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            Utility territories affect supplier availability. Review other areas if you are moving
            or managing more than one property.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {utilityPageConfigs
              .filter((item) => item.slug !== config.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/rates/${item.slug}`}
                  className="rounded-2xl border border-sea/10 bg-mist px-4 py-3 text-sm font-medium text-ink transition hover:border-sea/30 hover:text-sea"
                >
                  {item.utilityName}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
