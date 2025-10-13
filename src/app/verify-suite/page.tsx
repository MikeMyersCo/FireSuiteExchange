"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SUITE_DATA, formatSuiteName } from '@/lib/constants';

export default function VerifySuitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifiedSuites, setVerifiedSuites] = useState<any[]>([]);
  const [pendingSuites, setPendingSuites] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    suiteArea: '',
    suiteNumber: '',
    legalName: '',
    message: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserApplications();
    }
  }, [status, session]);

  const fetchUserApplications = async () => {
    try {
      const response = await fetch('/api/applications/my-applications');
      if (response.ok) {
        const data = await response.json();
        setVerifiedSuites(data.applications.filter((app: any) => app.status === 'APPROVED'));
        setPendingSuites(data.applications.filter((app: any) => app.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.suiteArea || !formData.suiteNumber) {
        throw new Error('Please select a suite');
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suiteArea: formData.suiteArea,
          suiteNumber: parseInt(formData.suiteNumber),
          legalName: formData.legalName,
          message: formData.message || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess('Application submitted successfully! We will review your ownership verification and notify you via email.');

      // Reset form
      setFormData({
        suiteArea: '',
        suiteNumber: '',
        legalName: '',
        message: '',
      });

      // Refresh applications
      setTimeout(() => {
        fetchUserApplications();
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedArea = SUITE_DATA.areas.find(area => area.id === formData.suiteArea);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-accent">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-accent-foreground">
            🔥 Fire Suite Exchange
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/browse" className="text-sm font-medium text-accent-foreground/80 hover:text-accent-foreground">
              Browse Listings
            </Link>
            <Link href="/verify-suite" className="text-sm font-medium text-accent-foreground">
              Verify Suite
            </Link>
            <Link href="/sell" className="text-sm font-medium text-accent-foreground/80 hover:text-accent-foreground">
              List Tickets
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-heading-lg font-bold text-foreground mb-2">
              Verify Fire Suite Ownership
            </h1>
            <p className="text-foreground/70">
              To list tickets, you must first verify that you own a Fire Suite. You can verify multiple suites if you own more than one.
            </p>
          </div>

          {/* Verified Suites */}
          {verifiedSuites.length > 0 && (
            <div className="mb-8 bg-card rounded-xl shadow-card p-6 border border-border">
              <h2 className="text-heading-sm font-bold text-foreground mb-4">
                ✅ Your Verified Suites
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {verifiedSuites.map((app) => (
                  <div
                    key={app.id}
                    className="bg-primary/10 rounded-lg px-4 py-3 text-center border-2 border-primary"
                  >
                    <div className="text-2xl font-bold text-foreground">
                      {app.suite.displayName}
                    </div>
                    <div className="text-xs text-foreground/60 mt-1">
                      {app.suite.area === 'L' && 'Lower'}
                      {app.suite.area === 'UNT' && 'Upper North'}
                      {app.suite.area === 'UST' && 'Upper South'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                >
                  List Tickets for Your Suites
                </Link>
              </div>
            </div>
          )}

          {/* Pending Applications */}
          {pendingSuites.length > 0 && (
            <div className="mb-8 bg-amber-50 rounded-xl shadow-card p-6 border border-amber-200">
              <h2 className="text-heading-sm font-bold text-amber-900 mb-4">
                ⏳ Pending Verification
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pendingSuites.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-lg px-4 py-3 text-center border-2 border-amber-300"
                  >
                    <div className="text-2xl font-bold text-amber-900">
                      {app.suite.displayName}
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      Under Review
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-8 border border-border space-y-6">
            <h2 className="text-heading-sm font-bold text-foreground pb-2 border-b border-border">
              Apply to Verify a New Suite
            </h2>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground/70">
                <strong className="text-foreground">Note:</strong> You'll need to provide proof of ownership (e.g., purchase receipt, season ticket holder documentation) during the verification process. Our admin team will review your application.
              </p>
            </div>

            {/* Suite Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="suiteArea" className="block text-sm font-medium text-foreground mb-2">
                  Suite Area *
                </label>
                <select
                  id="suiteArea"
                  name="suiteArea"
                  required
                  value={formData.suiteArea}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="">Select an area</option>
                  {SUITE_DATA.areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.prefix}1-{area.prefix}{area.suites.length})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="suiteNumber" className="block text-sm font-medium text-foreground mb-2">
                  Suite Number *
                </label>
                <select
                  id="suiteNumber"
                  name="suiteNumber"
                  required
                  value={formData.suiteNumber}
                  onChange={handleChange}
                  disabled={!formData.suiteArea}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a number</option>
                  {selectedArea && selectedArea.suites.map(num => (
                    <option key={num} value={num}>
                      {formatSuiteName(selectedArea.prefix, num)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Legal Name */}
            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-foreground mb-2">
                Legal Name on Suite Ownership *
              </label>
              <input
                id="legalName"
                name="legalName"
                type="text"
                required
                value={formData.legalName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Full legal name as appears on ownership documents"
              />
              <p className="mt-1 text-xs text-foreground/60">
                This must match the name on your ownership documentation
              </p>
            </div>

            {/* Additional Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Additional Information (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Any additional information about your suite ownership..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Submitting Application...' : 'Submit Verification Application'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-foreground bg-primary text-foreground rounded-xl font-semibold hover:bg-primary-600 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-card rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Verification Process
            </h3>
            <ol className="space-y-2 text-sm text-foreground/70">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Submit your application with the legal name on your suite ownership</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Our admin team will contact you via email to verify ownership documents</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Once approved, you can start listing tickets for your verified suite(s)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>You can verify multiple suites if you own more than one</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-foreground/60">
              © 2025 Fire Suite Exchange. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/legal/terms" className="text-foreground/60 hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-foreground/60 hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
