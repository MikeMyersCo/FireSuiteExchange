import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <>
        {items.map((i) => (
          <div
            key={i}
            className={`animate-pulse overflow-hidden rounded-xl border border-border bg-card shadow-card-subtle ${className}`}
          >
            <div className="h-16 bg-gradient-to-r from-green-100 to-yellow-100" />
            <div className="flex flex-col p-4">
              <div className="mb-3 h-6 w-3/4 rounded bg-foreground/10" />
              <div className="mb-3 h-4 w-1/2 rounded bg-foreground/5" />
              <div className="mb-3 h-px bg-border" />
              <div className="mb-2 flex justify-between">
                <div className="h-4 w-24 rounded bg-foreground/5" />
                <div className="h-6 w-16 rounded bg-foreground/10" />
              </div>
              <div className="mb-3 flex justify-between">
                <div className="h-4 w-24 rounded bg-foreground/5" />
                <div className="h-4 w-12 rounded bg-foreground/10" />
              </div>
              <div className="h-10 w-full rounded-lg bg-foreground/10" />
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="h-8 rounded-lg bg-foreground/5" />
                <div className="h-8 rounded-lg bg-foreground/5" />
                <div className="h-8 rounded-lg bg-foreground/5" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className={`h-4 animate-pulse rounded bg-foreground/10 ${className}`} />
        ))}
      </>
    );
  }

  if (variant === 'circle') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className={`animate-pulse rounded-full bg-foreground/10 ${className}`} />
        ))}
      </>
    );
  }

  if (variant === 'rectangle') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className={`animate-pulse rounded bg-foreground/10 ${className}`} />
        ))}
      </>
    );
  }

  return null;
}

export default SkeletonLoader;
