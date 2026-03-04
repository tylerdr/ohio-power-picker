'use client';

import { FormEvent, useState } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to subscribe right now.');
      }

      setStatus('success');
      setMessage(payload.message || 'You are subscribed for rate alerts.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to subscribe right now.');
    }
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur md:p-8">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Rate Alerts</p>
          <h2
            className="mt-2 text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Get notified when better rates appear in your area
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            We will email you when a lower plan shows up for your utility, so you can switch at the right time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="sr-only" htmlFor="rate-alert-email">
            Email address
          </label>
          <input
            id="rate-alert-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="rounded-full border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'submitting' ? 'Submitting...' : 'Get Rate Alerts'}
          </button>
          {status === 'success' && (
            <p className="rounded-2xl bg-leaf/10 px-4 py-2 text-sm font-medium text-leaf">{message}</p>
          )}
          {status === 'error' && (
            <p className="rounded-2xl bg-danger/10 px-4 py-2 text-sm font-medium text-danger">{message}</p>
          )}
        </form>
      </div>
    </section>
  );
}
