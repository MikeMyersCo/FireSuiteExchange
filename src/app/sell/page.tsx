"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EVENT_NAMES, EVENTS_2026 } from '@/lib/events-2026';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifiedSuites, setVerifiedSuites] = useState<any[]>([]);
  const [loadingSuites, setLoadingSuites] = useState(true);

  const [formData, setFormData] = useState({
    suiteId: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    quantity: '8',
    pricePerSeat: '',
    deliveryMethod: 'MOBILE_TRANSFER',
    contactEmail: session?.user?.email || '',
    contactPhone: (session?.user as any)?.phone || '',
    contactLink: '',
    contactMessenger: '',
    allowMessages: false,
    notes: '',
    seatNumbers: '1-8',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/login?callbackUrl=/sell');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchVerifiedSuites();
    }
  }, [status, session, router]);

  const fetchVerifiedSuites = async () => {
    try {
      const response = await fetch('/api/applications/my-applications');
      if (response.ok) {
        const data = await response.json();
        console.log('All applications:', data.applications);
        const approved = data.applications.filter((app: any) => app.status === 'APPROVED');
        console.log('Approved applications:', approved);
        setVerifiedSuites(approved);

        // Auto-select first suite if only one verified
        if (approved.length === 1) {
          setFormData(prev => ({ ...prev, suiteId: approved[0].suiteId }));
        }
      } else {
        console.error('Failed to fetch applications:', response.status);
        setError('Failed to load your verified suites');
      }
    } catch (err) {
      console.error('Failed to fetch verified suites:', err);
      setError('Failed to load your verified suites');
    } finally {
      setLoadingSuites(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Auto-fill event date and time when an event is selected
      if (name === 'eventTitle') {
        const matchedEvent = EVENTS_2026.find(event => event.artist === value);
        if (matchedEvent) {
          const eventDate = new Date(matchedEvent.date);
          const dateStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const timeStr = eventDate.toISOString().split('T')[1].substring(0, 5); // HH:MM

          setFormData(prev => ({
            ...prev,
            [name]: value,
            eventDate: dateStr,
            eventTime: timeStr,
          }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate suite selection
      if (!formData.suiteId) {
        throw new Error('Please select a suite');
      }

      // Combine date and time into datetime
      const eventDatetime = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suiteId: formData.suiteId,
          eventTitle: formData.eventTitle,
          eventDatetime,
          quantity: parseInt(formData.quantity),
          pricePerSeat: parseFloat(formData.pricePerSeat),
          deliveryMethod: formData.deliveryMethod,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || null,
          contactLink: formData.contactLink || null,
          contactMessenger: formData.contactMessenger || null,
          allowMessages: formData.allowMessages,
          notes: formData.notes || null,
          seatNumbers: formData.seatNumbers || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      setSuccess('Listing created successfully! Redirecting to browse page...');

      // Redirect to browse page after a short delay
      setTimeout(() => {
        router.push('/browse');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loadingSuites) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to verification if no verified suites (unless admin)
  if (!loadingSuites && verifiedSuites.length === 0 && session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-accent">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold text-accent-foreground">
              🔥 Fire Suite Exchange
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-8 mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-heading-lg font-bold text-foreground mb-4">
                Suite Verification Required
              </h1>
              <p className="text-foreground/70 mb-6">
                To list tickets, you must first verify that you own a Fire Suite at Ford Amphitheater.
              </p>
              <Link
                href="/verify-suite"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md"
              >
                Verify Your Suite Ownership
              </Link>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6 border border-border text-left">
              <h2 className="text-heading-sm font-bold text-foreground mb-3">
                Why do we require verification?
              </h2>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Ensures all listings are from legitimate Fire Suite owners</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Prevents fraudulent ticket sales</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Builds trust in the marketplace</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Protects both buyers and sellers</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If admin with no verified suites, show a warning but let them proceed
  const isAdminBypass = session?.user?.role === 'ADMIN' && verifiedSuites.length === 0;

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
            <Link href="/sell" className="text-sm font-medium text-blue-600">
              List Tickets
            </Link>
            <Link href="/sell/my-listings" className="text-sm font-medium hover:text-blue-600">
              My Listings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              List Your Tickets
            </h1>
            <p className="text-gray-600">
              Fill out the form below to list your Fire Suite tickets for sale.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Suite Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Your Suite</h2>

              <div>
                <label htmlFor="suiteId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Suite *
                </label>
                <select
                  id="suiteId"
                  name="suiteId"
                  required
                  value={formData.suiteId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a suite</option>
                  {verifiedSuites.map((app) => (
                    <option key={app.id} value={app.suiteId}>
                      {app.suite.displayName} - {app.suite.area === 'L' ? 'Lower Fire Suite' : app.suite.area === 'UNT' ? 'Upper North Terrace' : 'Upper South Terrace'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  You can only list tickets for suites you own. {verifiedSuites.length > 1 ? `You have ${verifiedSuites.length} verified suites.` : ''}
                </p>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Event Information</h2>

              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  id="eventTitle"
                  name="eventTitle"
                  type="text"
                  required
                  value={formData.eventTitle}
                  onChange={handleChange}
                  list="eventSuggestions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Train, Beck, Chicago..."
                />
                <datalist id="eventSuggestions">
                  {EVENT_NAMES.map((eventName) => (
                    <option key={eventName} value={eventName} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-600">
                  Start typing to see 2026 concert suggestions
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Time *
                  </label>
                  <input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    required
                    value={formData.eventTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Ticket Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats *
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerSeat" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Seat ($) *
                  </label>
                  <input
                    id="pricePerSeat"
                    name="pricePerSeat"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricePerSeat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="seatNumbers" className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Numbers (optional)
                </label>
                <input
                  id="seatNumbers"
                  name="seatNumbers"
                  type="text"
                  value={formData.seatNumbers}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1, 2, 3, 4"
                />
              </div>

              <div>
                <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method *
                </label>
                <select
                  id="deliveryMethod"
                  name="deliveryMethod"
                  required
                  value={formData.deliveryMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MOBILE_TRANSFER">Mobile Transfer</option>
                  <option value="PAPER">Paper Tickets</option>
                  <option value="PDF">PDF/Email</option>
                  <option value="WILL_CALL">Will Call</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Contact Information</h2>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone (optional)
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="contactLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Contact Link (optional)
                </label>
                <input
                  id="contactLink"
                  name="contactLink"
                  type="url"
                  value={formData.contactLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="contactMessenger" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Messenger Username (optional)
                </label>
                <input
                  id="contactMessenger"
                  name="contactMessenger"
                  type="text"
                  value={formData.contactMessenger}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.username"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Enter your Facebook username (e.g., "john.smith" from facebook.com/john.smith)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="allowMessages"
                  name="allowMessages"
                  type="checkbox"
                  checked={formData.allowMessages}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowMessages" className="ml-2 text-sm text-gray-700">
                  Allow buyers to message me through the platform
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information about the tickets..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Small, less prominent link to verify additional suites */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Own multiple suites?{' '}
              <Link href="/verify-suite" className="text-blue-600 hover:underline font-medium">
                Verify another suite
              </Link>
            </p>
          </div>
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
