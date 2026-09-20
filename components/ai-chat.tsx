'use client';

import { useMemo } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { Supplier } from '@/lib/types';
import { formatCurrencyPrecise, formatRate } from '@/lib/utils';
import { rateSnapshot } from '@/lib/rate-snapshot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AVG_KWH = 900;

type Props = {
  utilityName: string;
  priceToCompare: number;
  suppliers: Supplier[];
  zip: string | null;
};

export default function AIChat({ utilityName, priceToCompare, suppliers, zip }: Props) {
  const context = useMemo(() => {
    const supplierLines = suppliers
      .map((supplier) => {
        return `- ${supplier.name} | stored rate ${formatRate(supplier.ratePerKwh)} | ${supplier.termMonths} months | ${supplier.rateType} | ${supplier.renewablePercent}% renewable | stored ETF ${formatCurrencyPrecise(supplier.earlyTerminationFee)} | intro ${supplier.introRateMonths ?? 'none'} months | territories ${supplier.utilityTerritories.join(', ')} | notes: ${supplier.notes}`;
      })
      .join('\n');

    return `DATA STATUS: archived screening context only. Supplier offers were scraped ${rateSnapshot.supplierOffersLabel}. The utility Price to Compare is a static repository value and has not been verified live. Do not represent any plan, rate, savings estimate, availability, or utility benchmark as current. Direct users to PUCO Apples to Apples and the supplier to verify current terms before enrollment.\nUtility: ${utilityName}\nZip: ${zip ?? 'unknown'}\nStored Price to Compare: ${formatRate(priceToCompare)}\nUsage assumption: ${AVG_KWH} kWh/month\nArchived suppliers:\n${supplierLines}`;
  }, [suppliers, utilityName, priceToCompare, zip]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: { context }
  });

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">AI Snapshot Explainer</p>
        <h3 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
          Ask about the stored plan terms
        </h3>
        <p className="text-sm text-ink/70">
          The assistant can explain this {rateSnapshot.supplierOffersLabel} snapshot, but it cannot verify current rates or enrollment availability.
        </p>
      </div>

      <div className="mt-5 flex h-[420px] flex-col gap-4 overflow-y-auto rounded-2xl border border-sea/10 bg-white p-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-sea/10 bg-mist p-4 text-sm text-ink/70">
            Try questions like “What does this early termination fee mean?” or “Which stored plans are variable?”
          </div>
        )}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                isUser ? 'ml-auto bg-sea text-white' : 'bg-mist text-ink'
              }`}
            >
              {isUser ? (
                <p className="leading-relaxed">{message.content}</p>
              ) : (
                <div className="space-y-2">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="ml-5 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="ai-chat-input" className="sr-only">
            Ask a question
          </Label>
          <Input
            id="ai-chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about stored rate type, term, or fees..."
            className="h-auto w-full rounded-2xl border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus-visible:ring-sea"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          disabled={isLoading || !input.trim()}
          className="h-auto rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf hover:text-white disabled:opacity-60"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-danger">Chat failed. Please try again.</p>
      )}
    </section>
  );
}
