'use client'

import dynamic from 'next/dynamic';
import { useRouteGuard } from '@/hooks/useRouteGuard';

function OrdersLoading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Filter section skeleton */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-11 bg-gray-200 rounded flex-1"></div>
              <div className="h-11 bg-gray-200 rounded w-40"></div>
              <div className="h-11 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="flex gap-2 ml-auto">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const OrdersPageClient = dynamic(() => import('@/components/features/seller/OrdersPageClient'), {
  ssr: false,
  loading: () => <OrdersLoading />
});

export default function SellerOrdersPage() {
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Seller'],
    unauthorizedRedirect: '/',
    customRedirects: {
      'Buyer': '/become-seller'
    }
  });

  if (isChecking) {
    return <OrdersLoading />;
  }

  return <OrdersPageClient />;
}