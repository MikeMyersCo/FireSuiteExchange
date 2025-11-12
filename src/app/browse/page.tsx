"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import EventsCalendar from '@/components/EventsCalendar';
import VenueMap from '@/components/VenueMap';
import { createPortal } from 'react-dom';

interface ListingData {
  listingId: string;
  eventTitle: string;
  eventDatetime: string;
  createdAt: string;
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
  status: string;
  soldAt?: string;
  sellerId?: string;
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
    case 'V':
      return 'V Sections';
    default:
      return area;
  }
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [allListings, setAllListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedSuiteArea, setSelectedSuiteArea] = useState<string | null>(null);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasVerifiedSuites, setHasVerifiedSuites] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showOnlyMyListings, setShowOnlyMyListings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVenueMap, setShowVenueMap] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  useEffect(() => {
    setMounted(true);
  }, []);

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
      // Add sellerId parameter if showing only my listings
      const url = showOnlyMyListings && session?.user?.id
        ? `/api/suites/listings?sellerId=${session.user.id}`
        : '/api/suites/listings';

      const response = await fetch(url);
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

  // Refetch when showOnlyMyListings changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchListings();
    }
  }, [showOnlyMyListings]);

  // Filter listings when event, suite area, search query, or my listings toggle changes
  useEffect(() => {
    let filtered = allListings;

    if (selectedEvent) {
      filtered = filtered.filter(listing => listing.eventTitle === selectedEvent);
    }

    if (selectedSuiteArea) {
      filtered = filtered.filter(listing => listing.suiteArea === selectedSuiteArea);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        listing.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showOnlyMyListings && session?.user?.id) {
      // Filter to show only current user's listings
      filtered = filtered.filter(listing => {
        // We need to add sellerId to the listing data
        // For now, we'll fetch this from the API
        return true; // Placeholder - will be handled by API
      });
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      filtered = [...filtered].sort((a, b) => parseFloat(a.pricePerSeat) - parseFloat(b.pricePerSeat));
    } else if (sortBy === 'price-desc') {
      filtered = [...filtered].sort((a, b) => parseFloat(b.pricePerSeat) - parseFloat(a.pricePerSeat));
    }

    setListings(filtered);
  }, [selectedEvent, selectedSuiteArea, searchQuery, showOnlyMyListings, allListings, session, sortBy]);

  // Calculate suite area counts
  const suiteAreaCounts = {
    L: allListings.filter(l => l.suiteArea === 'L').length,
    UNT: allListings.filter(l => l.suiteArea === 'UNT').length,
    UST: allListings.filter(l => l.suiteArea === 'UST').length,
    V: allListings.filter(l => l.suiteArea === 'V').length,
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
            {session && ((session?.user?.role as string) === 'SELLER' || (session?.user?.role as string) === 'ADMIN') && (
              <Link href="/sell/my-listings" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                My Listings
              </Link>
            )}
            {session && (session?.user?.role as string) !== 'GUEST' && (
              <Link href="/owners" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                Owners Lounge
              </Link>
            )}
            <Link href="/verify-suite" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              {hasVerifiedSuites ? 'Add Additional Suites' : 'Become a Seller'}
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
            href="/"
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/browse"
            className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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

      {/* Main Content */}
      <main className="container mx-auto py-8 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-heading-lg font-bold text-foreground">
            Browse Fire Suite Tickets
          </h1>
          <p className="text-lg text-foreground/70">
            {!loading && listings.length > 0
              ? selectedEvent
                ? `${listings.length} listing${listings.length === 1 ? '' : 's'} for ${selectedEvent}`
                : showOnlyMyListings
                ? `${listings.length} of your listing${listings.length === 1 ? '' : 's'}`
                : `${listings.length} active listing${listings.length === 1 ? '' : 's'} available.`
              : 'View all available suite tickets.'}
          </p>

          {/* Edit My Listings Toggle for Sellers */}
          {session && ((session?.user?.role as string) === 'SELLER' || (session?.user?.role as string) === 'ADMIN') && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  setShowOnlyMyListings(!showOnlyMyListings);
                  setSelectedEvent(null);
                  setSelectedSuiteArea(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  showOnlyMyListings
                    ? 'bg-primary text-primary-foreground border-2 border-foreground'
                    : 'bg-card border-2 border-border text-foreground hover:bg-secondary'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showOnlyMyListings ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                </svg>
                {showOnlyMyListings ? 'Editing My Listings' : 'Edit My Listings'}
              </button>
            </div>
          )}
        </div>

        {/* Compact Filter Bar */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-card-subtle">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search events by artist name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() && selectedEvent) {
                        setSelectedEvent(null); // Clear date filter when searching by name
                      }
                    }}
                    className="w-full rounded-lg border-2 border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Suite Area Dropdown */}
              <div className="sm:w-48">
                <select
                  value={selectedSuiteArea || ''}
                  onChange={(e) => setSelectedSuiteArea(e.target.value || null)}
                  className="w-full rounded-lg border-2 border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Suite Areas</option>
                  <option value="L">Lower Bowl ({suiteAreaCounts.L})</option>
                  <option value="UNT">North Terrace ({suiteAreaCounts.UNT})</option>
                  <option value="UST">South Terrace ({suiteAreaCounts.UST})</option>
                  <option value="V">V Sections ({suiteAreaCounts.V})</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                  className="w-full rounded-lg border-2 border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="default">Sort by: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* View Map Button */}
              <button
                onClick={() => setShowVenueMap(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Map
              </button>

              {/* Browse by Date Button */}
              <button
                onClick={() => setShowEventPicker(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                By Date
              </button>

              {/* Clear All Button */}
              {(selectedEvent || selectedSuiteArea || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedSuiteArea(null);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 sm:w-auto"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>

            {/* Active Filter Pills */}
            {(selectedEvent || selectedSuiteArea) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground/70">Active filters:</span>
                {selectedEvent && (
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-300 px-3 py-1 text-sm font-medium text-blue-900 transition-all hover:bg-blue-200"
                  >
                    {selectedEvent}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {selectedSuiteArea && (
                  <button
                    onClick={() => setSelectedSuiteArea(null)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-100 border border-green-300 px-3 py-1 text-sm font-medium text-green-900 transition-all hover:bg-green-200"
                  >
                    {formatSuiteArea(selectedSuiteArea)}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Full-width Listings */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-foreground/70">Loading listings...</p>
              </div>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const viewCount = Math.floor(Math.random() * 50) + 10;
              const isNew = new Date().getTime() - new Date(listing.createdAt).getTime() < 48 * 60 * 60 * 1000;
              const isSold = listing.status === 'SOLD';
              return (
              <div key={listing.listingId} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card-subtle transition-all duration-300 hover:scale-[1.02] hover:shadow-card-elevated relative">
                {/* Diagonal SOLD banner */}
                {isSold && (
                  <div className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none">
                    <div className="absolute top-[50%] left-[-20%] right-[-20%] bg-red-600 text-white text-center font-black text-2xl py-3 shadow-2xl transform -translate-y-1/2 rotate-[-25deg] opacity-90">
                      SOLD
                    </div>
                  </div>
                )}
                <div className={`px-3 py-2 text-center ${listing.suiteArea === 'L' ? 'bg-gradient-to-r from-green-100 to-green-50' : 'bg-gradient-to-r from-yellow-100 to-yellow-50'} ${isSold ? 'opacity-60' : ''}`}>
                  <p className="text-xs font-bold leading-tight text-black">
                    {formatSuiteArea(listing.suiteArea)}
                  </p>
                  <p className="text-xs font-bold leading-tight text-black">
                    {listing.suiteArea === 'V' ? `V-${listing.suiteNumber}` : `Suite ${listing.suiteNumber}`}
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
                    {showOnlyMyListings ? (
                      // Edit mode - show edit button for seller's own listings
                      <Link
                        href={`/sell/edit/${listing.listingId}`}
                        className="inline-flex h-9 sm:h-8 w-full items-center justify-center rounded-lg border-2 border-foreground bg-blue-600 px-3 text-xs sm:text-xs font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] group-hover:scale-105"
                      >
                        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Listing
                      </Link>
                    ) : (
                      // Normal browse mode - show view details and contact buttons
                      <>
                        <Link
                          href={`/listing/${listing.slug}`}
                          className={`inline-flex h-9 sm:h-8 w-full items-center justify-center rounded-lg border-2 border-foreground bg-primary px-3 text-xs sm:text-xs font-semibold text-foreground transition-all duration-300 hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] group-hover:scale-105 ${isSold ? 'opacity-50' : ''}`}
                        >
                          View Details
                          <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        {!isSold && (
                          <div className="grid grid-cols-3 gap-1.5">
                            {listing.contactEmail && (
                              <a
                                href={`mailto:${listing.contactEmail}`}
                                className="inline-flex h-9 sm:h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-[11px] sm:text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
                                title="Email Seller"
                              >
                                Email
                              </a>
                            )}
                            {listing.contactPhone && (
                              <a
                                href={`sms:${listing.contactPhone}`}
                                className="inline-flex h-9 sm:h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-[11px] sm:text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
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
                                className="inline-flex h-9 sm:h-8 items-center justify-center rounded-lg border-2 border-foreground bg-background px-1 text-[11px] sm:text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary hover:scale-105"
                                title="Message on Facebook Messenger"
                              >
                                FB
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    )}
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
                  href="/verify-suite"
                  className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary px-8 text-base font-semibold text-foreground transition-all hover:bg-primary-600 active:scale-[0.98]"
                >
                {hasVerifiedSuites ? 'Add Additional Suites' : 'Become a Seller'}
              </Link>
            </div>
          )}

          {/* Instructions */}
          {!loading && listings.length > 0 && (
            <div className="mt-8 md:mt-12 rounded-2xl border border-primary/20 bg-primary-50 p-6 md:p-8">
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
      </main>

      {/* Footer - Clean minimal footer */}
      <footer className="mt-12 md:mt-16 border-t border-border bg-card/50 py-8 md:py-12">
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

      {/* Venue Map Modal */}
      {mounted && showVenueMap && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowVenueMap(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border-2 border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Venue Map</h3>
                <p className="text-sm text-foreground/70">Click a section to filter tickets by suite area</p>
              </div>
              <button
                onClick={() => setShowVenueMap(false)}
                className="rounded-lg p-2 text-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
                aria-label="Close map"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Venue Map Component */}
            <VenueMap
              selectedArea={selectedSuiteArea}
              onAreaSelect={(area) => {
                setSelectedSuiteArea(area);
                setShowVenueMap(false);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Event Picker Modal */}
      {mounted && showEventPicker && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowEventPicker(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Browse Events by Date</h3>
                <p className="text-sm text-foreground/70">Select a concert to filter listings</p>
              </div>
              <button
                onClick={() => setShowEventPicker(false)}
                className="rounded-lg p-2 text-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
                aria-label="Close event picker"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Events Calendar Component */}
            <EventsCalendar
              onEventSelect={(event) => {
                setSelectedEvent(event);
                setSearchQuery(''); // Clear search when selecting from calendar
                setShowEventPicker(false);
              }}
              selectedEvent={selectedEvent}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Verified Badge Information Modal */}
      {mounted && showVerifiedModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowVerifiedModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-2xl"
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
