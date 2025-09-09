"use client";

import { useState, useCallback } from 'react';
import OrdersTable from "@/components/features/orders/OrdersTable";
import SellerOrderCard from "@/components/features/orders/SellerOrderCard";
import OrdersFilters from "@/components/features/orders/OrdersFilters";
import { Button } from "@/components/ui/button";
import { useOrdersTable } from '@/hooks/useOrdersTable';
import { type ServerSideOrderParams } from '@/hooks/useOrderUtils';
import { useRouter } from 'next/navigation';

export default function OrdersPageClient() {
  // Initialize with default parameters
  const [filters] = useState<ServerSideOrderParams>({
    pageSize: 20,
    sortBy: "CreatedAt",
    ascending: false
  });

  // Use the new orders table hook
  const {
    orders,
    totalCount,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isSearching,
    fetchNextPage,
    refetch,
    updateParams,
    handleUpdateStatus,
    handleCancelItem,
    handleBulkUpdateStatus,
    handleBulkCancel,
    isReady,
    hasData,
    currentParams
  } = useOrdersTable(filters);

  // Mock pagination state for compatibility with existing table component
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = currentParams.pageSize || 20;

  // Handle filters change from OrdersFilters component
  const handleFiltersChange = useCallback((newFilters: { 
    search?: string; 
    status?: string; 
    dateRange?: { from: string; to: string } 
  }) => {
    const updatedParams: Partial<ServerSideOrderParams> = {
      searchTerm: newFilters.search || undefined,
      status: newFilters.status && newFilters.status !== 'all' ? newFilters.status : undefined,
      minDate: newFilters.dateRange?.from,
      maxDate: newFilters.dateRange?.to
    };
    
    updateParams(updatedParams);
    setCurrentPage(1); // Reset to first page when filters change
  }, [updateParams]);

  // Calculate pagination for display (client-side pagination of loaded data)
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const router = useRouter();
  const handleViewDetails = useCallback((orderId: string) => {
    router.push(`/seller/orders/${orderId}`);
  }, [router]);

  // Error handling
  if (isError) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load orders
            </h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Something went wrong while loading your orders.'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your orders in one place
          </p>
          {isSearching && (
            <p className="text-sm text-blue-600 mt-1">
              Searching... {/* Show when search is being debounced */}
            </p>
          )}
        </div>

        {/* Filters */}
        <OrdersFilters 
          onFiltersChange={handleFiltersChange}
          totalOrders={totalCount}
          isLoading={isLoading}
          canUseFilters={isReady || hasData}
        />

        {/* Loading state */}
        {isLoading && !hasData && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your orders...</p>
          </div>
        )}

        {/* No data state */}
        {isReady && !hasData && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h2>
            <p className="text-gray-600">
              {currentParams.searchTerm || currentParams.status 
                ? 'Try adjusting your search or filters.' 
                : 'You have no orders yet.'}
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {hasData && (
          <div className="hidden sm:block">
            <OrdersTable 
              orders={currentOrders}
              isLoading={isFetching}
              onUpdateStatus={handleUpdateStatus}
              onCancelItem={handleCancelItem}
              onCancelOrder={handleBulkCancel}
              onUpdateOrderStatus={handleBulkUpdateStatus}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={orders.length}
              onPageChange={setCurrentPage}
              onViewDetails={handleViewDetails}
              onItemsPerPageChange={() => {}} // Page size is handled by filters
            />
            
            {/* Load More Button for Infinite Scroll */}
            {hasNextPage && (
              <div className="text-center mt-6">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  size="lg"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Orders'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Cards */}
        {hasData && (
          <div className="sm:hidden space-y-3">
            {currentOrders.map((order) => (
              <SellerOrderCard 
                key={order.Id}
                order={order}
                onUpdateOrderStatus={handleBulkUpdateStatus}
                onCancelOrder={handleBulkCancel}
              />
            ))}
            
            {/* Pagination for mobile */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-muted-foreground">
                  {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Load More Button for Mobile */}
            {hasNextPage && (
              <div className="text-center mt-4">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="w-full"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Orders'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading indicator for additional fetches */}
        {isFetching && hasData && (
          <div className="text-center py-4">
            <div className="inline-flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Updating orders...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}