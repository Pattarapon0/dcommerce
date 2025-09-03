import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import { userBasicAtom, hasValidTokenAtom } from './auth'
import { queryClient } from '@/components/providers/AuthProviders'
import { successToasts, toast } from '@/lib/toast'
import store from './store'
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  getCartCheckoutSummary 
} from '@/lib/api/cart'
import type { components } from '@/lib/types/api';

// ================== TYPE DEFINITIONS ==================

export type CartSummaryDto = components["schemas"]["CartSummaryDto"];
export type CartItemDto = components["schemas"]["CartItemDto"];
export type SellerCartGroupDto = components["schemas"]["SellerCartGroupDto"];
export type AddToCartRequest = components["schemas"]["AddToCartRequest"];
export type UpdateCartItemRequest = components["schemas"]["UpdateCartItemRequest"];

// ================== CART ATOMS ==================

/**
 * Main cart query atom - fetches and caches user's cart data
 */
export const cartQueryAtom = atomWithQuery((get) => ({
  queryKey: ['cart', get(userBasicAtom)?.id],
  queryFn: () => getCart(),
  enabled: !!get(hasValidTokenAtom),
  staleTime: 5 * 60 * 1000,        // 5min cache
  refetchOnWindowFocus: true,       // Sync on tab focus
  refetchOnReconnect: true          // Sync on network return
}))

/**
 * Cart checkout query atom - validates cart for checkout
 */
export const cartCheckoutQueryAtom = atomWithQuery((get) => ({
  queryKey: ['cart-checkout', get(userBasicAtom)?.id],
  queryFn: () => getCartCheckoutSummary(),
  enabled: false, // Only fetch when explicitly called
  staleTime: 1 * 60 * 1000         // 1min cache for checkout
}))

/**
 * Add to cart mutation atom
 */
export const addToCartMutationAtom = atomWithMutation(() => ({
  mutationFn: (data: AddToCartRequest) => {
    toast.loading("Adding to cart...", { id: 'add-to-cart' })
    return addToCart(data)
  },
  onSuccess: (cartItem) => {
    successToasts.addedToCart(cartItem.ProductName ?? "Unknown Product")
    toast.dismiss('add-to-cart')
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    queryClient.invalidateQueries({ queryKey })
  },
  onError: () => {
    toast.dismiss('add-to-cart')
  }
}))

/**
 * Update cart item mutation atom
 */
export const updateCartMutationAtom = atomWithMutation(() => ({
  mutationFn: ({ cartItemId, data }: { cartItemId: string, data: UpdateCartItemRequest }) => 
    updateCartItem(cartItemId, data),
  onMutate: async ({ cartItemId, data }) => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    
    await queryClient.cancelQueries({ queryKey })
    
    const previousCart = queryClient.getQueryData(queryKey)
    
    queryClient.setQueryData(queryKey, (old: CartSummaryDto) => {
      if (!old?.Items) return old
      
      const oldItem = old.Items.find(item => item.Id === cartItemId)
      if (!oldItem) return old
      
      const quantityDiff = (data.Quantity ?? 0) - (oldItem?.Quantity || 0)
      
      return {
        ...old,
        Items: old.Items.map(item => 
          item.Id === cartItemId 
            ? { ...item, Quantity: data.Quantity, TotalPrice: (item.ProductPrice || 0) * (data.Quantity ?? 0) }
            : item
        ),
        TotalItems: (old.TotalItems || 0) + quantityDiff,
        TotalAmount: (old.TotalAmount || 0) + (quantityDiff * (oldItem?.ProductPrice || 0))
      }
    })
    
    return { previousCart }
  },
  onSuccess: () => {
    successToasts.custom("Cart updated!")
  },
  onError: (err, variables, context) => {
    if (context?.previousCart) {
      const userBasic = store.get(userBasicAtom);
      const queryKey = ['cart', userBasic?.id];
      queryClient.setQueryData(queryKey, context.previousCart)
    }
  },
  onSettled: () => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    queryClient.invalidateQueries({ queryKey })
  }
}))

/**
 * Remove cart item mutation atom
 */
export const removeCartMutationAtom = atomWithMutation(() => ({
  mutationFn: (cartItemId: string) => removeCartItem(cartItemId),
  onMutate: async (cartItemId) => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    
    await queryClient.cancelQueries({ queryKey })
    
    const previousCart = queryClient.getQueryData(queryKey)
    const cart = queryClient.getQueryData(queryKey) as CartSummaryDto
    const removedItem = cart?.Items?.find(item => item.Id === cartItemId)
    
    queryClient.setQueryData(queryKey, (old: CartSummaryDto) => {
      if (!old?.Items) return old
      
      const removedItem = old.Items.find(item => item.Id === cartItemId)
      
      return {
        ...old,
        Items: old.Items.filter(item => item.Id !== cartItemId),
        TotalItems: (old.TotalItems || 0) - (removedItem?.Quantity || 0),
        TotalAmount: (old.TotalAmount || 0) - (removedItem?.TotalPrice || 0)
      }
    })
    
    return { previousCart, removedItem }
  },
  onSuccess: (data, cartItemId, context) => {
    successToasts.removedFromCart(context?.removedItem?.ProductName ?? "")
  },
  onError: (err, cartItemId, context) => {
    if (context?.previousCart) {
      const userBasic = store.get(userBasicAtom);
      const queryKey = ['cart', userBasic?.id];
      queryClient.setQueryData(queryKey, context.previousCart)
    }
  },
  onSettled: () => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    queryClient.invalidateQueries({ queryKey })
  }
}))

/**
 * Clear entire cart mutation atom
 */
export const clearCartMutationAtom = atomWithMutation(() => ({
  mutationFn: () => {
    toast.loading("Clearing cart...", { id: 'clear-cart' })
    return clearCart()
  },
  onMutate: async () => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    
    await queryClient.cancelQueries({ queryKey })
    
    const previousCart = queryClient.getQueryData(queryKey)
    
    queryClient.setQueryData(queryKey, (old: CartSummaryDto) => {
      if (!old) return old
      
      return {
        ...old,
        Items: [],
        TotalItems: 0,
        TotalAmount: 0
      }
    })
    
    return { previousCart }
  },
  onSuccess: () => {
    successToasts.cartCleared()
    toast.dismiss('clear-cart')
  },
  onError: (err, variables, context) => {
    toast.dismiss('clear-cart')
    if (context?.previousCart) {
      const userBasic = store.get(userBasicAtom);
      const queryKey = ['cart', userBasic?.id];
      queryClient.setQueryData(queryKey, context.previousCart)
    }
  },
  onSettled: () => {
    const userBasic = store.get(userBasicAtom);
    const queryKey = ['cart', userBasic?.id];
    queryClient.invalidateQueries({ queryKey })
  }
}))

// ================== UTILITY FUNCTIONS ==================

/**
 * Find cart item by product ID
 */
export function findCartItemByProductId(cart: CartSummaryDto, productId: string): CartItemDto | undefined {
  return cart.Items?.find(item => item.ProductId === productId);
}

/**
 * Check if a product is in cart
 */
export function isProductInCart(cart: CartSummaryDto, productId: string): boolean {
  return !!findCartItemByProductId(cart, productId);
}

/**
 * Get quantity of a specific product in cart
 */
export function getProductQuantityInCart(cart: CartSummaryDto, productId: string): number {
  const item = findCartItemByProductId(cart, productId);
  return item?.Quantity || 0;
}

