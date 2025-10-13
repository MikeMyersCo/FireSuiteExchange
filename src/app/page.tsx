'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suiteAreaCounts, setSuiteAreaCounts] = useState({ L: 0, UNT: 0, UST: 0 });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  // Fetch suite area counts
  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch('/api/suites/listings');
        const result = await response.json();
        if (result.success) {
          const listingsArray = Object.values(result.data.contacts || {}) as any[];
          const counts = {
            L: listingsArray.filter(l => l.suiteArea === 'L').length,
            UNT: listingsArray.filter(l => l.suiteArea === 'UNT').length,
            UST: listingsArray.filter(l => l.suiteArea === 'UST').length,
          };
          setSuiteAreaCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching suite area counts:', error);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Dark teal bar like Wispr Flow */}
      <header className="sticky top-0 z-50 bg-accent">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-accent-foreground transition-opacity hover:opacity-80">
            🔥 Fire Suite Exchange
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Browse Listings
            </Link>
            <Link href="/verify-suite" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Become a Seller
            </Link>
            {session?.user?.role === 'APPROVER' || session?.user?.role === 'ADMIN' ? (
              <Link href="/approver/applications" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                Review Applications
              </Link>
            ) : null}
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-xl border-2 border-accent-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border-2 border-accent-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-600"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-accent-foreground hover:bg-accent-foreground/10 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
      >
        <nav className="container mx-auto flex flex-col gap-1 py-4">
          <Link
            href="/browse"
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Listings
          </Link>
          <Link
            href="/verify-suite"
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a Seller
          </Link>
          {session?.user?.role === 'APPROVER' || session?.user?.role === 'ADMIN' ? (
            <Link
              href="/approver/applications"
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Review Applications
            </Link>
          ) : null}
          {session ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-600"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      </div>

      {/* Hero Section - Cream background with mixed serif/sans like Wispr */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-background py-20 sm:py-24 md:py-32 lg:py-40">
          <div className="container mx-auto text-center">
            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="font-serif italic text-muted-foreground/60">Don't wait,</span>{' '}
              <span className="font-sans font-bold text-foreground">find your tickets</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-semibold leading-relaxed text-foreground/80 sm:text-xl md:mb-12">
              The trusted marketplace for Fire Suite owners at Ford Amphitheater in Colorado Springs
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/browse"
                className="group inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary px-6 text-base font-semibold text-foreground transition-all hover:bg-primary-600 active:scale-[0.98]"
              >
                Browse Tickets
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/sell"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-background px-6 text-base font-semibold text-foreground transition-all hover:bg-secondary"
              >
                List Your Tickets
              </Link>
            </div>
          </div>
        </section>

        {/* Suite Areas - Clean card grid with Wispr Flow aesthetic */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="mb-12 text-center text-heading-lg font-bold text-foreground">
              Browse by Suite Area
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/browse?area=UNT" className="group">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card-subtle transition-all hover:shadow-card-hover">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-100 text-3xl">
                      🎫
                    </div>
                    <div className="rounded-full bg-primary px-4 py-2 text-xl font-bold text-primary-foreground">
                      {suiteAreaCounts.UNT}
                    </div>
                  </div>
                  <h3 className="mb-3 text-heading-sm font-semibold text-foreground">North Terrace</h3>
                  <p className="text-sm text-foreground/70">Suites 1-20 • 8 seats each</p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {suiteAreaCounts.UNT} {suiteAreaCounts.UNT === 1 ? 'listing' : 'listings'} available
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View listings
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/browse?area=UST" className="group">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card-subtle transition-all hover:shadow-card-hover">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-100 text-3xl">
                      🎫
                    </div>
                    <div className="rounded-full bg-primary px-4 py-2 text-xl font-bold text-primary-foreground">
                      {suiteAreaCounts.UST}
                    </div>
                  </div>
                  <h3 className="mb-3 text-heading-sm font-semibold text-foreground">South Terrace</h3>
                  <p className="text-sm text-foreground/70">Suites 1-20 • 8 seats each</p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {suiteAreaCounts.UST} {suiteAreaCounts.UST === 1 ? 'listing' : 'listings'} available
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View listings
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/browse?area=L" className="group">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card-subtle transition-all hover:shadow-card-hover">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 text-3xl">
                      🎫
                    </div>
                    <div className="rounded-full bg-primary px-4 py-2 text-xl font-bold text-primary-foreground">
                      {suiteAreaCounts.L}
                    </div>
                  </div>
                  <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Lower Bowl</h3>
                  <p className="text-sm text-foreground/70">Suites 1-90 • 8 seats each</p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {suiteAreaCounts.L} {suiteAreaCounts.L === 1 ? 'listing' : 'listings'} available
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View listings
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works - Feature rows with consistent rhythm */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="mb-16 text-center text-heading-lg font-bold text-foreground">
              How It Works
            </h2>
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-md">
                  1
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Browse Listings</h3>
                <p className="leading-relaxed text-foreground/70">
                  Search verified listings from Fire Suite owners. Filter by event, price, and
                  suite location.
                </p>
              </div>

              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-md">
                  2
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Contact Seller</h3>
                <p className="leading-relaxed text-foreground/70">
                  Reach out directly via email, phone, or message to arrange purchase and delivery.
                </p>
              </div>

              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-md">
                  3
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Enjoy the Show</h3>
                <p className="leading-relaxed text-foreground/70">
                  Complete your transaction safely and enjoy world-class entertainment from your
                  Fire Suite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Prominent card with cream theme */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-primary px-8 py-16 text-center md:px-12 md:py-20">
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Own a Fire Suite?</h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg font-semibold leading-relaxed text-foreground/90">
                  Join our platform as a verified seller. List your tickets quickly and connect with
                  thousands of fans.
                </p>
                <Link
                  href="/verify-suite"
                  className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-background px-8 text-base font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                >
                  Apply to Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Clean minimal footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-muted-foreground">
              © 2025 Fire Suite Exchange. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/legal/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
