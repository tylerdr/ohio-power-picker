import Link from 'next/link';
import AssessmentPreparer from '@/components/assessment-preparer';
import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Broker comparison feasibility assessment | Ohio Power Picker',
  description: 'A bounded proposal to assess one Ohio comparison journey, its source data and attribution gaps.',
  robots: { index: false, follow: false },
};

export default function BrokerAssessmentPage() {
  return (
    <main className="pb-16">
      <Suspense fallback={<div className="h-20" />}><SiteHeader zip="" utility="" /></Suspense>
      <section className="mx-auto max-w-5xl px-5 py-12 md:px-10">
        <p className="text-sm font-semibold text-sea">For Ohio energy brokers · proposed pilot</p>
        <h1 className="mt-4 text-3xl font-semibold text-ink md:text-5xl">Decide whether a clearer comparison journey is worth building.</h1>
        <p className="mt-5 text-lg text-ink/70">Before investing in a widget or referral funnel, identify the data, measurement and delivery prerequisites for one utility territory.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border bg-white p-6">
            <h2 className="text-2xl font-semibold">$500 once · proposed assessment</h2>
            <p className="mt-3">One territory, one journey, one reporting period. Maximum eight delivery hours and one active pilot. Availability and written terms must be confirmed before payment.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Source and freshness matrix</li>
              <li>Aggregate funnel baseline or explicit measurement gaps</li>
              <li>Referral versus embedded-tool feasibility</li>
              <li>Go/no-go memo with prerequisites and one factual-correction pass</li>
            </ul>
            <p className="mt-4 text-sm text-ink/70">Excludes software development, ongoing feeds, enrollment, consumer records, legal advice and promised savings or conversion lift.</p>
          </article>
          <article className="rounded-3xl border bg-white p-6">
            <h2 className="text-2xl font-semibold">Review the output first</h2>
            <p className="mt-3">The worked sample uses public source evidence. It is a demonstration of the assessment format, not a current-offer recommendation or a customer result.</p>
            <Button asChild className="mt-5"><a href="/broker-assessment-sample.md" download>Download worked sample</a></Button>
            <h3 className="mt-6 font-semibold">A scoped agreement comes before payment</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Review the intake checklist; share aggregate information only.</li>
              <li>Agree the buyer, scope, available delivery slot, acceptance and cancellation/refund terms.</li>
              <li>Receive a verified invoice through the agreed payment method.</li>
              <li>Receive the report through the agreed private delivery channel.</li>
            </ol>
          </article>
        </div>
        <AssessmentPreparer />
        <section className="mt-8 rounded-3xl bg-mist p-6">
          <h2 className="text-xl font-semibold">Prepare a scope request</h2>
          <p className="mt-3">Include your business website, utility territory, the decision you need to make, and whether dated aggregate funnel counts are available. Do not send utility bills, customer lists, account numbers, credentials or payment details.</p>
          <Button asChild className="mt-5"><a href="mailto:tai@sprinterconsulting.com?subject=Ohio%20broker%20assessment%20scope">Request scope and availability</a></Button>
          <p className="mt-3 text-sm">This opens your email app; nothing is submitted automatically. No checkout or paid access is active here. A request creates no contract, reservation or response-time commitment.</p>
          <p className="mt-4 text-sm">Support and receipt/report recovery: tai@sprinterconsulting.com. For an agreed engagement, provide its reference ID only; do not email card details. Delivery and recovery procedures must be confirmed in the written scope before payment.</p>
        </section>
        <p className="mt-8 text-sm text-ink/70">The public comparison remains free and uses an archived supplier snapshot. <Link href="/">Return to comparison</Link>.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
