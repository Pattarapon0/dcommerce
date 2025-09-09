import { useState, useCallback } from 'react'
import { useSellerOrders } from '@/hooks/useOrder'
import { 
  useUpdateOrderItemStatus,
  useCancelOrderItem,
  useBulkUpdateOrderItemStatus,
  useBulkCancelOrderItems
} from '@/hooks/useOrderMutations'
import { type ServerSideOrderParams } from '@/hooks/useOrderUtils'
import { 
  type UpdateOrderStatusRequest,
  type BulkUpdateOrderStatusRequest,
  type BulkCancelOrderItemsRequest,
  type OrderItemStatus
} from '@/lib/api/orders'

/**
 * Main hook that combines infinite query with mutations for the orders page
 * Similar to useProductsTable but for orders with infinite loading
 */
export function useOrdersTable(initialParams: ServerSideOrderParams = {}) {
  const [params, setParams] = useState<ServerSideOrderParams>(initialParams)
  
  // Queries
  const ordersQuery = useSellerOrders(params)
  
  // Mutations
  const updateStatusMutation = useUpdateOrderItemStatus()
  const cancelItemMutation = useCancelOrderItem()
  const bulkUpdateStatusMutation = useBulkUpdateOrderItemStatus()
  const bulkCancelMutation = useBulkCancelOrderItems()
  
  // Update parameters
  const updateParams = useCallback((newParams: Partial<ServerSideOrderParams>) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }, [])
  
  // Individual item actions
  const handleUpdateStatus = useCallback((
    orderItemId: string, 
    status: string, 
  ) => {
    const request: UpdateOrderStatusRequest = {
      Status: status as OrderItemStatus
    }
    updateStatusMutation.mutate({ orderItemId, request })
  }, [updateStatusMutation])
  
  const handleCancelItem = useCallback((orderItemId: string) => {
    cancelItemMutation.mutate(orderItemId)
  }, [cancelItemMutation])
  
  // Batch actions
  const handleBulkUpdateStatus = useCallback((
    orderItemIds: string[], 
    status: OrderItemStatus
  ) => {
    const request: BulkUpdateOrderStatusRequest = {
      OrderItemIds: orderItemIds,
      Status: status
    }
    bulkUpdateStatusMutation.mutate(request)
  }, [bulkUpdateStatusMutation])
  
  const handleBulkCancel = useCallback((orderItemIds: string[]) => {
    const request: BulkCancelOrderItemsRequest = {
      OrderItemIds: orderItemIds
    }
    bulkCancelMutation.mutate(request)
  }, [bulkCancelMutation])
  
  // Loading state (any mutation or query loading)
  const isLoading = ordersQuery.isLoading || 
    updateStatusMutation.isPending || 
    cancelItemMutation.isPending ||
    bulkUpdateStatusMutation.isPending ||
    bulkCancelMutation.isPending
  
  return {
    // Data
    orders: ordersQuery.orders,
    totalCount: ordersQuery.totalCount,
    
    // Query state
    isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    isFetching: ordersQuery.isFetching,
    isFetchingNextPage: ordersQuery.isFetchingNextPage,
    hasNextPage: ordersQuery.hasNextPage,
    isSearching: ordersQuery.isSearching,
    
    // Actions
    fetchNextPage: ordersQuery.fetchNextPage,
    refetch: ordersQuery.refetch,
    updateParams,
    
    // Item actions
    handleUpdateStatus,
    handleCancelItem,
    handleBulkUpdateStatus,
    handleBulkCancel,
    
    // Helper flags
    isReady: ordersQuery.isReady,
    hasData: ordersQuery.hasData,
    
    // Current parameters
    currentParams: params
  }
}