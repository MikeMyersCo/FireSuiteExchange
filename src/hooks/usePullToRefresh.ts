'use client';

import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    let touchStartY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if we're at the top of the page and not already refreshing
      if (window.scrollY === 0 && !isRefreshing) {
        touchStartY = e.touches[0].clientY;
        startYRef.current = touchStartY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;

      // Only track pull-down gesture when at top of page
      if (distance > 0 && window.scrollY === 0) {
        // Apply resistance for smooth feel
        const resistance = 0.5;
        const adjustedDistance = Math.min(distance * resistance, maxPullDistance);
        setPullDistance(adjustedDistance);

        // Prevent default scrolling when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshing) return;

      isPullingRef.current = false;

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset pull distance
      setPullDistance(0);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, threshold, maxPullDistance, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
  };
}
