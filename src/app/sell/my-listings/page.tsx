"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

interface Listing {
  id: string;
  eventTitle: string;
  eventDatetime: string;
  quantity: number;
  pricePerSeat: string;
  deliveryMethod: string;
  status: string;
  slug: string;
  createdAt: string;
  soldAt?: string;
  suite: {
    area: string;
    number: number;
    displayName: string;
  };
}

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sellingTickets, setSellingTickets] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, string>>({});
  const [salePrices, setSalePrices] = useState<Record<string, string>>({});

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SOLD'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'recent'>('date');

  // Track original quantities for revenue calculation
  const [originalQuantities, setOriginalQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/sell/my-listings');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchMyListings();
    }
  }, [status, session, router]);

  const fetchMyListings = async () => {
    try {
      const response = await fetch(`/api/listings?sellerId=${session?.user?.id}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.listings);

        // Store original quantities on first load for revenue tracking
        const quantities: Record<string, number> = {};
        data.listings.forEach((listing: Listing) => {
          quantities[listing.id] = listing.quantity;
        });
        setOriginalQuantities(quantities);
      } else {
        setError('Failed to load your listings');
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSellTickets = async (listingId: string, availableQuantity: number, pricePerSeat: string) => {
    const quantityToSell = ticketQuantities[listingId];
    const salePrice = salePrices[listingId];

    if (!quantityToSell || quantityToSell.trim() === '') {
      toast({
        title: "Quantity Required",
        description: "Please enter the number of tickets sold",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantityToSell);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (qty > availableQuantity) {
      toast({
        title: "Insufficient Tickets",
        description: `Cannot sell ${qty} tickets. Only ${availableQuantity} available.`,
        variant: "destructive",
      });
      return;
    }

    // Parse and validate sale price if provided
    let finalSalePrice = undefined;
    if (salePrice && salePrice.trim() !== '') {
      const price = parseFloat(salePrice);
      if (isNaN(price) || price < 0) {
        toast({
          title: "Invalid Sale Price",
          description: "Please enter a valid sale price",
          variant: "destructive",
        });
        return;
      }
      finalSalePrice = price;
    }

    setSellingTickets(listingId);
    setError('');

    try {
      const response = await fetch('/api/listings/sell-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          quantitySold: qty,
          salePrice: finalSalePrice
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the listing in the local state
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === listingId
              ? {
                  ...listing,
                  quantity: data.listing.quantity,
                  status: data.listing.status,
                  soldAt: data.listing.soldAt
                }
              : listing
          )
        );
        // Clear the inputs
        setTicketQuantities(prev => ({ ...prev, [listingId]: '' }));
        setSalePrices(prev => ({ ...prev, [listingId]: '' }));

        // Show success toast
        const remainingTickets = data.listing.quantity;
        toast({
          title: "✅ Tickets Sold!",
          description: remainingTickets > 0
            ? `Marked ${qty} ticket(s) as sold. ${remainingTickets} remaining.`
            : `All tickets sold! Listing marked as SOLD.`,
        });
      } else {
        toast({
          title: "Sale Failed",
          description: data.error || 'Failed to sell tickets',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Failed to sell tickets:', err);
      toast({
        title: "Error",
        description: 'Failed to sell tickets. Please try again.',
        variant: "destructive",
      });
    } finally {
      setSellingTickets(null);
    }
  };

  const handleMarkAllAsSold = async (listingId: string, quantity: number, pricePerSeat: string) => {
    const salePrice = salePrices[listingId];

    // Parse and validate sale price if provided
    let finalSalePrice = undefined;
    if (salePrice && salePrice.trim() !== '') {
      const price = parseFloat(salePrice);
      if (isNaN(price) || price < 0) {
        toast({
          title: "Invalid Sale Price",
          description: "Please enter a valid sale price",
          variant: "destructive",
        });
        return;
      }
      finalSalePrice = price;
    }

    setUpdatingStatus(listingId);
    setError('');

    try {
      const response = await fetch('/api/listings/sell-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          quantitySold: quantity,
          salePrice: finalSalePrice
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the listing in the local state
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === listingId
              ? {
                  ...listing,
                  quantity: data.listing.quantity,
                  status: data.listing.status,
                  soldAt: data.listing.soldAt
                }
              : listing
          )
        );

        // Clear the sale price input
        setSalePrices(prev => ({ ...prev, [listingId]: '' }));

        toast({
          title: "🎉 All Tickets Sold!",
          description: `Marked all ${quantity} ticket(s) as sold. Listing is now complete.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || 'Failed to mark listing as sold',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Failed to mark listing as sold:', err);
      toast({
        title: "Error",
        description: 'Failed to mark listing as sold. Please try again.',
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMarkAsAvailable = async (listingId: string) => {
    const quantityToRestore = ticketQuantities[listingId];

    if (!quantityToRestore || quantityToRestore.trim() === '') {
      toast({
        title: "Quantity Required",
        description: "Please enter the number of tickets available",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantityToRestore);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setUpdatingStatus(listingId);
    setError('');

    try {
      const response = await fetch('/api/listings/mark-sold', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, status: 'ACTIVE', quantity: qty }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the listing in the local state
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === listingId
              ? {
                  ...listing,
                  status: 'ACTIVE',
                  quantity: qty,
                  soldAt: undefined
                }
              : listing
          )
        );

        // Reset original quantity to the new available quantity
        setOriginalQuantities(prev => ({ ...prev, [listingId]: qty }));

        // Clear the input
        setTicketQuantities(prev => ({ ...prev, [listingId]: '' }));

        toast({
          title: "✅ Listing Reactivated!",
          description: `Listing marked as available with ${qty} ticket(s).`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || 'Failed to update listing status',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Failed to update listing status:', err);
      toast({
        title: "Error",
        description: 'Failed to update listing status. Please try again.',
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatSuiteArea = (area: string): string => {
    switch (area) {
      case 'L':
        return 'Lower Bowl';
      case 'UNT':
        return 'Upper North Terrace';
      case 'UST':
        return 'Upper South Terrace';
      default:
        return area;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading your listings...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const soldListings = listings.filter(l => l.status === 'SOLD');
  const otherListings = listings.filter(l => l.status !== 'ACTIVE' && l.status !== 'SOLD');

  const totalActiveValue = activeListings.reduce((sum, l) => sum + (parseFloat(l.pricePerSeat) * l.quantity), 0);

  // Calculate revenue from sold tickets (including partial sales)
  const totalRevenue = listings.reduce((sum, listing) => {
    const originalQty = originalQuantities[listing.id] || listing.quantity;
    const currentQty = listing.quantity;
    const soldQty = originalQty - currentQty;

    // For fully sold listings, use original quantity
    if (listing.status === 'SOLD') {
      return sum + (parseFloat(listing.pricePerSeat) * originalQty);
    }

    // For active listings with partial sales
    if (soldQty > 0) {
      return sum + (parseFloat(listing.pricePerSeat) * soldQty);
    }

    return sum;
  }, 0);

  const avgPrice = listings.length > 0
    ? listings.reduce((sum, l) => sum + parseFloat(l.pricePerSeat), 0) / listings.length
    : 0;

  // Filter and search listings
  const filteredListings = listings.filter(listing => {
    // Search filter
    const matchesSearch = listing.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || listing.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.eventDatetime).getTime() - new Date(b.eventDatetime).getTime();
      case 'price':
        return parseFloat(b.pricePerSeat) - parseFloat(a.pricePerSeat);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Separate into categories after filtering/sorting
  const filteredActive = sortedListings.filter(l => l.status === 'ACTIVE');
  const filteredSold = sortedListings.filter(l => l.status === 'SOLD');
  const filteredOther = sortedListings.filter(l => l.status !== 'ACTIVE' && l.status !== 'SOLD');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🔥 Fire Suite Exchange
          </Link>
          <nav className="flex gap-6">
            <Link href="/browse" className="text-sm font-medium hover:text-blue-600">
              Browse Listings
            </Link>
            <Link href="/sell" className="text-sm font-medium hover:text-blue-600">
              List Tickets
            </Link>
            <Link href="/sell/my-listings" className="text-sm font-medium text-blue-600">
              My Listings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Listings
              </h1>
              <p className="text-gray-600">
                Manage your ticket listings
              </p>
            </div>
            <Link
              href="/sell"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Create New Listing
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Dashboard Stats Overview */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{activeListings.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{soldListings.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Value</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">${totalActiveValue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">${avgPrice.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">per seat</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by artist name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({listings.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active ({activeListings.length})
                </button>
                <button
                  onClick={() => setStatusFilter('SOLD')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'SOLD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sold ({soldListings.length})
                </button>
              </div>

              {/* Sort Dropdown */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'recent')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            {(searchQuery || statusFilter !== 'ALL') && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {sortedListings.length} of {listings.length} listings
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}
          </div>

          {/* Active Listings */}
          {(statusFilter === 'ALL' || statusFilter === 'ACTIVE') && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Active Listings ({filteredActive.length})
              </h2>
              {filteredActive.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredActive.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className={`px-3 py-2 text-center ${listing.suite.area === 'L' ? 'bg-gradient-to-r from-green-100 to-green-50' : 'bg-gradient-to-r from-yellow-100 to-yellow-50'}`}>
                      <p className="text-xs font-bold text-black">
                        {formatSuiteArea(listing.suite.area)}
                      </p>
                      <p className="text-xs font-bold text-black">
                        Suite {listing.suite.number}
                      </p>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {listing.eventTitle}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <p>
                          <span className="font-medium">Available:</span> {listing.quantity} seats
                        </p>
                        <p>
                          <span className="font-medium">Price:</span> ${listing.pricePerSeat} per seat
                        </p>
                        <p>
                          <span className="font-medium">Total Value:</span> ${(parseFloat(listing.pricePerSeat) * listing.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Partial Sale Section */}
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Sell Tickets
                        </label>
                        <div className="flex gap-2 mb-2">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-600 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max={listing.quantity}
                              value={ticketQuantities[listing.id] || ''}
                              onChange={(e) => setTicketQuantities(prev => ({ ...prev, [listing.id]: e.target.value }))}
                              placeholder={`1-${listing.quantity}`}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-600 mb-1">
                              Sale Price (default: ${(parseFloat(listing.pricePerSeat) * (parseInt(ticketQuantities[listing.id]) || listing.quantity)).toFixed(0)})
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={salePrices[listing.id] || ''}
                              onChange={(e) => setSalePrices(prev => ({ ...prev, [listing.id]: e.target.value }))}
                              placeholder={`$${(parseFloat(listing.pricePerSeat) * (parseInt(ticketQuantities[listing.id]) || listing.quantity)).toFixed(0)}`}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSellTickets(listing.id, listing.quantity, listing.pricePerSeat)}
                          disabled={sellingTickets === listing.id}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {sellingTickets === listing.id ? 'Selling...' : 'Mark as Sold'}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/listing/${listing.slug}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                        >
                          View
                        </Link>
                        <Link
                          href={`/sell/edit/${listing.id}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleMarkAllAsSold(listing.id, listing.quantity, listing.pricePerSeat)}
                          disabled={updatingStatus === listing.id}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {updatingStatus === listing.id ? 'Updating...' : 'Mark All Sold'}
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? `No active listings found matching "${searchQuery}"`
                      : "You don't have any active listings."}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/sell"
                      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Listing
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sold Listings */}
          {(statusFilter === 'ALL' || statusFilter === 'SOLD') && filteredSold.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sold Listings ({filteredSold.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSold.map((listing) => (
                  <div key={listing.id} className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-300 opacity-75">
                    <div className="px-3 py-2 text-center bg-gray-300">
                      <p className="text-xs font-bold text-gray-700">
                        {formatSuiteArea(listing.suite.area)}
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        Suite {listing.suite.number}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-700 line-clamp-1">
                          {listing.eventTitle}
                        </h3>
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          SOLD
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p>
                          {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p>
                          Price: ${listing.pricePerSeat} per seat
                        </p>
                        {listing.soldAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Sold on {new Date(listing.soldAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>

                      {/* Mark as Available Section */}
                      <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mark as Available
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={ticketQuantities[listing.id] || ''}
                            onChange={(e) => setTicketQuantities(prev => ({ ...prev, [listing.id]: e.target.value }))}
                            placeholder="Qty"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleMarkAsAvailable(listing.id)}
                            disabled={updatingStatus === listing.id}
                            className="flex-1 px-3 py-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {updatingStatus === listing.id ? 'Updating...' : 'Mark Available'}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/listing/${listing.slug}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                        >
                          View
                        </Link>
                        <Link
                          href={`/sell/edit/${listing.id}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Status Listings */}
          {statusFilter === 'ALL' && filteredOther.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Other Listings ({filteredOther.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOther.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
                    <div className="px-3 py-2 text-center bg-gray-100">
                      <p className="text-xs font-bold text-gray-700">
                        {formatSuiteArea(listing.suite.area)}
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        Suite {listing.suite.number}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                          {listing.eventTitle}
                        </h3>
                        <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {listing.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          {new Date(listing.eventDatetime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p>
                          {listing.quantity} seats × ${listing.pricePerSeat}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-600">
              © 2025 Fire Suite Exchange. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/legal/terms" className="text-gray-600 hover:text-blue-600">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-blue-600">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
