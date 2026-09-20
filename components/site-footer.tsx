import { rateSnapshot } from '@/lib/rate-snapshot';

export default function SiteFooter() {
  return (
    <footer className="px-5 pb-10 pt-16 md:px-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 px-6 py-6 text-sm text-ink/70 shadow-card backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>
            Supplier offers are an archived PUCO-sourced snapshot from {rateSnapshot.supplierOffersLabel}; verify current rates and terms before enrolling.
          </p>
          <a
            href={rateSnapshot.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline underline-offset-2"
          >
            Check current PUCO offers
          </a>
        </div>
      </div>
    </footer>
  );
}
