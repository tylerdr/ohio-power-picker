'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { utilities } from '@/lib/utilities';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/about', label: 'About' }
];

type Props = {
  zip?: string;
  utility?: string;
};

export default function SiteHeader({ zip, utility }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentZip = (searchParams?.get('zip') ?? zip ?? '').trim();
  const currentUtility = searchParams?.get('utility') ?? utility ?? '';
  const utilityLabel = utilities.find((item) => item.id === currentUtility)?.name
    ?? (currentUtility ? 'Selected utility' : '');

  const selectionParams = useMemo(() => {
    const params = new URLSearchParams();
    if (currentZip) params.set('zip', currentZip);
    if (currentUtility) params.set('utility', currentUtility);
    return params;
  }, [currentZip, currentUtility]);

  const selectionQuery = selectionParams.toString();
  const compareHref = selectionQuery ? `/compare?${selectionQuery}` : '/compare';

  const [menuOpen, setMenuOpen] = useState(false);
  const [draftZip, setDraftZip] = useState(currentZip);
  const [draftUtility, setDraftUtility] = useState(currentUtility);

  useEffect(() => {
    setDraftZip(currentZip);
    setDraftUtility(currentUtility);
  }, [currentZip, currentUtility]);

  const selectionLabel = currentZip && currentUtility
    ? `${currentZip} · ${utilityLabel}`
    : 'Set zip + utility';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    const nextZip = draftZip.trim();

    if (nextZip) {
      params.set('zip', nextZip);
    } else {
      params.delete('zip');
    }

    if (draftUtility) {
      params.set('utility', draftUtility);
    } else {
      params.delete('utility');
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setMenuOpen(false);
  };

  const buildHref = (href: string) => {
    if (href === '/compare') return compareHref;
    if (!selectionQuery) return href;
    return `${href}?${selectionQuery}`;
  };

  return (
    <header className="px-5 pt-6 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 px-4 py-3 shadow-card backdrop-blur md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sea text-white font-semibold">OP</span>
          <span style={{ fontFamily: 'var(--font-fraunces), serif' }}>Ohio Power Picker</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink/70">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className="rounded-full px-3 py-1.5 transition hover:bg-sea/10 hover:text-sea"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full border border-sea/20 bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-sea"
              aria-expanded={menuOpen}
            >
              {selectionLabel}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-72 rounded-3xl border border-white/60 bg-white p-5 shadow-card">
                <form onSubmit={handleSubmit} className="grid gap-3 text-sm text-ink">
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Zip code
                    <input
                      value={draftZip}
                      onChange={(event) => setDraftZip(event.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      placeholder="43215"
                      className="rounded-2xl border border-sea/20 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Utility
                    <select
                      value={draftUtility}
                      onChange={(event) => setDraftUtility(event.target.value)}
                      className="rounded-2xl border border-sea/20 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-sea focus:outline-none"
                    >
                      <option value="">Select utility</option>
                      {utilities.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf"
                  >
                    Update
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
