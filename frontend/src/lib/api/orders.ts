import apiClient from "./client";
import type { components,paths} from "../types/api";

// ================== TYPE DEFINITIONS ==================

export type OrderDto = components["schemas"]["OrderDto"];
export type CreateOrderRequest = components["schemas"]["CreateOrderRequest"];
export type OrderItemDto = components["schemas"]["OrderItemDto"];
export type OrderFilterRequest = paths["/api/v1/orders"]["get"]["parameters"]["query"];


type OrderDtoServiceSuccess = components["schemas"]["OrderDtoServiceSuccess"];
type OrderItemDtoListServiceSuccess = components["schemas"]["OrderItemDtoListServiceSuccess"];
type PagedResultOrderDtoServiceSuccess = components["schemas"]["OrderDtoPagedResultServiceSuccess"];
type PagedResultOrderDto = components["schemas"]["OrderDtoPagedResult"];

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
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
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
export async function cancelOrder(orderId: string, reason: string): Promise<OrderDto> {
  const response = await apiClient.post<OrderDtoServiceSuccess>(`/orders/${orderId}/cancel`, { reason });
  return response.data.Data as OrderDto;
}

/**
 * Get seller's orders (seller view)
 */
export async function getMyOrders(filters?: OrderFilterRequest): Promise<PagedResultOrderDto> {
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
  const url = params ? `/orders/my-orders?${params}` : '/orders/my-orders';
  const response = await apiClient.get<PagedResultOrderDtoServiceSuccess>(url);

  return response.data.Data as PagedResultOrderDto;
}

/**
 * Get order statistics for the current user
 */
export async function getOrderStats(): Promise<Record<string, any>> {
  const response = await apiClient.get(`/orders/stats`);
  return response.data.Data as Record<string, any>;
}

// Export types for use in components
export type { 
  OrderDto, 
  CreateOrderRequest, 
  OrderItemDto,
  OrderFilterRequest,
  PagedResultOrderDto
};