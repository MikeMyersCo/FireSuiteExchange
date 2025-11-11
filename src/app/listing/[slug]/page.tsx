'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ListingDetails {
  id: string;
  eventTitle: string;
  eventDatetime: string;
  quantity: number;
  pricePerSeat: string;
  deliveryMethod: string;
  contactEmail: string;
  contactPhone?: string;
  contactLink?: string;
  contactMessenger?: string;
  allowMessages: boolean;
  notes?: string;
  seatNumbers?: string;
  status: string;
  slug: string;
  viewCount: number;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  suite: {
    id: string;
    area: string;
    number: number;
    displayName: string;
    capacity: number;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchListing();
    }
  }, [slug]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setListing(data.listing);
      } else {
        setError(data.error || 'Listing not found');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSuiteAreaName = (area: string) => {
    switch (area) {
      case 'L':
        return 'Lower Fire Suite';
      case 'UNT':
        return 'Upper North Terrace';
      case 'UST':
        return 'Upper South Terrace';
      default:
        return area;
    }
  };

  const getDeliveryMethodName = (method: string) => {
    switch (method) {
      case 'MOBILE_TRANSFER':
        return 'AXS Mobile Transfer';
      case 'PAPER':
        return 'Paper Tickets';
      case 'PDF':
        return 'PDF/Email';
      case 'WILL_CALL':
        return 'Will Call';
      case 'OTHER':
        return 'Other (see notes)';
      default:
        return method;
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setMessageError('Please enter a message');
      return;
    }

    if (!listing) return;

    setSendingMessage(true);
    setMessageError('');

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          message: messageText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - close modal and reset
        setShowMessageModal(false);
        setMessageText('');
        alert('Message sent successfully! The seller will receive your message.');
      } else {
        setMessageError(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-accent">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-accent-foreground">
              🔥 Fire Suite Exchange
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-heading-lg font-bold text-foreground mb-4">
              {error || 'Listing Not Found'}
            </h1>
            <p className="text-foreground/70 mb-8">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/browse"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary px-8 text-base font-semibold text-foreground transition-all hover:bg-primary-600"
            >
              Browse All Listings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalPrice = parseFloat(listing.pricePerSeat) * listing.quantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-accent">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-accent-foreground transition-opacity hover:opacity-80">
            🔥 Fire Suite Exchange
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
              Browse Listings
            </Link>
            {session ? (
              <Link href="/sell" className="text-sm font-medium text-accent-foreground/90 transition-colors hover:text-accent-foreground">
                List Tickets
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-foreground/60">
            <Link href="/browse" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <span>/</span>
            <span className="text-foreground">{listing.eventTitle}</span>
          </nav>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Card */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card-subtle">
              <h1 className="text-heading-lg font-bold text-foreground mb-4">
                {listing.eventTitle}
              </h1>

              <div className="space-y-3 text-foreground/70">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-foreground">Event Date & Time</div>
                    <div>{formatDate(listing.eventDatetime)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-foreground">Suite Location</div>
                    <div>{getSuiteAreaName(listing.suite.area)} - Suite {listing.suite.displayName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="font-medium text-foreground">Available Seats</div>
                    <div>{listing.quantity} of {listing.suite.capacity} seats</div>
                    {listing.seatNumbers && (
                      <div className="text-sm mt-1">Seat numbers: {listing.seatNumbers}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <div className="font-medium text-foreground">Delivery Method</div>
                    <div>{getDeliveryMethodName(listing.deliveryMethod)}</div>
                  </div>
                </div>
              </div>

              {listing.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-2">Additional Notes</h3>
                  <p className="text-foreground/70 whitespace-pre-wrap">{listing.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Price & Contact */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-card-hover sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-foreground/70 mb-1">Price per seat</div>
                <div className="text-4xl font-bold text-foreground">${listing.pricePerSeat}</div>
                <div className="text-sm text-foreground/60 mt-2">
                  Total for {listing.quantity} seats: <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {listing.allowMessages && session && listing.seller.id !== session.user?.id && (
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-foreground bg-primary px-4 text-base font-semibold text-foreground transition-all hover:bg-primary-600 active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message Seller
                  </button>
                )}

                {listing.contactEmail && (
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-foreground bg-background px-4 text-base font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Seller
                  </a>
                )}

                {listing.contactPhone && (
                  <a
                    href={`sms:${listing.contactPhone}`}
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-foreground bg-background px-4 text-base font-semibold text-foreground transition-all hover:bg-secondary"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Text Seller
                  </a>
                )}

                {listing.contactMessenger && (
                  <a
                    href={`https://m.me/${listing.contactMessenger}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-foreground bg-background px-4 text-base font-semibold text-foreground transition-all hover:bg-secondary"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                    </svg>
                    Message on Messenger
                  </a>
                )}

                {listing.contactLink && (
                  <a
                    href={listing.contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-foreground bg-background px-4 text-base font-semibold text-foreground transition-all hover:bg-secondary"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Contact Link
                  </a>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified suite owner
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60 mt-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {listing.viewCount} views
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Meet in a public place or use secure payment methods</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Verify tickets before completing payment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Never send money to someone you haven't verified</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Browse */}
        <div className="mt-12 text-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all listings
          </Link>
        </div>
      </main>

      {/* Footer */}
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

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Message Seller</h2>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText('');
                    setMessageError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Listing:</p>
                <p className="font-semibold text-gray-900">{listing?.eventTitle}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {listing?.suite && `${getSuiteAreaName(listing.suite.area)} - Suite ${listing.suite.displayName}`}
                </p>
              </div>

              {messageError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {messageError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ask about the tickets, delivery, or anything else..."
                  rows={6}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {messageText.length}/2000 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText('');
                    setMessageError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
