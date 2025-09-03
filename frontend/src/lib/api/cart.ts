import apiClient from "./client";
import type { components } from "../types/api";

// ================== TYPE DEFINITIONS ==================

type CartSummaryDto = components["schemas"]["CartSummaryDto"];
type CartItemDto = components["schemas"]["CartItemDto"];
type AddToCartRequest = components["schemas"]["AddToCartRequest"];
type UpdateCartItemRequest = components["schemas"]["UpdateCartItemRequest"];

type CartSummaryDtoServiceSuccess = components["schemas"]["CartSummaryDtoServiceSuccess"];
type CartItemDtoServiceSuccess = components["schemas"]["CartItemDtoServiceSuccess"];

// ================== API FUNCTIONS ==================

export async function getCart(): Promise<CartSummaryDto> {
  const response = await apiClient.get<CartSummaryDtoServiceSuccess>("/cart");
  return response.data.Data as CartSummaryDto;
}

export async function getCartCheckoutSummary(): Promise<CartSummaryDto> {
  const response = await apiClient.get<CartSummaryDtoServiceSuccess>("/cart/checkout-summary");
  return response.data.Data as CartSummaryDto;
}

export async function addToCart(data: AddToCartRequest): Promise<CartItemDto> {
  const response = await apiClient.post<CartItemDtoServiceSuccess>("/cart/items", data);
  return response.data.Data as CartItemDto;
}

export async function updateCartItem(cartItemId: string, data: UpdateCartItemRequest): Promise<CartItemDto> {
  const response = await apiClient.put<CartItemDtoServiceSuccess>(`/cart/items/${cartItemId}`, data);
  return response.data.Data as CartItemDto;
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  await apiClient.delete(`/cart/items/${cartItemId}`);
}

export async function clearCart(): Promise<void> {
  await apiClient.delete("/cart");
}

// Export types for use in components
export type { 
  CartSummaryDto, 
  CartItemDto, 
  AddToCartRequest, 
  UpdateCartItemRequest 
};