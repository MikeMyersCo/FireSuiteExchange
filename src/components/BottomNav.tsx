'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show on admin/auth pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/approver')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const canSell = session && (session.user?.role === 'SELLER' || session.user?.role === 'ADMIN');

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation - Only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 h-16">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isActive('/')
                ? 'text-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <svg className="h-6 w-6" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          {/* Browse */}
          <Link
            href="/browse"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isActive('/browse')
                ? 'text-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <svg className="h-6 w-6" fill={isActive('/browse') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span className="text-[10px] font-semibold">Browse</span>
          </Link>

          {/* Sell/Verify */}
          <Link
            href={canSell ? "/sell" : "/verify-suite"}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isActive('/sell') || isActive('/verify-suite')
                ? 'text-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <div className="relative">
              <svg className="h-6 w-6" fill={isActive('/sell') || isActive('/verify-suite') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">{canSell ? 'Sell' : 'Verify'}</span>
          </Link>

          {/* Profile/Login */}
          <Link
            href={session ? "/profile" : "/login"}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isActive('/profile') || isActive('/login')
                ? 'text-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <svg className="h-6 w-6" fill={isActive('/profile') || isActive('/login') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-semibold">{session ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
