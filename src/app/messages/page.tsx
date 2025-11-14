"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  listing: {
    id: string;
    eventTitle: string;
    slug: string;
    status: string;
    suite: {
      displayName: string;
    };
  };
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'inbox' | 'sent'>('inbox');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/messages');
      return;
    }

    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, filter, router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?type=${filter}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setUnreadCount(data.unreadCount);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        // Update local state
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        // Update local state
        setMessages(prev =>
          prev.map(msg => ({ ...msg, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all messages as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">View and manage your conversations</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('inbox')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'inbox'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Inbox {filter === 'inbox' && unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                All
              </button>
            </div>

            {filter === 'inbox' && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Messages List */}
          {messages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-gray-600 mb-2 text-lg">No messages yet</p>
              <p className="text-gray-500 text-sm">
                {filter === 'inbox' && "You haven't received any messages yet."}
                {filter === 'sent' && "You haven't sent any messages yet."}
                {filter === 'all' && "You don't have any messages yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isInbox = message.toUser.id === session?.user?.id;
                const otherUser = isInbox ? message.fromUser : message.toUser;
                const isUnread = isInbox && !message.isRead;

                return (
                  <div
                    key={message.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden border transition-all hover:shadow-lg ${
                      isUnread ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isUnread && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <span className="font-semibold text-gray-900">
                              {isInbox ? 'From' : 'To'}: {otherUser.name || otherUser.email}
                            </span>
                            {!isInbox && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Sent</span>
                            )}
                          </div>
                          <Link
                            href={`/listing/${message.listing.slug}`}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Re: {message.listing.eventTitle} - Suite {message.listing.suite.displayName}
                          </Link>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(message.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {message.body}
                      </p>
                    </div>
                  </div>
                );
              })}
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
