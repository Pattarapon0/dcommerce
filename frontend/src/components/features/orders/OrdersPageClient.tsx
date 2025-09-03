"use client";

import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Search, Filter, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import OrderCard from './OrderCard';
import OrdersSidebar from './OrdersSidebar';
import { useGetOrders, useGetOrderStats } from '@/hooks/useOrders';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFormatUserPrice } from '@/hooks/useUserCurrency';
import { useDebounce } from '@/hooks/useDebounce';

export default function OrdersPageClient() {
  // Route guard - redirect if not authenticated
  useRouteGuard({
    allowedRoles: ['Buyer', 'Seller'],
    unauthorizedRedirect: '/login'
  });

  const formatPrice = useFormatUserPrice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build filters for API including search term
  const filters = useMemo(() => {
    const apiFilters: Record<string, any> = {};
    
    // Add status filter if not 'all'
    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter;
    }
    
    // Add search term if provided (use debounced value)
    if (debouncedSearchQuery.trim()) {
      apiFilters.searchTerm = debouncedSearchQuery.trim();
    }
    
    // Add date range filter
    if (dateFilter !== 'all') {
      const now = new Date();
      switch (dateFilter) {
        case 'last30':
          apiFilters.fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'last6months':
          apiFilters.fromDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'lastyear':
          apiFilters.fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }
    
    return apiFilters;
  }, [statusFilter, dateFilter, debouncedSearchQuery]);

  // React Query hooks
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useGetOrders(filters);
  
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useGetOrderStats();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Show loading indicator when search is debouncing
  const isSearching = searchQuery !== debouncedSearchQuery;

  // Use backend-filtered orders directly
  const filteredOrders = ordersData?.Items || [];

  const handleOrderCancel = (orderId: string) => {
    // Mock cancel function - in real app would call API
    console.log('Cancelling order:', orderId);
    // You would implement the actual cancel logic here
  };

  const handleReorder = (orderId: string) => {
    // Mock reorder function - in real app would add items to cart
    console.log('Reordering order:', orderId);
    // You would implement the actual reorder logic here
  };

  return (
    <PageLayout className="bg-gray-50/50 pb-8 pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Mobile: Search bar full width */}
          <div className="block sm:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* Mobile: Filters button that opens modal/sheet */}
          <div className="block sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex gap-4 items-center">
            {/* Search Input - Takes remaining space */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 animate-spin text-gray-400" />
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List - Main Content */}
          <div className="lg:col-span-2">
            {/* Mobile Stats Bar - Show stats horizontally on mobile */}
            <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              {statsLoading ? (
                <div className="grid grid-cols-3 gap-4 text-center animate-pulse">
                  <div>
                    <div className="h-8 bg-gray-200 rounded mb-1 mx-auto w-16"></div>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded mb-1 mx-auto w-20"></div>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded mb-1 mx-auto w-12"></div>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
              ) : statsError ? (
                <div className="text-center text-red-600 py-4">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Failed to load stats</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsData?.totalOrders || 0}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(statsData?.totalSpent || 0)}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsData?.activeOrders || 0}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
              )}
            </div>
            {ordersLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border p-6">
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
            ) : ordersError ? (
              // Error state
              <div className="bg-white rounded-xl border p-12 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Failed to load orders
                </h3>
                <p className="text-gray-600 mb-6">
                  There was an error loading your orders. Please try again.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              // Empty state
              <div className="bg-white rounded-xl border p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'No orders found' 
                    : 'No orders yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'When you place your first order, it will appear here.'
                  }
                </p>
                {(!searchQuery && statusFilter === 'all' && dateFilter === 'all') && (
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Start Shopping
                  </button>
                )}
                {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              // Orders list
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.Id}
                    order={order}
                    onCancel={handleOrderCancel}
                    onReorder={handleReorder}
                  />
                ))}
                
                {/* Pagination would go here in real implementation */}
                {filteredOrders.length > 0 && (
                  <div className="flex justify-center pt-6">
                    <div className="text-sm text-gray-600">
                      Showing {filteredOrders.length} {ordersData?.TotalCount ? `of ${ordersData.TotalCount}` : ''} orders
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            {statsLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : statsError ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">Failed to load stats</p>
              </div>
            ) : (
              <OrdersSidebar 
                stats={{
                  totalOrders: statsData?.totalOrders || 0,
                  totalSpent: statsData?.totalSpent || 0,
                  activeOrders: statsData?.activeOrders || 0
                }}
                onQuickAction={(action) => {
                  switch (action) {
                    case 'search':
                      // Focus search input
                      (document.querySelector('input[placeholder="Search orders..."]') as HTMLInputElement | null)?.focus();
                      break;
                    case 'recent':
                      setDateFilter('last30');
                      break;
                    case 'support':
                      // Open support - would be external link in real app
                      window.open('mailto:support@example.com', '_blank');
                      break;
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}