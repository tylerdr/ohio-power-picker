'use client';

import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/lib/types';

type LeadCaptureModalProps = {
  supplier: Supplier;
  utility: string;
  estimatedKwh: number;
  yearlySavings: number;
  onClose: () => void;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function LeadCaptureModal({
  supplier,
  utility,
  estimatedKwh,
  yearlySavings,
  onClose,
}: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierRate: supplier.ratePerKwh,
          utility,
          estimatedKwh,
          yearlySavings,
          submittedAt: new Date().toISOString(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit your request right now.');
      }

      setStatus('success');
      setMessage('✅ Your request has been submitted! A switching specialist will contact you within 24 hours.');

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit right now. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink/50 transition hover:bg-mist hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Switch Request</p>
          <h2
            className="mt-2 text-2xl font-semibold text-ink md:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Get {supplier.name}
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Fill out this form and a licensed energy specialist will contact you to complete your enrollment
            with {supplier.name} at {(supplier.ratePerKwh * 100).toFixed(2)}¢/kWh.
          </p>
          <div className="mt-4 rounded-2xl bg-leaf/10 p-4">
            <p className="text-sm font-semibold text-leaf">
              Estimated yearly savings: ${Math.abs(yearlySavings).toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-ink/70">
              Based on {estimatedKwh.toLocaleString()} kWh/month usage in {utility} territory.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-ink">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-ink">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                placeholder="(555) 123-4567"
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-ink">
              Service Address <span className="text-danger">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              placeholder="123 Main Street"
              className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-ink">
                City <span className="text-danger">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-ink">
                ZIP Code <span className="text-danger">*</span>
              </label>
              <input
                id="zip"
                type="text"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                required
                pattern="[0-9]{5}"
                placeholder="43215"
                className="mt-1 w-full rounded-2xl border border-sea/20 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-mist p-4 text-xs text-ink/70">
            <p className="font-semibold text-ink">What happens next?</p>
            <ul className="mt-2 space-y-1">
              <li>• A licensed energy specialist will call or email you within 24 hours</li>
              <li>• They'll verify your eligibility and answer any questions</li>
              <li>• If you decide to proceed, they'll complete your enrollment</li>
              <li>• Your new rate starts on your next billing cycle</li>
            </ul>
          </div>

          {status === 'success' && (
            <div className="rounded-2xl bg-leaf/10 p-4 text-sm font-medium text-leaf">
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border-sea/20 bg-white px-6"
              disabled={status === 'submitting'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-sea px-8 text-white hover:bg-leaf"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting...' : 'Request This Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
