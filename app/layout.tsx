import type { Metadata } from 'next';
import { GoogleAnalytics } from '@/components/google-analytics';
import { SITE_URL } from '@/lib/site';
import './globals.css';
import './fonts.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: new URL('.', SITE_URL),
  },
  title: 'Ohio Power Picker',
  description: 'Compare Ohio electricity suppliers and find lower rates in minutes.',
  openGraph: {
    type: 'website',
    title: 'Ohio Power Picker',
    description: 'Compare Ohio electricity suppliers and find lower rates in minutes.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohio Power Picker',
    description: 'Compare Ohio electricity suppliers and find lower rates in minutes.',
    images: ['/og-image.png'],
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/8760c4774489e4ba-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/af4bf8399d1aacdf-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans"
        style={{ fontFamily: 'var(--font-manrope), ui-sans-serif, system-ui' }}>
        <GoogleAnalytics />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
