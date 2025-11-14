"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import EventsCalendar from '@/components/EventsCalendar';
import VenueMap from '@/components/VenueMap';
import BottomNav from '@/components/BottomNav';
import { ListingGridSkeleton } from '@/components/LoadingSkeleton';
import { useShare } from '@/hooks/useShare';
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
  const [mounted, setMounted] = useState(false);
  const [hasVerifiedSuites, setHasVerifiedSuites] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showOnlyMyListings, setShowOnlyMyListings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVenueMap, setShowVenueMap] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'weekend' | 'month'>('all');
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());
  const { share, canShare } = useShare();

  useEffect(() => {
    setMounted(true);
    // Load saved listings from localStorage
    const saved = localStorage.getItem('savedListings');
    if (saved) {
      setSavedListings(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save to localStorage when savedListings changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('savedListings', JSON.stringify(Array.from(savedListings)));
    }
  }, [savedListings, mounted]);

  const toggleSaveListing = (listingId: string) => {
    setSavedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

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

  const handleRefresh = async () => {
    await fetchListings();
  };

  const handleShare = async (listing: ListingData) => {
    const success = await share({
      title: listing.eventTitle,
      text: `Check out these Fire Suite tickets for ${listing.eventTitle}!`,
      url: `${window.location.origin}/listing/${listing.slug}`,
    });

    if (!success && canShare) {
      // Fallback was used - show toast
      alert('Link copied to clipboard!');
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

    // Date range filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(listing => {
        const eventDate = new Date(listing.eventDatetime);

        if (dateFilter === 'today') {
          return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'weekend') {
          // This weekend (next Saturday and Sunday)
          const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
          const saturday = new Date(today.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
          const monday = new Date(saturday.getTime() + 3 * 24 * 60 * 60 * 1000);
          return eventDate >= saturday && eventDate < monday;
        } else if (dateFilter === 'month') {
          // This month
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          return eventDate >= today && eventDate <= endOfMonth;
        }
        return true;
      });
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
  }, [selectedEvent, selectedSuiteArea, searchQuery, showOnlyMyListings, allListings, session, sortBy, dateFilter]);

  // Calculate suite area counts
  const suiteAreaCounts = {
    L: allListings.filter(l => l.suiteArea === 'L').length,
    UNT: allListings.filter(l => l.suiteArea === 'UNT').length,
    UST: allListings.filter(l => l.suiteArea === 'UST').length,
    V: allListings.filter(l => l.suiteArea === 'V').length,
  };

  return (
    <div className="min-h-screen bg-background pb-safe overflow-x-hidden w-full">
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
              href="/"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <Link
              href="/browse"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white transition-all hover:bg-white/20"
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

        {/* Date Range Quick Filters - StubHub Style */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'weekend', label: 'Weekend' },
              { value: 'month', label: 'This Month' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value as typeof dateFilter)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all min-h-[48px] ${
                  dateFilter === filter.value
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'bg-card border-2 border-border text-foreground hover:border-accent hover:bg-secondary active:scale-95'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
            <ListingGridSkeleton count={8} />
          ) : listings.length > 0 ? (
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const viewCount = Math.floor(Math.random() * 50) + 10;
              const isNew = new Date().getTime() - new Date(listing.createdAt).getTime() < 48 * 60 * 60 * 1000;
              const isSold = listing.status === 'SOLD';
              const isSaved = savedListings.has(listing.listingId);
              return (
              <div key={listing.listingId} className="group flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-accent relative">
                {/* Save Heart Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSaveListing(listing.listingId);
                  }}
                  className="absolute top-3 right-3 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95"
                  aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
                >
                  <svg
                    className={`w-6 h-6 transition-all ${isSaved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-foreground/70'}`}
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* NEW Badge - Top Left Corner */}
                {isNew && (
                  <div className="absolute top-3 left-3 z-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    NEW
                  </div>
                )}

                {/* Diagonal SOLD banner */}
                {isSold && (
                  <div className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none bg-black/40 backdrop-blur-sm">
                    <div className="absolute top-[50%] left-[-20%] right-[-20%] bg-red-600 text-white text-center font-black text-3xl py-4 shadow-2xl transform -translate-y-1/2 rotate-[-15deg]">
                      SOLD OUT
                    </div>
                  </div>
                )}

                {/* Large Event Visual */}
                <div className={`relative h-32 flex items-center justify-center ${isSold ? 'opacity-60' : ''} ${
                  listing.suiteArea === 'L' ? 'bg-gradient-to-br from-green-400 to-teal-500' :
                  listing.suiteArea === 'V' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                  'bg-gradient-to-br from-yellow-400 to-orange-500'
                }`}>
                  <div className="text-6xl drop-shadow-lg">🎵</div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Event Title */}
                  <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-xl font-bold text-foreground leading-tight">
                    {listing.eventTitle}
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
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <svg className="w-5 h-5 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Suite Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                      listing.suiteArea === 'L' ? 'bg-green-100 text-green-900' :
                      listing.suiteArea === 'V' ? 'bg-purple-100 text-purple-900' :
                      'bg-yellow-100 text-yellow-900'
                    }`}>
                      {formatSuiteArea(listing.suiteArea)} • {listing.suiteArea === 'V' ? `V-${listing.suiteNumber}` : `Suite ${listing.suiteNumber}`}
                    </span>
                  </div>

                  {/* PRICE - StubHub Style Prominence */}
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border-2 border-accent/20">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">From</p>
                        <p className="text-4xl font-black text-accent">${listing.pricePerSeat}</p>
                        <p className="text-xs font-medium text-foreground/70 mt-1">{listing.quantity} seats available</p>
                      </div>
                      <div className="flex items-center gap-1 text-foreground/50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-semibold">{viewCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - StubHub Style */}
                  <div className="flex flex-col gap-3">
                    {showOnlyMyListings ? (
                      // Edit mode - show edit button for seller's own listings
                      <Link
                        href={`/sell/edit/${listing.listingId}`}
                        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-foreground bg-blue-600 px-6 text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-xl active:scale-[0.97]"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Listing
                      </Link>
                    ) : (
                      // Normal browse mode - show view details and contact buttons
                      <>
                        <Link
                          href={`/listing/${listing.slug}`}
                          className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent px-6 text-base font-bold text-accent-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${isSold ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          View Details
                          <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        {!isSold && (
                          <div className="grid grid-cols-3 gap-2">
                            {listing.contactEmail && (
                              <a
                                href={`mailto:${listing.contactEmail}`}
                                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-border bg-card px-2 text-xs font-bold text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
                                title="Email Seller"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </a>
                            )}
                            {listing.contactPhone && (
                              <a
                                href={`sms:${listing.contactPhone}`}
                                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-border bg-card px-2 text-xs font-bold text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
                                title="Text Seller"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              </a>
                            )}
                            {listing.contactMessenger && (
                              <a
                                href={`https://m.me/${listing.contactMessenger}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-border bg-card px-2 text-xs font-bold text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
                                title="Message on Facebook Messenger"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                                </svg>
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
              <div className="hidden md:block">
                <h3 className="text-2xl font-bold text-foreground">Venue Map</h3>
                <p className="text-sm text-foreground/70">Click a section to filter tickets by suite area</p>
              </div>
              <button
                onClick={() => setShowVenueMap(false)}
                className="rounded-lg p-2 text-foreground/70 transition-all hover:bg-secondary hover:text-foreground ml-auto"
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

      {/* Bottom Navigation */}
      <BottomNav />
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
