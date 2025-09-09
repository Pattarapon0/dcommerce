import apiClient from "./client";
import type { components,paths} from "../types/api";

// ================== TYPE DEFINITIONS ==================

export type OrderDto = components["schemas"]["OrderDto"];
export type CreateOrderRequest = components["schemas"]["CreateOrderRequest"];
export type OrderItemDto = components["schemas"]["OrderItemDto"];
export type OrderFilterRequest = paths["/api/v1/orders"]["get"]["parameters"]["query"];
export type UpdateOrderStatusRequest = components["schemas"]["UpdateOrderStatusRequest"];
export type OrderItemStatus = components["schemas"]["OrderItemStatus"];
export type BulkUpdateOrderStatusRequest = components["schemas"]["BulkUpdateOrderItemStatusRequest"];
export type BulkCancelOrderItemsRequest = components["schemas"]["BulkCancelOrderItemsRequest"];


type OrderDtoServiceSuccess = components["schemas"]["OrderDtoServiceSuccess"];
type OrderItemDtoServiceSuccess = components["schemas"]["OrderItemDtoServiceSuccess"];
type OrderItemDtoListServiceSuccess = components["schemas"]["OrderItemDtoListServiceSuccess"];
type PagedResultOrderDtoServiceSuccess = components["schemas"]["OrderDtoPagedResultServiceSuccess"];
export type PagedResultOrderDto = components["schemas"]["OrderDtoPagedResult"];

// ================== API FUNCTIONS ==================

/**
 * Create order from cart items
 * This is the main function used in checkout
 */
export async function createOrderFromCart(shippingAddress: string): Promise<OrderDto> {
  const response = await apiClient.post<OrderDtoServiceSuccess>("/orders/from-cart", {
    shippingAddress
  });
  return response.data.Data as OrderDto;
}

/**
 * Create order with specific items
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderDto> {
  const response = await apiClient.post<OrderDtoServiceSuccess>("/orders", data);
  return response.data.Data as OrderDto;
}

/**
 * Get single order by ID
 */
export async function getOrder(orderId: string): Promise<OrderDto> {
  const response = await apiClient.get<OrderDtoServiceSuccess>(`/orders/${orderId}`);
  return response.data.Data as OrderDto;
}

/**
 * Get paginated orders
 */
export async function getOrders(filters?: OrderFilterRequest): Promise<PagedResultOrderDto> {
  const params = filters  ? new URLSearchParams(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined) // drop undefined
          .map(([k, v]) => [k, String(v)])   // stringify numbers & unions
      ).toString()
    : "";
  const url = params ? `/orders?${params}` : '/orders';
  const response = await apiClient.get<PagedResultOrderDtoServiceSuccess>(url);
  console.log(response.data.Data);
  return response.data.Data as PagedResultOrderDto;
}

/**
 * Get order items for a specific order (seller view)
 */
export async function getOrderItems(orderId: string): Promise<OrderItemDto[]> {
  const response = await apiClient.get<OrderItemDtoListServiceSuccess>(`/orders/${orderId}/items`);
  return response.data.Data as OrderItemDto[];
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<OrderDto> {
  const response = await apiClient.post<OrderDtoServiceSuccess>(`/orders/${orderId}/cancel`);
  return response.data.Data as OrderDto;
}

/**
 * Get seller's orders (seller view)
 */
export async function getMyOrders(filters?: OrderFilterRequest): Promise<PagedResultOrderDto> {
  const params = filters  ? new URLSearchParams(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined) // drop undefined
          .map(([k, v]) => [k, String(v)])   // stringify numbers & unions
      ).toString()
    : "";
  const url = params ? `/orders/my-orders?${params}` : '/orders/my-orders';
  const response = await apiClient.get<PagedResultOrderDtoServiceSuccess>(url);
  console.log(response.data.Data);
  return response.data.Data as PagedResultOrderDto;
}

/**
 * Get order statistics for the current user
 */
export async function getOrderStats(): Promise<Record<string, string>> {
  const response = await apiClient.get(`/orders/stats`);
  return response.data.Data as Record<string, string>;
}

/**
 * Get single order item by ID (seller only)
 */
export async function getOrderItem(orderItemId: string): Promise<OrderItemDto> {
  const response = await apiClient.get<OrderItemDtoServiceSuccess>(`/orders/items/${orderItemId}`);
  return response.data.Data as OrderItemDto;
}

/**
 * Cancel a single order item (seller only)
 */
export async function cancelOrderItem(orderItemId: string): Promise<void> {
  await apiClient.post(`/orders/items/${orderItemId}/cancel`);
}

/**
 * Update status of a single order item (seller only)
 */
export async function updateOrderItemStatus(
  orderItemId: string, 
  request: UpdateOrderStatusRequest
): Promise<OrderItemDto> {
  const response = await apiClient.put<OrderItemDtoServiceSuccess>(`/orders/items/${orderItemId}/status`, request);
  return response.data.Data as OrderItemDto;
}

/**
 * Bulk update status of multiple order items (seller only)
 */
export async function bulkUpdateOrderItemStatus(
  BulkUpdateOrderStatusRequest: BulkUpdateOrderStatusRequest
): Promise<OrderItemDto[]> {
  const response = await apiClient.put<OrderItemDtoListServiceSuccess>('/orders/items/bulk-status', BulkUpdateOrderStatusRequest);
  return response.data.Data as OrderItemDto[];
}

/**
 * Bulk cancel multiple order items (seller only)
 */
export async function bulkCancelOrderItems(request: BulkCancelOrderItemsRequest): Promise<void> {
  await apiClient.post('/orders/items/bulk-cancel', request);
}

