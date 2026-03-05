import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blogPosts } from '@/lib/blog';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

export const metadata: Metadata = {
  title: `Ohio Electricity Blog | ${SITE_NAME}`,
  description:
    'Ohio electricity shopping guides, utility territory explainers, and rate strategy articles for residential consumers.',
  openGraph: {
    title: `Ohio Electricity Blog | ${SITE_NAME}`,
    description:
      'Read practical Ohio electricity guides covering rates, utility territories, scams, and supplier switching.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

export default function BlogIndexPage({
  searchParams,
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';

  return (
    <main className="pb-16">
      <SiteHeader zip={zip} utility={utilityId} />

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Learning Center</p>
          <h1
            className="mt-3 text-3xl font-semibold text-ink md:text-4xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Ohio electricity guides for smarter supplier choices
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-ink/75 md:text-base">
            Use this library to compare fixed vs variable plans, understand utility territories,
            and avoid common enrollment mistakes. Every guide links back to the live comparison
            workflow so you can act on what you learn.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="ghost" className="rounded-full bg-sea px-5 py-2 text-white hover:bg-leaf hover:text-white">
              <Link href="/compare">Compare Ohio suppliers</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-sea/20 bg-white">
              <Link href="/rates/aep-ohio">Browse utility territory pages</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="rounded-3xl border-white/60 bg-white/70 shadow-card backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-sea text-white hover:bg-sea">{formatDate(post.date)}</Badge>
                  <Badge variant="outline" className="border-sea/20 text-ink/70">
                    {post.readingTime} min read
                  </Badge>
                </div>
                <CardTitle className="pt-2 text-xl text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  <Link href={`/blog/${post.slug}`} className="hover:text-sea">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-ink/75">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" className="rounded-full border-sea/20 bg-white">
                  <Link href={`/blog/${post.slug}`}>Read article</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Why these guides exist
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">
            {SITE_DESCRIPTION}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/rates/duke-energy', label: 'Duke Energy Ohio rates' },
              { href: '/rates/ohio-edison', label: 'Ohio Edison rates' },
              { href: '/rates/dayton-power-light', label: 'Dayton Power & Light rates' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-sea/10 bg-mist px-4 py-3 text-sm font-medium text-ink transition hover:border-sea/30 hover:text-sea"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
