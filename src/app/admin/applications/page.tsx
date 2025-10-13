"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchApplications();
      }
    }
  }, [status, session, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = filter ? `/api/applications?status=${filter}` : '/api/applications';
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    setProcessingId(applicationId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          adminNote: 'Approved by admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve application');
      }

      setSuccess('Application approved successfully');
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for denial (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(applicationId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DENIED',
          deniedReason: reason || 'No reason provided',
          adminNote: 'Denied by admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deny application');
      }

      setSuccess('Application denied');
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to deny application');
    } finally {
      setProcessingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-accent">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-accent-foreground">
            🔥 Fire Suite Exchange - Admin
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/admin/applications" className="text-sm font-medium text-accent-foreground">
              Applications
            </Link>
            <Link href="/" className="text-sm font-medium text-accent-foreground/80 hover:text-accent-foreground">
              Back to Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-heading-lg font-bold text-foreground mb-2">
              Suite Ownership Applications
            </h1>
            <p className="text-foreground/70">
              Review and approve/deny suite ownership verification requests
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'PENDING'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'APPROVED'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('DENIED')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'DENIED'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              Denied
            </button>
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === ''
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              All
            </button>
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

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-card rounded-xl shadow-card p-8 border border-border text-center">
              <p className="text-foreground/70">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-card rounded-xl shadow-card p-6 border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">
                          Suite {app.suite.displayName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70">
                        {app.suite.area === 'L' && 'Lower Fire Suite'}
                        {app.suite.area === 'UNT' && 'Upper North Terrace'}
                        {app.suite.area === 'UST' && 'Upper South Terrace'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-foreground/60">
                      <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      {app.decidedAt && (
                        <p>Decided: {new Date(app.decidedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Applicant</p>
                      <p className="text-sm text-foreground/70">{app.user.name || 'N/A'}</p>
                      <p className="text-sm text-foreground/70">{app.user.email}</p>
                      {app.user.phone && (
                        <p className="text-sm text-foreground/70">{app.user.phone}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Legal Name</p>
                      <p className="text-sm text-foreground/70">{app.legalName}</p>
                    </div>
                  </div>

                  {app.message && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-1">Message</p>
                      <p className="text-sm text-foreground/70 bg-background/50 rounded p-3">
                        {app.message}
                      </p>
                    </div>
                  )}

                  {app.deniedReason && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-1">Denial Reason</p>
                      <p className="text-sm text-red-600 bg-red-50 rounded p-3">
                        {app.deniedReason}
                      </p>
                    </div>
                  )}

                  {app.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={processingId === app.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === app.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeny(app.id)}
                        disabled={processingId === app.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === app.id ? 'Processing...' : 'Deny'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
