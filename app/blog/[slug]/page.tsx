import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts, blogSlugs, getBlogPost } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

type PageParams = {
  slug: string;
};

export const generateStaticParams = () =>
  blogSlugs.map((slug) => ({ slug }));

export const generateMetadata = ({
  params,
}: {
  params: PageParams;
}): Metadata => {
  const post = getBlogPost(params.slug);
  if (!post) {
    return {
      title: `Article Not Found | ${SITE_NAME}`,
      description: 'The requested Ohio electricity article could not be found.',
    };
  }

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
};

export default function BlogPostPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams?: { zip?: string; utility?: string };
}) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <main className="pb-16">
      <SiteHeader zip={zip} utility={utilityId} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="px-5 pt-10 md:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/75 p-8 shadow-card backdrop-blur md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sea text-white hover:bg-sea">{formatDate(post.date)}</Badge>
            <Badge variant="outline" className="border-sea/20 text-ink/70">
              {post.readingTime} min read
            </Badge>
            <Badge variant="outline" className="border-sea/20 text-ink/70">
              {post.author}
            </Badge>
          </div>

          <h1
            className="mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {post.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-ink/75">{post.description}</p>

          <div className="mt-8 space-y-6 text-[15px] leading-7 text-ink/85 md:text-base md:leading-8">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2
                    className="mt-10 text-2xl font-semibold text-ink"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 text-lg font-semibold text-ink">{children}</h3>
                ),
                p: ({ children }) => <p className="text-ink/80">{children}</p>,
                a: ({ href, children }) => (
                  <Link
                    href={href ?? '#'}
                    className="font-semibold text-sea underline decoration-sea/40 underline-offset-4"
                  >
                    {children}
                  </Link>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <Card className="mt-10 rounded-3xl border-sea/10 bg-mist shadow-none">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Take the next step</p>
                <p className="mt-2 text-sm text-ink/75">
                  Use your ZIP code and utility to compare Ohio plans in minutes.
                </p>
              </div>
              <Button asChild className="rounded-full bg-sea text-white hover:bg-leaf">
                <Link href="/compare">Compare live Ohio rates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </article>

      <section className="px-5 pt-8 md:px-10">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <Link
              key={relatedPost.slug}
              href={`/blog/${relatedPost.slug}`}
              className="rounded-3xl border border-white/60 bg-white/70 p-5 text-sm text-ink/80 shadow-card backdrop-blur transition hover:border-sea/30"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Related guide</p>
              <p className="mt-2 font-semibold text-ink">{relatedPost.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
