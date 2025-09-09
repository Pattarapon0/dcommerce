import { useMemo } from 'react'
import { 
  useInfiniteQuery, 
  useQuery,
  useQueryClient,
  keepPreviousData,
  InfiniteData
} from '@tanstack/react-query'
import { 
  getMyOrders, 
  getOrders,
  getOrder,
  getOrderStats,
  type OrderFilterRequest,
  PagedResultOrderDto
} from '@/lib/api/orders'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useOrderUtils'
import { type ServerSideOrderParams } from '@/hooks/useOrderUtils'

/**
 * Hook to fetch a single order by ID
 * Optimized to use cached data from useGetOrders or useSellerOrders if available
 */
export function useGetOrder(orderId: string) {
  const { isAuthenticated, userBasic } = useAuth()
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['order', orderId, userBasic?.id],
    queryFn: () => getOrder(orderId),
    initialData: () => {
      const ordersData: [readonly unknown[], PagedResultOrderDto | undefined][] = 
        queryClient.getQueriesData({ queryKey: ['orders'] })
      const sellerOrdersData: [readonly unknown[], InfiniteData<PagedResultOrderDto> | undefined][] = 
        queryClient.getQueriesData({ queryKey: ['seller-orders'] })
      
      return [...ordersData, ...sellerOrdersData]
        .flatMap(([, data]) => {
          // Handle regular query data (PagedResultOrderDto)
          if (data && 'Items' in data && !('pages' in data)) {
            return (data as PagedResultOrderDto).Items || []
          }
          // Handle infinite query data (InfiniteData<PagedResultOrderDto>)
          if (data && 'pages' in data) {
            return (data as InfiniteData<PagedResultOrderDto>).pages
              .flatMap(page => page.Items || [])
          }
          return []
        })
        .find(order => order?.Id === orderId)
    },
    enabled: isAuthenticated && !!orderId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000
  })
}

/**
 * Hook to fetch customer orders (not seller orders)
 */
export function useGetOrders(params: ServerSideOrderParams = {}) {
  const { isAuthenticated, userBasic } = useAuth()
  
  const queryParams: OrderFilterRequest = useMemo(() => ({
    Page: params.page || 1,
    PageSize: params.pageSize || 20,
    SortBy: params.sortBy || "CreatedAt",
    Ascending: params.ascending || false,
    ...(params.searchTerm && { SearchTerm: params.searchTerm }),
    ...(params.status && params.status !== "all" && { Status: params.status as "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | undefined }),
    ...(params.minDate && { MinDate: params.minDate }),
    ...(params.maxDate && { MaxDate: params.maxDate })
  }), [params])

  return useQuery({
    queryKey: ['orders', queryParams, userBasic?.id],
    queryFn: () => getOrders(queryParams),
    enabled: isAuthenticated && !!userBasic?.id,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData
  })
}

/**
 * Hook to fetch order statistics
 */
export function useGetOrderStats() {
  const { isAuthenticated,userBasic } = useAuth()
  
  return useQuery({
    queryKey: ['order-stats', userBasic?.id],
    queryFn: () => getOrderStats(),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000
  })
}

/**
 * Hook to fetch seller's orders with infinite loading and server-side support
 * Similar to useSellerProducts but for orders with infinite scroll
 */
export function useSellerOrders(params: ServerSideOrderParams = {}) {
  const { isAuthenticated, userBasic } = useAuth()
  
  const {
    pageSize = 20,
    sortBy = "CreatedAt",
    ascending = false,
    searchTerm,
    status,
    minDate,
    maxDate
  } = params

  const debouncedSearchTerm = useDebounce(searchTerm || '', 500)

  const queryParams: OrderFilterRequest = useMemo(() => ({
    PageSize: pageSize,
    SortBy: sortBy,
    Ascending: ascending,
    ...(debouncedSearchTerm && { SearchTerm: debouncedSearchTerm }),
    ...(status && status !== "all" && { Status: status as "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | undefined }),
    ...(minDate && { MinDate: minDate }),
    ...(maxDate && { MaxDate: maxDate })
  }), [pageSize, sortBy, ascending, debouncedSearchTerm, status, minDate, maxDate])

  const query = useInfiniteQuery({
    queryKey: ['seller-orders', queryParams, userBasic?.id],
    queryFn: ({ pageParam = 1 }) => {
      const finalParams = { ...queryParams, Page: pageParam }
      return getMyOrders(finalParams)
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil((lastPage.TotalCount || 0) / pageSize)
      const nextPage = allPages.length + 1
      return nextPage <= totalPages ? nextPage : undefined
    },
    initialPageParam: 1,
    enabled: isAuthenticated && !!userBasic?.id && userBasic?.role === "Seller",
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData
  })

  // Flatten all pages into a single array
  const orders = useMemo(() => {
    return query.data?.pages.flatMap(page => page.Items || []) || []
  }, [query.data])

  const totalCount = query.data?.pages[0]?.TotalCount || 0

  return {
    // Data
    orders,
    totalCount,
    
    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    
    // Actions
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    
    // Helper flags
    isReady: !query.isLoading && !query.isError,
    hasData: orders.length > 0,
    isSearching: (searchTerm || '') !== debouncedSearchTerm
  }
}