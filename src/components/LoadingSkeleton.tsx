'use client';

export function ListingCardSkeleton() {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card-subtle animate-pulse">
      <div className="px-3 py-2 bg-gradient-to-r from-gray-200 to-gray-100">
        <div className="h-3 bg-gray-300 rounded w-24 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="h-5 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>

        <div className="mb-2 flex items-center justify-center gap-1.5">
          <div className="h-4 bg-gray-300 rounded-full w-16"></div>
          <div className="h-4 bg-gray-300 rounded-full w-12"></div>
        </div>

        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="h-3 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-300 rounded w-12"></div>
        </div>

        <div className="mb-3 mt-auto space-y-1 border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-300 rounded w-20"></div>
            <div className="h-6 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-8"></div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="h-9 bg-gray-300 rounded-lg w-full"></div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-9 bg-gray-200 rounded-lg"></div>
            <div className="h-9 bg-gray-200 rounded-lg"></div>
            <div className="h-9 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card-subtle animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-16 w-16 bg-gray-300 rounded-xl"></div>
        <div className="h-10 w-12 bg-gray-300 rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-32"></div>
    </div>
  );
}

export function EventGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
