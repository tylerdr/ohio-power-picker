import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { GoogleAnalytics } from '@/components/google-analytics';
import './globals.css';

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
  title: 'Ohio Power Picker',
  description: 'Compare Ohio electricity suppliers and find lower rates in minutes.'
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
        <GoogleAnalytics />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
