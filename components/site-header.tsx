import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' }
];

export default function SiteHeader() {
  return (
    <header className="px-5 pt-6 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-4 py-3 shadow-card backdrop-blur">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sea text-white font-semibold">OP</span>
          <span style={{ fontFamily: 'var(--font-fraunces), serif' }}>Ohio Power Picker</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-ink/70">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition hover:bg-sea/10 hover:text-sea"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
