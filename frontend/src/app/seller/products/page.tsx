'use client'

import dynamic from 'next/dynamic';

// Loading component for better UX
function ProductsLoading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="h-4 bg-muted rounded animate-pulse w-64" />
        </div>

        {/* Filters Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded animate-pulse w-32" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-muted rounded animate-pulse flex-1" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {/* Desktop Table Skeleton */}
          <div className="hidden md:block border rounded-lg bg-white">
            <div className="p-4 border-b">
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
            </div>
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-48" />
                    <div className="h-3 bg-muted rounded animate-pulse w-32" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards Skeleton */}
          <div className="block md:hidden space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg border animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic import with no SSR to prevent hydration issues
const ProductsPageClient = dynamic(() => import('@/components/features/seller/ProductsPageClient'), {
  ssr: false,
  loading: () => <ProductsLoading />
});

export default ProductsPageClient;