'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { isRefreshing, pullDistance } = usePullToRefresh({ onRefresh });

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center transition-all duration-200 md:hidden"
        style={{
          height: `${Math.min(pullDistance, 80)}px`,
          opacity: Math.min(pullDistance / 80, 1),
        }}
      >
        <div className="flex flex-col items-center gap-2 text-accent">
          {isRefreshing ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-accent border-t-transparent"></div>
              <span className="text-xs font-semibold">Refreshing...</span>
            </>
          ) : (
            <>
              <svg
                className="h-6 w-6 transition-transform"
                style={{
                  transform: `rotate(${Math.min(pullDistance / 80, 1) * 180}deg)`,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="text-xs font-semibold">
                {pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? 80 : pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
