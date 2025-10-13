"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EventsCalendar from '@/components/EventsCalendar';

interface ListingData {
  listingId: string;
  eventTitle: string;
  eventDatetime: string;
  quantity: number;
  pricePerSeat: string;
  deliveryMethod: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLink?: string;
  contactMessenger?: string;
  notes?: string;
  suiteArea: string;
  suiteNumber: number;
  suiteDisplayName: string;
}

// Helper function to format suite area name
function formatSuiteArea(area: string): string {
  switch (area) {
    case 'L':
      return 'Lower Bowl';
    case 'UNT':
      return 'North Terrace';
    case 'UST':
      return 'South Terrace';
    default:
      return area;
  }
}

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [allListings, setAllListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedSuiteArea, setSelectedSuiteArea] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
    // Set initial filter from URL
    const areaParam = searchParams.get('area');
    if (areaParam) {
      setSelectedSuiteArea(areaParam);
    }
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

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/suites/listings');
      const result = await response.json();

      if (result.success) {
        // Convert the contacts object to an array of listings
        const listingsArray = Object.values(result.data.contacts || {}) as ListingData[];
        setAllListings(listingsArray);
        setListings(listingsArray);
      }
    } catch (error) {
      console.error('Error fetching suite listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings when event or suite area is selected
  useEffect(() => {
    let filtered = allListings;

    if (selectedEvent) {
      filtered = filtered.filter(listing => listing.eventTitle === selectedEvent);
    }

    if (selectedSuiteArea) {
      filtered = filtered.filter(listing => listing.suiteArea === selectedSuiteArea);
    }

    setListings(filtered);
  }, [selectedEvent, selectedSuiteArea, allListings]);

  // Calculate suite area counts
  const suiteAreaCounts = {
    L: allListings.filter(l => l.suiteArea === 'L').length,
    UNT: allListings.filter(l => l.suiteArea === 'UNT').length,
    UST: allListings.filter(l => l.suiteArea === 'UST').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Dark teal bar like Wispr Flow */}
      <header className="sticky top-0 z-50 bg-accent">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-accent-foreground transition-opacity hover:opacity-80">
            🔥 Fire Suite Exchange
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm font-medium text-accent-foreground">
              Browse Listings
            </Link>
            <Link href="/apply-seller" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Become a Seller
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-accent-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-600"
            >
              Login
            </Link>
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
            className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Listings
          </Link>
          <Link
            href="/apply-seller"
            className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a Seller
          </Link>
          <Link
            href="/login"
            className="mt-2 rounded-xl border-2 border-foreground bg-primary px-4 py-3 text-center text-sm font-semibold text-foreground transition-all hover:bg-primary-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-12 md:py-16">
        <div className="mb-10">
          <h1 className="mb-3 text-heading-lg font-bold text-foreground">
            Browse Fire Suite Tickets
          </h1>
          <p className="text-lg text-foreground/70">
            {!loading && listings.length > 0
              ? selectedEvent
                ? `${listings.length} listing${listings.length === 1 ? '' : 's'} for ${selectedEvent}`
                : `${listings.length} active listing${listings.length === 1 ? '' : 's'} available.`
              : 'View all available suite tickets.'}
          </p>
        </div>

        {/* Two column layout: Calendar on left (1/4), Listings on right (3/4) */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left sidebar - Events Calendar and Filters */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Suite Area Filter */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Filter by Suite Area</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSuiteArea(selectedSuiteArea === 'L' ? null : 'L')}
                    className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                      selectedSuiteArea === 'L'
                        ? 'border-foreground bg-green-100 text-black'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Lower Bowl</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-bold">
                        {suiteAreaCounts.L}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedSuiteArea(selectedSuiteArea === 'UNT' ? null : 'UNT')}
                    className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                      selectedSuiteArea === 'UNT'
                        ? 'border-foreground bg-yellow-100 text-black'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>North Terrace</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-bold">
                        {suiteAreaCounts.UNT}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedSuiteArea(selectedSuiteArea === 'UST' ? null : 'UST')}
                    className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                      selectedSuiteArea === 'UST'
                        ? 'border-foreground bg-yellow-100 text-black'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>South Terrace</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-bold">
                        {suiteAreaCounts.UST}
                      </span>
                    </div>
                  </button>
                  {selectedSuiteArea && (
                    <button
                      onClick={() => setSelectedSuiteArea(null)}
                      className="w-full rounded-lg border-2 border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/70 transition-all hover:bg-secondary"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

              <EventsCalendar onEventSelect={setSelectedEvent} selectedEvent={selectedEvent} />
            </div>
          </div>

          {/* Right content - Listings */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-foreground/70">Loading listings...</p>
                </div>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.listingId} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card-subtle transition-all hover:shadow-card-hover">
                <div className={`px-3 py-2 text-center ${listing.suiteArea === 'L' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <p className="text-xs font-bold leading-tight text-black">
                    {formatSuiteArea(listing.suiteArea)}
                  </p>
                  <p className="text-xs font-bold leading-tight text-black">
                    Suite {listing.suiteNumber}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-base font-semibold text-foreground">
                    {listing.eventTitle}
                  </h3>
                  <p className="mb-3 text-xs text-foreground/70">
                    {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>

                  <div className="mb-3 mt-auto space-y-1 border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/70">Price per seat</span>
                      <span className="text-lg font-bold text-foreground">${listing.pricePerSeat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/70">Available seats</span>
                      <span className="text-sm font-semibold text-foreground">{listing.quantity}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="inline-flex h-8 w-full items-center justify-center rounded-lg border-2 border-foreground bg-primary px-3 text-xs font-semibold text-foreground transition-all hover:bg-primary-600 active:scale-[0.98]"
                    >
                      View Details
                    </Link>
                    <div className="grid grid-cols-3 gap-1.5">
                      {listing.contactEmail && (
                        <a
                          href={`mailto:${listing.contactEmail}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
                          title="Email Seller"
                        >
                          Email
                        </a>
                      )}
                      {listing.contactPhone && (
                        <a
                          href={`sms:${listing.contactPhone}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
                          title="Text Seller"
                        >
                          Text
                        </a>
                      )}
                      {listing.contactMessenger && (
                        <a
                          href={`https://m.me/${listing.contactMessenger}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
                          title="Message on Facebook Messenger"
                        >
                          FB
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-border bg-card p-12 text-center shadow-card-subtle">
                <div className="mb-6 text-6xl">🎫</div>
                <h3 className="mb-3 text-heading-sm font-semibold text-foreground">
                  No Active Listings
                </h3>
                <p className="mb-8 text-foreground/70">
                  There are currently no tickets available. Check back soon or become a seller to list your tickets.
                </p>
                <Link
                  href="/apply-seller"
                  className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary px-8 text-base font-semibold text-foreground transition-all hover:bg-primary-600 active:scale-[0.98]"
                >
                  Become a Seller
                </Link>
              </div>
            )}

            {/* Instructions */}
            {!loading && listings.length > 0 && (
              <div className="mt-12 rounded-2xl border border-primary/20 bg-primary-50 p-8">
                <h3 className="mb-4 text-heading-sm font-semibold text-foreground">How to Purchase</h3>
                <ol className="space-y-3 text-base text-foreground/70">
                  <li className="flex items-start">
                    <span className="mr-3 font-bold text-foreground">1.</span>
                    <span>Browse available listings and select a ticket that interests you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold text-foreground">2.</span>
                    <span>Review the listing information, price, and delivery method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold text-foreground">3.</span>
                    <span>Contact the seller directly or view the full listing for more details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold text-foreground">4.</span>
                    <span>Arrange payment and ticket delivery with the verified seller</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - Clean minimal footer */}
      <footer className="mt-16 border-t border-border bg-card/50 py-12">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-foreground/70">
              © 2025 Fire Suite Exchange. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/legal/terms" className="text-foreground/70 transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-foreground/70 transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
