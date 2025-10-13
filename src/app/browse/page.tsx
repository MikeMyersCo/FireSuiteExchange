"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  notes?: string;
}

export default function BrowsePage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchListings();
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
        setListings(listingsArray);
      }
    } catch (error) {
      console.error('Error fetching suite listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal sticky nav with slide-down mobile menu */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground transition-colors hover:text-primary">
            🔥 Fire Suite Exchange
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/browse" className="text-sm font-medium text-primary">
              Browse Listings
            </Link>
            <Link href="/apply-seller" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Become a Seller
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-600 hover:shadow-lg hover:scale-[1.02]"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
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
            className="rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Listings
          </Link>
          <Link
            href="/apply-seller"
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a Seller
          </Link>
          <Link
            href="/login"
            className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-600"
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
          <p className="text-lg text-muted-foreground">
            {!loading && listings.length > 0
              ? `${listings.length} active listings available.`
              : 'View all available suite tickets.'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading listings...</p>
            </div>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.listingId} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card-subtle transition-all hover:shadow-card-hover">
                <div className="p-6">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
                    {listing.eventTitle}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>

                  <div className="mb-5 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price per seat</span>
                      <span className="text-xl font-bold text-primary">${listing.pricePerSeat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available seats</span>
                      <span className="text-base font-semibold text-foreground">{listing.quantity}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary-600 hover:shadow-lg active:scale-[0.98]"
                    >
                      View Details
                    </Link>
                    {listing.contactEmail && (
                      <a
                        href={`mailto:${listing.contactEmail}`}
                        className="inline-flex h-10 w-full items-center justify-center rounded-xl border-2 border-primary bg-background px-4 text-sm font-semibold text-primary transition-all hover:bg-primary-50"
                      >
                        Contact Seller
                      </a>
                    )}
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
            <p className="mb-8 text-muted-foreground">
              There are currently no tickets available. Check back soon or become a seller to list your tickets.
            </p>
            <Link
              href="/apply-seller"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary-600 hover:shadow-lg active:scale-[0.98]"
            >
              Become a Seller
            </Link>
          </div>
        )}

        {/* Instructions */}
        {!loading && listings.length > 0 && (
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary-50 p-8">
            <h3 className="mb-4 text-heading-sm font-semibold text-foreground">How to Purchase</h3>
            <ol className="space-y-3 text-base text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">1.</span>
                <span>Browse available listings and select a ticket that interests you</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">2.</span>
                <span>Review the listing information, price, and delivery method</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">3.</span>
                <span>Contact the seller directly or view the full listing for more details</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">4.</span>
                <span>Arrange payment and ticket delivery with the verified seller</span>
              </li>
            </ol>
          </div>
        )}
      </main>

      {/* Footer - Clean minimal footer */}
      <footer className="mt-16 border-t border-border bg-card/50 py-12">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
