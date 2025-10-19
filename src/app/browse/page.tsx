"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EventsCalendar from '@/components/EventsCalendar';
import VenueMap from '@/components/VenueMap';
import { createPortal } from 'react-dom';

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

function BrowseContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [allListings, setAllListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedSuiteArea, setSelectedSuiteArea] = useState<string | null>(null);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchListings();
    // Set initial filters from URL
    const areaParam = searchParams.get('area');
    const eventParam = searchParams.get('event');
    if (areaParam) {
      setSelectedSuiteArea(areaParam);
    }
    if (eventParam) {
      setSelectedEvent(eventParam);
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
            <Link href="/" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Home
            </Link>
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
            href="/"
            className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
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
        <div className="mb-10 text-center">
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

        {/* Two column layout: Filters on left (1/4), Listings on right (3/4) */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left sidebar - Horizontal layout with Suite Filter and Events Calendar */}
          <div className="lg:w-1/4 lg:-ml-16">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto flex flex-row gap-4 lg:flex-col">
              {/* Venue Map - Interactive seating chart */}
              <div className="flex-1 lg:flex-none">
                <VenueMap
                  selectedArea={selectedSuiteArea}
                  onAreaSelect={setSelectedSuiteArea}
                />
              </div>

              <div className="flex-1">
                <EventsCalendar onEventSelect={setSelectedEvent} selectedEvent={selectedEvent} />
              </div>
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
            {listings.map((listing) => {
              const viewCount = Math.floor(Math.random() * 50) + 10;
              const isNew = new Date().getTime() - new Date(listing.eventDatetime).getTime() < 72 * 60 * 60 * 1000;
              return (
              <div key={listing.listingId} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card-subtle transition-all duration-300 hover:scale-[1.02] hover:shadow-card-elevated">
                <div className={`px-3 py-2 text-center ${listing.suiteArea === 'L' ? 'bg-gradient-to-r from-green-100 to-green-50' : 'bg-gradient-to-r from-yellow-100 to-yellow-50'}`}>
                  <p className="text-xs font-bold leading-tight text-black">
                    {formatSuiteArea(listing.suiteArea)}
                  </p>
                  <p className="text-xs font-bold leading-tight text-black">
                    Suite {listing.suiteNumber}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-base font-semibold text-foreground text-center font-serif italic">
                    {listing.eventTitle}
                  </h3>

                  {/* Badges - positioned below title */}
                  <div className="mb-2 flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowVerifiedModal(true);
                      }}
                      className="flex items-center gap-1 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm cursor-pointer transition-all hover:bg-teal-600 hover:scale-105"
                      title="Click to learn more about verified sellers"
                    >
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>VERIFIED</span>
                    </button>
                    {isNew && (
                      <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm animate-pulse">
                        NEW ✨
                      </div>
                    )}
                  </div>

                  <div className="mb-3 flex items-center justify-between text-xs text-foreground/70">
                    <span>
                      {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {viewCount}
                    </span>
                  </div>

                  <div className="mb-3 mt-auto space-y-1 border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/70">Price per seat</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">${listing.pricePerSeat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/70">Available seats</span>
                      <span className="text-sm font-semibold text-foreground">{listing.quantity}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="inline-flex h-8 w-full items-center justify-center rounded-lg border-2 border-foreground bg-primary px-3 text-xs font-semibold text-foreground transition-all duration-300 hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] group-hover:scale-105"
                    >
                      View Details
                      <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="grid grid-cols-3 gap-1.5">
                      {listing.contactEmail && (
                        <a
                          href={`mailto:${listing.contactEmail}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
                          title="Email Seller"
                        >
                          Email
                        </a>
                      )}
                      {listing.contactPhone && (
                        <a
                          href={`sms:${listing.contactPhone}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
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
                          className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
                          title="Message on Facebook Messenger"
                        >
                          FB
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
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

      {/* Verified Badge Information Modal */}
      {mounted && showVerifiedModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowVerifiedModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border-2 border-border bg-card p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowVerifiedModal(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>VERIFIED SELLER</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">What does this mean?</h3>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Verified Ownership</h4>
                    <p className="text-sm text-foreground/80">
                      This seller has been verified as a legitimate Fire Suite owner at Ford Amphitheater. They have provided proof of ownership and been approved by our team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Stay Vigilant</h4>
                    <p className="text-sm text-foreground/80">
                      While we verify suite ownership, always exercise caution when purchasing tickets. Communicate directly with sellers, verify ticket details, and use secure payment methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border">
              <button
                onClick={() => setShowVerifiedModal(false)}
                className="w-full rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-foreground transition-all hover:bg-primary-600"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading...</p>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
