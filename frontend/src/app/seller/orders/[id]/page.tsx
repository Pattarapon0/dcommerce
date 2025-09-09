'use client'

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useRouteGuard } from '@/hooks/useRouteGuard';

function OrderDetailLoading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Order details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order summary card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Order items card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const OrderDetailPageClient = dynamic(() => import('@/components/features/seller/OrderDetailPageClient'), {
  ssr: false,
  loading: () => <OrderDetailLoading />
});

export default function SellerOrderDetailPage() {
  const params = useParams();
  const { id } = params.id ? { id: params.id } : { id: '' };
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Seller'],
    unauthorizedRedirect: '/',
    customRedirects: {
      'Buyer': '/become-seller'
    }
  });

  if (isChecking) {
    return <OrderDetailLoading />;
  }

  return <OrderDetailPageClient orderId={id instanceof Array ? id[0] : id} />;
}