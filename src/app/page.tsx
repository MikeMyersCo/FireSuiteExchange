'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface UpcomingShow {
  eventTitle: string;
  eventDatetime: string;
  totalListings: number;
  counts: { L: number; UNT: number; UST: number };
}

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upcomingShows, setUpcomingShows] = useState<UpcomingShow[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

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

  // Fetch upcoming shows
  useEffect(() => {
    async function fetchUpcomingShows() {
      try {
        const response = await fetch('/api/suites/listings');
        const result = await response.json();
        if (result.success) {
          const listingsArray = Object.values(result.data.contacts || {}) as any[];

          // Group by event and calculate counts
          const eventMap = new Map<string, UpcomingShow>();
          listingsArray.forEach(listing => {
            const key = listing.eventTitle;
            if (!eventMap.has(key)) {
              eventMap.set(key, {
                eventTitle: listing.eventTitle,
                eventDatetime: listing.eventDatetime,
                totalListings: 0,
                counts: { L: 0, UNT: 0, UST: 0 }
              });
            }
            const event = eventMap.get(key)!;
            event.totalListings++;
            if (listing.suiteArea === 'L') event.counts.L++;
            else if (listing.suiteArea === 'UNT') event.counts.UNT++;
            else if (listing.suiteArea === 'UST') event.counts.UST++;
          });

          // Sort by date and take next 3
          const sortedShows = Array.from(eventMap.values())
            .sort((a, b) => new Date(a.eventDatetime).getTime() - new Date(b.eventDatetime).getTime())
            .slice(0, 3);

          setUpcomingShows(sortedShows);
        }
      } catch (error) {
        console.error('Error fetching upcoming shows:', error);
      }
    }
    fetchUpcomingShows();
  }, []);

  // Fetch pending applications count for approvers/admins
  useEffect(() => {
    async function fetchPendingCount() {
      if (!session?.user) return;

      const role = session.user.role as string;
      if (role !== 'APPROVER' && role !== 'ADMIN') return;

      try {
        const response = await fetch('/api/applications/pending-count');
        const data = await response.json();
        if (data.success) {
          setPendingCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    }
    fetchPendingCount();
  }, [session]);

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
            {session && (session?.user?.role as string) !== 'GUEST' && (
              <Link href="/owners" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                Owners Lounge
              </Link>
            )}
            <Link href="/verify-suite" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Become a Seller
            </Link>
            {(session?.user?.role as string) === 'APPROVER' || (session?.user?.role as string) === 'ADMIN' ? (
              <Link href="/approver/applications" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground relative inline-flex items-center gap-2">
                Review Applications
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            ) : null}
            {session ? (
              <>
                <Link href="/profile" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-xl border-2 border-accent-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-600"
                >
                  Logout
                </button>
              </>
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
          {session && (session?.user?.role as string) !== 'GUEST' && (
            <Link
              href="/owners"
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Owners Lounge
            </Link>
          )}
          <Link
            href="/verify-suite"
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a Seller
          </Link>
          {(session?.user?.role as string) === 'APPROVER' || (session?.user?.role as string) === 'ADMIN' ? (
            <Link
              href="/approver/applications"
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Review Applications</span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          ) : null}
          {session ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-600"
              >
                Logout
              </button>
            </>
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

      {/* Hero Section - Background concert image with overlay */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-32 md:py-48 lg:py-56">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/images/concert-hero.jpg')",
                filter: 'blur(1px) brightness(0.6)',
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
          </div>

          {/* Content */}
          <div className="container relative z-10 mx-auto text-center">
            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="font-serif italic text-white/90">Don't wait,</span>{' '}
              <span className="font-sans font-bold text-white">find your tickets</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-semibold leading-relaxed text-white/95 drop-shadow-lg sm:text-xl md:mb-12">
              Buy from verified Fire Suite owners at Ford Amphitheater. Every seller is confirmed as an authentic suite holder.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/browse"
                className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-gradient-to-r from-primary via-primary to-primary-600 px-8 text-base font-bold text-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">Browse Tickets</span>
                <svg
                  className="relative ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/sell"
                className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white/10 px-8 text-base font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">List Your Tickets</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Shows - Clean card grid with Wispr Flow aesthetic */}
        <section className="py-8 md:py-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-center text-heading-lg font-bold text-foreground">
              Upcoming Concerts
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingShows.map((show, index) => (
                <div key={show.eventTitle} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card-subtle transition-all duration-300 hover:scale-[1.02] hover:shadow-card-elevated hover:border-primary/30">
                  <Link href={`/browse?event=${encodeURIComponent(show.eventTitle)}`} className="absolute inset-0 z-0" />

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-[1]"></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        🎵
                      </div>
                      <div className="rounded-full bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-2 text-xl font-bold text-white shadow-lg">
                        {show.totalListings}
                      </div>
                    </div>
                    <h3 className="mb-3 text-heading-sm font-semibold text-foreground line-clamp-2 min-h-[3.5rem] font-serif italic">
                      {show.eventTitle}
                    </h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      {new Date(show.eventDatetime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3 justify-center">
                      <Link
                        href={`/browse?event=${encodeURIComponent(show.eventTitle)}&area=L`}
                        className="relative z-20 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-black hover:bg-green-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lower: {show.counts.L}
                      </Link>
                      <Link
                        href={`/browse?event=${encodeURIComponent(show.eventTitle)}&area=UNT`}
                        className="relative z-20 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        N. Terr: {show.counts.UNT}
                      </Link>
                      <Link
                        href={`/browse?event=${encodeURIComponent(show.eventTitle)}&area=UST`}
                        className="relative z-20 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        S. Terr: {show.counts.UST}
                      </Link>
                    </div>
                    <p className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      {show.totalListings} {show.totalListings === 1 ? 'listing' : 'listings'} available
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
                      View listings
                      <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Feature rows with consistent rhythm */}
        <section className="bg-secondary/30 py-12 md:py-24">
          <div className="container mx-auto">
            <h2 className="mb-12 md:mb-16 text-center text-heading-lg font-bold text-foreground">
              How It Works
            </h2>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-xl font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl">
                  1
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Browse Verified Listings</h3>
                <p className="leading-relaxed text-foreground/70">
                  View tickets from confirmed Fire Suite owners only. Every seller has been verified to ensure authenticity.
                </p>
              </div>

              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl">
                  2
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Contact with Confidence</h3>
                <p className="leading-relaxed text-foreground/70">
                  Reach out directly to verified sellers knowing they are legitimate suite holders at Ford Amphitheater.
                </p>
              </div>

              <div className="group">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-xl font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl">
                  3
                </div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">Enjoy the Show</h3>
                <p className="leading-relaxed text-foreground/70">
                  Complete your transaction with peace of mind and enjoy world-class entertainment from your Fire Suite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Prominent card with cream theme */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-br from-primary via-primary to-primary-600 px-6 py-12 text-center shadow-2xl sm:px-8 sm:py-16 md:px-12 md:py-20">
              {/* Decorative gradient orbs */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-teal-400/20 to-blue-400/20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>

              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Own a Fire Suite?</h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg font-semibold leading-relaxed text-foreground/90">
                  Get verified and list your tickets on our trusted marketplace. Buyers know you're a legitimate suite holder, giving them confidence to purchase.
                </p>
                <Link
                  href="/verify-suite"
                  className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl border-2 border-foreground bg-background px-8 text-base font-semibold text-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-100/0 via-teal-100/30 to-teal-100/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative">Apply to Become a Verified Seller</span>
                  <svg className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Clean minimal footer */}
      <footer className="border-t border-border bg-secondary/30 py-8 md:py-12">
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
