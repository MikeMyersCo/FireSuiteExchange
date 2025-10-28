"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sellingTickets, setSellingTickets] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, string>>({});

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

  const handleSellTickets = async (listingId: string, availableQuantity: number) => {
    const quantityToSell = ticketQuantities[listingId];

    if (!quantityToSell || quantityToSell.trim() === '') {
      setError('Please enter the number of tickets sold');
      return;
    }

    const qty = parseInt(quantityToSell);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (qty > availableQuantity) {
      setError(`Cannot sell ${qty} tickets. Only ${availableQuantity} available.`);
      return;
    }

    if (!confirm(`Mark ${qty} ticket(s) as sold?`)) {
      return;
    }

    setSellingTickets(listingId);
    setError('');

    try {
      const response = await fetch('/api/listings/sell-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, quantitySold: qty }),
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
        // Clear the input
        setTicketQuantities(prev => ({ ...prev, [listingId]: '' }));
        // Show success message briefly
        alert(data.message);
      } else {
        setError(data.error || 'Failed to sell tickets');
      }
    } catch (err) {
      console.error('Failed to sell tickets:', err);
      setError('Failed to sell tickets');
    } finally {
      setSellingTickets(null);
    }
  };

  const handleMarkAllAsSold = async (listingId: string, quantity: number) => {
    if (!confirm(`Mark all ${quantity} ticket(s) as sold?`)) {
      return;
    }

    setUpdatingStatus(listingId);
    setError('');

    try {
      const response = await fetch('/api/listings/sell-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, quantitySold: quantity }),
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
      } else {
        setError(data.error || 'Failed to mark listing as sold');
      }
    } catch (err) {
      console.error('Failed to mark listing as sold:', err);
      setError('Failed to mark listing as sold');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMarkAsAvailable = async (listingId: string) => {
    const quantityToRestore = ticketQuantities[listingId];

    if (!quantityToRestore || quantityToRestore.trim() === '') {
      setError('Please enter the number of tickets available');
      return;
    }

    const qty = parseInt(quantityToRestore);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (!confirm(`Mark this listing as available with ${qty} ticket(s)?`)) {
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
        // Clear the input
        setTicketQuantities(prev => ({ ...prev, [listingId]: '' }));
      } else {
        setError(data.error || 'Failed to update listing status');
      }
    } catch (err) {
      console.error('Failed to update listing status:', err);
      setError('Failed to update listing status');
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

  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const soldListings = listings.filter(l => l.status === 'SOLD');
  const otherListings = listings.filter(l => l.status !== 'ACTIVE' && l.status !== 'SOLD');

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

          {/* Active Listings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Active Listings ({activeListings.length})
            </h2>
            {activeListings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeListings.map((listing) => (
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sell Tickets
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max={listing.quantity}
                            value={ticketQuantities[listing.id] || ''}
                            onChange={(e) => setTicketQuantities(prev => ({ ...prev, [listing.id]: e.target.value }))}
                            placeholder={`1-${listing.quantity}`}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleSellTickets(listing.id, listing.quantity)}
                            disabled={sellingTickets === listing.id}
                            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {sellingTickets === listing.id ? 'Selling...' : 'Sell'}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/listing/${listing.slug}`}
                          className="flex-1 text-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleMarkAllAsSold(listing.id, listing.quantity)}
                          disabled={updatingStatus === listing.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                <p className="text-gray-600 mb-4">You don't have any active listings.</p>
                <Link
                  href="/sell"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your First Listing
                </Link>
              </div>
            )}
          </div>

          {/* Sold Listings */}
          {soldListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sold Listings ({soldListings.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {soldListings.map((listing) => (
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

                      <Link
                        href={`/listing/${listing.slug}`}
                        className="block text-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Status Listings */}
          {otherListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Other Listings ({otherListings.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherListings.map((listing) => (
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
