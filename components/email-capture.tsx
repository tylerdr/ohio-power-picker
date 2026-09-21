import { Button } from '@/components/ui/button';

const rateQuestionHref =
  'mailto:tai@sprinterconsulting.com?subject=Ohio%20electricity%20rate%20question&body=Ohio%20ZIP%20code%3A%0AElectric%20utility%3A%0A';

export default function EmailCapture() {
  return (
    <section
      aria-labelledby="rate-alert-heading"
      className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Rate Alerts</p>
          <h2
            id="rate-alert-heading"
            className="mt-2 text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Automatic rate alerts are unavailable right now
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            You can still compare the listed offers above. For a manual question, email us your Ohio ZIP code and electric utility. This link does not create an alert subscription.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf"
        >
          <a href={rateQuestionHref}>Email a rate question</a>
        </Button>
      </div>
    </section>
  );
}
