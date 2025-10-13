"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    quantity: '',
    pricePerSeat: '',
    deliveryMethod: 'MOBILE_TRANSFER',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    contactLink: '',
    allowMessages: false,
    notes: '',
    seatNumbers: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Combine date and time into datetime
      const eventDatetime = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTitle: formData.eventTitle,
          eventDatetime,
          quantity: parseInt(formData.quantity),
          pricePerSeat: parseFloat(formData.pricePerSeat),
          deliveryMethod: formData.deliveryMethod,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || null,
          contactLink: formData.contactLink || null,
          allowMessages: formData.allowMessages,
          notes: formData.notes || null,
          seatNumbers: formData.seatNumbers || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      setSuccess('Listing created successfully!');

      // Redirect to the new listing after a short delay
      setTimeout(() => {
        router.push(`/listing/${data.listing.slug}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Firebirds vs Gulls"
                />
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
                href="/sell/my-listings"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
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
