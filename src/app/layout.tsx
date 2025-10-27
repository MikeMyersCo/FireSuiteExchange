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
          {/* Demo Notice Banner */}
          <div className="sticky top-0 z-[100] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-4 py-2 text-center shadow-lg">
            <p className="text-sm font-bold text-white drop-shadow-md">
              ⚠️ DEMO SITE ONLY - This is not real data and should not be used for any transactions ⚠️
            </p>
          </div>
          <div className="min-h-screen bg-background">{children}</div>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
