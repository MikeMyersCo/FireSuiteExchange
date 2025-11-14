"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SUITE_DATA, formatSuiteName } from '@/lib/constants';
import { createPortal } from 'react-dom';
import Header from '@/components/Header';

export default function VerifySuitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [verifiedSuites, setVerifiedSuites] = useState<any[]>([]);
  const [pendingSuites, setPendingSuites] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    suiteArea: '',
    suiteNumber: '',
    legalName: '',
    message: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

      // Upload files first if any
      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        const uploadFormData = new FormData();
        files.forEach(file => {
          uploadFormData.append('files', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files');
        }

        const uploadData = await uploadResponse.json();
        attachmentUrls = uploadData.urls || [];
      }

      // Submit application with attachment URLs
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
          attachments: attachmentUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Show success modal instead of inline message
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        suiteArea: '',
        suiteNumber: '',
        legalName: '',
        message: '',
      });
      setFiles([]);

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
      <Header />

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
                      {app.suite.area === 'V' && 'V Sections'}
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
                      {area.name} ({area.prefix}{area.suites[0]}-{area.prefix}{area.suites[area.suites.length - 1]})
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

            {/* File Upload */}
            <div>
              <label htmlFor="files" className="block text-sm font-medium text-foreground mb-2">
                Proof of Ownership Documents
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 bg-background/50 hover:bg-background transition-colors">
                <input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="files"
                  className="cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <svg className="h-12 w-12 text-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-foreground/60">
                    PDF, JPG, PNG, DOC (Max 5 files, 10MB each)
                  </p>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-foreground/60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-4 p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-foreground/60">
                Upload documents that prove your suite ownership (e.g., purchase agreement, season ticket holder card, deed, etc.)
              </p>
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

      {/* Success Modal */}
      {mounted && showSuccessModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border-2 border-green-500 bg-card p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Application Submitted Successfully! 🎉
              </h3>
              <p className="text-foreground/70">
                Thank you for applying to become a verified Fire Suite seller.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="space-y-4 mb-6">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What Happens Next?
                </h4>
                <ol className="space-y-2 text-sm text-foreground/80">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Our admin team will review your application within 24-48 hours</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>We may contact you via email if we need additional verification documents</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Once approved, you'll receive a confirmation email and can start listing tickets</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Your application status will update to "Verified" on this page</span>
                  </li>
                </ol>
              </div>

              {/* Current Status */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Current Status: Pending Verification</h4>
                    <p className="text-sm text-amber-800">
                      You'll see your suite listed in the "Pending Verification" section above while we review your application.
                    </p>
                  </div>
                </div>
              </div>

              {/* Check Email */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Check Your Email</h4>
                    <p className="text-sm text-blue-800">
                      We've sent a confirmation email to <strong>{session?.user?.email}</strong>. Please check your inbox (and spam folder) for updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-foreground transition-all hover:bg-primary-600"
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
