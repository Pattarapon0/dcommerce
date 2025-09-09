import { useAtom, useAtomValue } from 'jotai'
import {
  cartQueryAtom,
  cartCheckoutQueryAtom,
  addToCartMutationAtom,
  updateCartMutationAtom,
  removeCartMutationAtom,
  clearCartMutationAtom,
  isProductInCart,
  getProductQuantityInCart,
  findCartItemByProductId
} from '@/stores/cart'
import type { AddToCartRequest } from '@/stores/cart'

/**
 * Main cart hook - provides cart data and actions
 * Simple wrapper around cart atoms with clean interface
 */
export const useCart = () => {
  // Query state
  const cartQuery = useAtomValue(cartQueryAtom)
  const checkoutQuery = useAtomValue(cartCheckoutQueryAtom)
  
  // Mutations
  const [addMutation] = useAtom(addToCartMutationAtom)
  const [updateMutation] = useAtom(updateCartMutationAtom)
  const [removeMutation] = useAtom(removeCartMutationAtom)
  const [clearMutation] = useAtom(clearCartMutationAtom)
  
  // Simple wrapper functions
  const addToCart = (data: AddToCartRequest) => addMutation.mutate(data)
  
  const updateQuantity = (cartItemId: string, quantity: number) => 
    updateMutation.mutate({ cartItemId, data: { Quantity: quantity } })
  
  const removeItem = (cartItemId: string) => removeMutation.mutate(cartItemId)
  
  const clearCart = () => clearMutation.mutate()
  
  const getCheckoutSummary = () => checkoutQuery.refetch()
  
  // Utility functions that work with current cart data
  const isProductInCartFn = (productId: string) => {
    if (!cartQuery.data) return false
    return isProductInCart(cartQuery.data, productId)
  }
  
  const getProductQuantity = (productId: string) => {
    if (!cartQuery.data) return 0
    return getProductQuantityInCart(cartQuery.data, productId)
  }
  
  const findCartItem = (productId: string) => {
    if (!cartQuery.data) return undefined
    return findCartItemByProductId(cartQuery.data, productId)
  }
  
  return {
    // Cart data - use directly from query
    cart: cartQuery.data,
    checkoutCart: checkoutQuery.data,
    
    // Loading states
    isLoading: cartQuery.isLoading,
    isLoadingCheckout: checkoutQuery.isLoading,
    error: cartQuery.error,
    checkoutError: checkoutQuery.error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCheckoutSummary,
    refetch: cartQuery.refetch,
    
    // Action states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,
    
    // Action errors
    addError: addMutation.error,
    updateError: updateMutation.error,
    removeError: removeMutation.error,
    clearError: clearMutation.error,
    
    // Utility functions
    isProductInCart: isProductInCartFn,
    getProductQuantity,
    findCartItem
  }
}

/**
 * Lightweight hook for components that only need cart status
 * No mutations, just read-only cart info
 */
export const useCartStatus = () => {
  const cartQuery = useAtomValue(cartQueryAtom)
  const cart = cartQuery.data
  
  const isProductInCartFn = (productId: string) => {
    if (!cart) return false
    return isProductInCart(cart, productId)
  }
  
  const getProductQuantity = (productId: string) => {
    if (!cart) return 0
    return getProductQuantityInCart(cart, productId)
  }
  
  return {
    // Simple cart status
    itemCount: cart?.TotalItems || 0,
    total: cart?.TotalAmount || 0,
    hasItems: (cart?.Items?.length || 0) > 0,
    currency: cart?.Currency || 'THB',
    
    // Loading state
    isLoading: cartQuery.isLoading,
    
    // Utility functions
    isProductInCart: isProductInCartFn,
    getProductQuantity
  }
}