import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthSessionProvider from '@/components/providers/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fire Suite Exchange | Ford Amphitheater Tickets',
  description:
    'Verified ticket exchange for Ford Amphitheater Fire Suite owners in Colorado Springs',
  keywords: ['Ford Amphitheater', 'Fire Suite', 'Tickets', 'Colorado Springs', 'Concert Tickets'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <div className="min-h-screen bg-background">{children}</div>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
