import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { queryClient } from "@/components/providers/AuthProviders";
import { userAddressAtom } from "@/stores/address";
import { useAtomValue } from "jotai";
import { toast } from "@/lib/toast";
import { 
  createOrderFromCart,
  cancelOrder,
  updateOrderItemStatus, 
  cancelOrderItem,
  bulkUpdateOrderItemStatus,
  bulkCancelOrderItems,
  type UpdateOrderStatusRequest,
  type BulkUpdateOrderStatusRequest,
  type BulkCancelOrderItemsRequest,
  type OrderDto,
  type OrderItemDto,
  type OrderItemStatus,
  type PagedResultOrderDto
} from "@/lib/api/orders";
import store from "@/stores/store";
import { userBasicAtom } from "@/stores/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
 
export const useCreateOrder = () => {
    const userAddress = useAtomValue(userAddressAtom);
    const {userProfile} = useAuth()
    const router = useRouter();
    const addressParts = [
        userAddress?.data?.AddressLine1,
        userAddress?.data?.AddressLine2,
        userAddress?.data?.City,
        userAddress?.data?.State,
        userAddress?.data?.PostalCode,
        userAddress?.data?.Country,
        userProfile?.PhoneNumber
    ].filter(Boolean);
    const shippingAddress = addressParts.join(', ');
    return useMutation({
        mutationFn: () => {
            toast.loading("Placing your order...", { id: 'place-order' });
            return createOrderFromCart(shippingAddress);
        },
        onSuccess: (order) => {
            const userBasic = store.get(userBasicAtom);
            const queryKey = ['cart', userBasic?.id];
            queryClient.invalidateQueries({ queryKey });
            toast.success("Order placed successfully!", { id: 'place-order' });
            router.push(`/orders/${order.Id}`);
            return order;
        },
        onError: () => {
            toast.dismiss('place-order');
        }
    });
};

/**
 * Hook to cancel entire order (customer function)
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()
  const { userBasic } = useAuth()
  
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (cancelledOrder) => {
      // Invalidate customer orders list
      queryClient.invalidateQueries({ 
        queryKey: ['orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      // Invalidate specific order
      queryClient.invalidateQueries({ 
        queryKey: ['order', cancelledOrder.Id, userBasic?.id] 
      })
      toast.success('Order cancelled successfully')
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error)
      toast.error('Failed to cancel order')
    }
  })
}

/**
 * Hook to reorder items (placeholder - needs cart integration)
 */
export function useReorderItems() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Reorder functionality not implemented yet')
    },
    onSuccess: () => {
      toast.success('Items added to cart for reorder')
    },
    onError: (error) => {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to reorder items')
    }
  })
}

/**
 * Hook to update individual order item status
 */
export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient()
  const { userBasic } = useAuth()
  
  return useMutation({
    mutationFn: ({ orderItemId, request }: { 
      orderItemId: string; 
      request: UpdateOrderStatusRequest 
    }) => updateOrderItemStatus(orderItemId, request),
    
    onMutate: async ({ orderItemId, request }) => {
      // Only allow sellers to update order item status
      if (userBasic?.role !== "Seller") {
        throw new Error("Only sellers can update order item status")
      }

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Get all seller-orders cache entries for this user
      const sellerOrdersQueries = queryClient.getQueriesData({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Store previous data for rollback
      const previousDataEntries = sellerOrdersQueries
      
      // Optimistically update all seller orders cache entries
      sellerOrdersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (currentData: InfiniteData<PagedResultOrderDto>) => {
          if (!currentData) return currentData
          
          return {
            ...currentData,
            pages: currentData.pages.map(page => ({
              ...page,
              Items: page.Items?.map((order: OrderDto) => ({
                ...order,
                OrderItems: order.OrderItems?.map((item: OrderItemDto) =>
                  item.Id === orderItemId 
                    ? { ...item, Status: request.Status }
                    : item
                )
              }))
            }))
          }
        })
      })
      
      // Return context for rollback
      return { previousDataEntries }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error - restore all affected cache entries
      if (context?.previousDataEntries) {
        context.previousDataEntries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
      console.error('Failed to update order item status:', err)
      toast.error('Failed to update order item status')
    },
    
    onSuccess: (updatedItem) => {
      toast.success(`Order item status updated to ${updatedItem.Status}`)
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      // Also invalidate individual order queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ['order'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
    }
  })
}

/**
 * Hook to cancel individual order item
 */
export function useCancelOrderItem() {
  const queryClient = useQueryClient()
  const { userBasic } = useAuth()
  
  return useMutation({
    mutationFn: (orderItemId: string) => cancelOrderItem(orderItemId),
    
    onMutate: async (orderItemId) => {
      // Only allow sellers to cancel order items
      if (userBasic?.role !== "Seller") {
        throw new Error("Only sellers can cancel order items")
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Get all seller-orders cache entries for this user
      const sellerOrdersQueries = queryClient.getQueriesData({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Store previous data for rollback
      const previousDataEntries = sellerOrdersQueries
      
      // Optimistically update all seller orders cache entries
      sellerOrdersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (currentData: InfiniteData<PagedResultOrderDto>) => {
          if (!currentData) return currentData
          
          return {
            ...currentData,
            pages: currentData.pages.map(page => ({
              ...page,
              Items: page.Items?.map((order: OrderDto) => ({
                ...order,
                OrderItems: order.OrderItems?.map((item: OrderItemDto) =>
                  item.Id === orderItemId 
                    ? { ...item, Status: "Cancelled" as OrderItemStatus }
                    : item
                )
              }))
            }))
          }
        })
      })
      
      // Return context for rollback
      return { previousDataEntries }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error - restore all affected cache entries
      if (context?.previousDataEntries) {
        context.previousDataEntries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
      console.error('Failed to cancel order item:', err)
      toast.error('Failed to cancel order item')
    },
    
    onSuccess: () => {
      toast.success('Order item cancelled successfully')
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      // Also invalidate individual order queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ['order'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
    }
  })
}

/**
 * Hook for bulk status update of multiple order items
 */
export function useBulkUpdateOrderItemStatus() {
  const queryClient = useQueryClient()
  const { userBasic } = useAuth()
  
  return useMutation({
    mutationFn: (request: BulkUpdateOrderStatusRequest) => 
      bulkUpdateOrderItemStatus(request),
    
    onMutate: async (request) => {
      // Only allow sellers to bulk update order item status
      if (userBasic?.role !== "Seller") {
        throw new Error("Only sellers can bulk update order item status")
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Get all seller-orders cache entries for this user
      const sellerOrdersQueries = queryClient.getQueriesData({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Store previous data for rollback
      const previousDataEntries = sellerOrdersQueries
      
      // Optimistically update all seller orders cache entries
      const itemIds = new Set(request.OrderItemIds)
      
      sellerOrdersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (currentData: InfiniteData<PagedResultOrderDto>) => {
          if (!currentData) return currentData
          
          return {
            ...currentData,
            pages: currentData.pages.map(page => ({
              ...page,
              Items: page.Items?.map((order: OrderDto) => ({
                ...order,
                OrderItems: order.OrderItems?.map((item: OrderItemDto) => {
                  if (itemIds.has(item.Id || '')) {
                    return { ...item, Status: request.Status }
                  }
                  return item
                })
              }))
            }))
          }
        })
      })
      
      // Return context for rollback
      return { previousDataEntries }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error - restore all affected cache entries
      if (context?.previousDataEntries) {
        context.previousDataEntries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
      console.error('Failed to bulk update order item status:', err)
      toast.error('Failed to update order items')
    },
    
    onSuccess: (updatedItems, request) => {
      toast.success(`${updatedItems.length} order items updated to ${request.Status}`)
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      // Also invalidate individual order queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ['order'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
    }
  })
}

/**
 * Hook for bulk cancellation of multiple order items
 */
export function useBulkCancelOrderItems() {
  const queryClient = useQueryClient()
  const { userBasic } = useAuth()
  
  return useMutation({
    mutationFn: (request: BulkCancelOrderItemsRequest) => 
      bulkCancelOrderItems(request),
    
    onMutate: async (request) => {
      // Only allow sellers to bulk cancel order items
      if (userBasic?.role !== "Seller") {
        throw new Error("Only sellers can bulk cancel order items")
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Get all seller-orders cache entries for this user
      const sellerOrdersQueries = queryClient.getQueriesData({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      
      // Store previous data for rollback
      const previousDataEntries = sellerOrdersQueries
      
      // Optimistically update all seller orders cache entries
      const itemIds = new Set(request.OrderItemIds)
      
      sellerOrdersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (currentData: InfiniteData<PagedResultOrderDto>) => {
          if (!currentData) return currentData
          
          return {
            ...currentData,
            pages: currentData.pages.map(page => ({
              ...page,
              Items: page.Items?.map((order: OrderDto) => ({
                ...order,
                OrderItems: order.OrderItems?.map((item: OrderItemDto) =>
                  itemIds.has(item.Id || '') 
                    ? { ...item, Status: "Cancelled" as OrderItemStatus }
                    : item
                )
              }))
            }))
          }
        })
      })
      
      // Return context for rollback
      return { previousDataEntries }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error - restore all affected cache entries
      if (context?.previousDataEntries) {
        context.previousDataEntries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
      console.error('Failed to bulk cancel order items:', err)
      toast.error('Failed to cancel order items')
    },
    
    onSuccess: (_, request) => {
      toast.success(`${(request.OrderItemIds?.length ?? 0)} order items cancelled successfully`)
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['seller-orders'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
      // Also invalidate individual order queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ['order'], 
        predicate: (query) => query.queryKey[2] === userBasic?.id
      })
    }
  })
}

