'use client'

import dynamic from 'next/dynamic'
import { useRouteGuard } from '@/hooks/useRouteGuard'
import { PageLayout } from '@/components/layout/PageLayout'

// Client-only orders component with loading fallback
const OrdersPageContent = dynamic(() => import('@/components/features/orders/OrdersPageClient'), {
  ssr: false,
  loading: () => (
    <PageLayout fullHeight className="bg-gray-50/50 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Filter section skeleton */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="animate-pulse flex gap-4">
            <div className="h-11 bg-gray-200 rounded flex-1"></div>
            <div className="h-11 bg-gray-200 rounded w-40"></div>
            <div className="h-11 bg-gray-200 rounded w-40"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sidebar skeleton */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
})

export default function OrdersPage() {
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Buyer', 'Seller'],
    unauthorizedRedirect: '/login'
  });

  if (isChecking) {
    return (
      <PageLayout fullHeight className="bg-gray-50/50 ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="animate-pulse flex gap-4">
              <div className="h-11 bg-gray-200 rounded flex-1"></div>
              <div className="h-11 bg-gray-200 rounded w-40"></div>
              <div className="h-11 bg-gray-200 rounded w-40"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-gray-200 rounded w-32"></div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <OrdersPageContent />
  )
}