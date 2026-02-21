import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import AnalyticsContent from '@/components/analytics-content';
import historicalRates from '@/data/historical-rates.json';
import type { HistoricalRate } from '@/lib/types';

export default function AnalyticsPage({
  searchParams
}: {
  searchParams?: { zip?: string; utility?: string };
}) {
  const zip = searchParams?.zip ? searchParams.zip.trim() : '';
  const utilityId = searchParams?.utility ?? '';

  return (
    <main className="pb-16">
      <SiteHeader zip={zip} utility={utilityId} />
      <AnalyticsContent data={historicalRates as HistoricalRate[]} />
      <SiteFooter />
    </main>
  );
}
