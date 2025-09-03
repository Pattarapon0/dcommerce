"use client";

interface ProductGridSkeletonProps {
  showFeatured?: boolean;
  count?: number;
}

export function ProductGridSkeleton({ showFeatured = true, count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Featured Product Skeleton */}
      {showFeatured && (
        <div className="animate-pulse" aria-label="Loading featured product">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0 max-h-[40vh] lg:max-h-none">
              {/* Image */}
              <div className="aspect-[4/3] bg-gray-200" />
              
              {/* Content */}
              <div className="p-6 lg:p-8 space-y-4">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="flex gap-3">
                  <div className="h-12 flex-1 bg-gray-200 rounded" />
                  <div className="h-12 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden" aria-label="Loading product">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Product name */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        
        {/* Seller and sales */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        
        {/* Button */}
        <div className="h-8 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function FilterPanelSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
      
      {/* Price section */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      
      {/* Categories section */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-8" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Availability section */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="flex items-center space-x-2">
          <div className="h-6 w-10 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function SearchHeaderSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-between flex-wrap gap-4">
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-48" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}