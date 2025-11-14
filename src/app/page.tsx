'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import BottomNav from '@/components/BottomNav';
import { EventGridSkeleton } from '@/components/LoadingSkeleton';

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
  const [hasVerifiedSuites, setHasVerifiedSuites] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Trigger animation on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Check if user has verified suites
  useEffect(() => {
    async function checkVerifiedSuites() {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/applications/my-applications');
        const data = await response.json();
        if (data.success) {
          const verifiedSuites = data.applications.filter((app: any) => app.status === 'APPROVED');
          setHasVerifiedSuites(verifiedSuites.length > 0);
        }
      } catch (error) {
        console.error('Error checking verified suites:', error);
      }
    }
    checkVerifiedSuites();
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col pb-safe overflow-x-hidden w-full">
      {/* Header - Dark teal bar like Wispr Flow */}
      <header className="sticky top-0 z-50 bg-accent w-full">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
            {/* Mobile: Just Fire Emoji */}
            <span className="md:hidden text-2xl">🔥</span>

            {/* Desktop: Cool FSE Logo */}
            <div className="hidden md:flex items-center gap-3">
              {/* Fire Icon Badge */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔥</span>
                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* FSE Text Logo */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    FSE
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-white/70 uppercase -mt-1">
                  Fire Suite Exchange
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/browse"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Browse</span>
            </Link>

            {session && ((session?.user?.role as string) === 'SELLER' || (session?.user?.role as string) === 'ADMIN') && (
              <Link
                href="/sell/my-listings"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Listings</span>
              </Link>
            )}

            {session && (session?.user?.role as string) !== 'GUEST' && (
              <Link
                href="/owners"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Owners</span>
              </Link>
            )}

            {(session?.user?.role as string) === 'APPROVER' || (session?.user?.role as string) === 'ADMIN' ? (
              <Link
                href="/approver/applications"
                className="group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Review</span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg">
                    {pendingCount}
                  </span>
                )}
              </Link>
            ) : null}

            <div className="w-px h-6 bg-white/20 mx-2"></div>

            {session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
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
          {session && ((session?.user?.role as string) === 'SELLER' || (session?.user?.role as string) === 'ADMIN') && (
            <Link
              href="/sell/my-listings"
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Listings
            </Link>
          )}
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
            {hasVerifiedSuites ? 'Add Additional Suites' : 'Become a Seller'}
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

          {/* Spotlight Sweep Animation */}
          {!hasAnimated && (
            <div
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{
                background: 'radial-gradient(circle 600px at var(--spotlight-x, -50%) 50%, transparent 0%, rgba(0,0,0,0.95) 100%)',
                animation: 'spotlight-sweep 1200ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
          )}

          {/* Content */}
          <div className={`container relative z-10 mx-auto text-center transition-opacity duration-700 ${hasAnimated ? 'opacity-100' : 'opacity-0'}`}>
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
                className="group relative inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center overflow-hidden rounded-2xl bg-accent px-10 py-4 text-lg font-black text-accent-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(3,79,70,0.6)] active:scale-[0.98]"
              >
                <span className="relative">Browse Tickets</span>
                <svg
                  className="relative ml-2 h-6 w-6 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/sell"
                className="group relative inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center overflow-hidden rounded-2xl border-3 border-white bg-white/95 px-10 py-4 text-lg font-black text-accent shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] active:scale-[0.98]"
              >
                <span className="relative">List Your Tickets</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Events - StubHub Style */}
        <section className="py-8 md:py-12 bg-secondary/20">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="text-heading-lg font-black text-foreground mb-2">
                Featured Events
              </h2>
              <p className="text-foreground/70 text-lg">
                Top concerts happening soon at Ford Amphitheater
              </p>
            </div>
            {upcomingShows.length === 0 ? (
              <EventGridSkeleton count={3} />
            ) : (
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {upcomingShows.map((show, index) => {
                const isTrending = index === 0; // Mark first event as trending
                return (
                <Link
                  key={show.eventTitle}
                  href={`/browse?event=${encodeURIComponent(show.eventTitle)}`}
                  className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-accent hover:scale-[1.02]"
                >
                  {/* Trending Badge */}
                  {isTrending && (
                    <div className="absolute top-3 left-3 z-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      TRENDING
                    </div>
                  )}

                  {/* Large Event Visual */}
                  <div className="relative h-40 flex items-center justify-center bg-gradient-to-br from-accent to-primary">
                    <div className="text-7xl drop-shadow-2xl">🎵</div>
                    {/* Ticket Count Badge */}
                    <div className="absolute bottom-3 right-3 rounded-full bg-white px-4 py-2 shadow-xl">
                      <p className="text-sm font-bold text-accent">{show.totalListings} tickets</p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Event Title */}
                    <h3 className="mb-3 line-clamp-2 min-h-[3.5rem] text-xl font-bold text-foreground leading-tight">
                      {show.eventTitle}
                    </h3>

                    {/* Venue */}
                    <div className="mb-3 flex items-center gap-2 text-sm text-foreground/70">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold">Ford Amphitheater</span>
                    </div>

                    {/* Date & Time */}
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                      <svg className="w-5 h-5 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(show.eventDatetime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Suite Area Breakdown */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-900">
                        Lower Bowl: {show.counts.L}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900">
                        Terraces: {show.counts.UNT + show.counts.UST}
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border-2 border-accent/20">
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Available Now</p>
                        <p className="text-2xl font-black text-accent">{show.totalListings} Listings</p>
                      </div>
                      <svg className="w-6 h-6 text-accent transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );})}
            </div>
            )}
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

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
