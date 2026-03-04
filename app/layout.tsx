import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ohiopowerpicker.com';
const siteTitle = 'Ohio Power Picker — Find Cheaper Electricity Rates in Ohio';
const siteDescription =
  'Compare Ohio electricity suppliers against your utility default rate. 72% of offers cost more — we find the ones that actually save you money.';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700']
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: siteUrl,
    siteName: 'Ohio Power Picker'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} font-sans`}
        style={{ fontFamily: 'var(--font-manrope), ui-sans-serif, system-ui' }}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
