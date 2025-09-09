import { useState, useEffect } from 'react'
import { type OrderDto } from '@/lib/api/orders'

// ================== TYPES ==================

export interface ServerSideOrderParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  ascending?: boolean;
  searchTerm?: string;
  status?: string;
  minDate?: string;
  maxDate?: string;
}

// ================== UTILITY HOOKS ==================

/**
 * Custom debounce hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ================== UTILITY FUNCTIONS ==================

/**
 * Checks if an order has items that can be reordered
 */
export function hasReorderableItems(order: OrderDto): boolean {
  return order.OrderItems?.some(item => 
    item.Status === "Delivered" || item.Status === "Cancelled"
  ) || false
}

/**
 * Gets count of reorderable items in an order
 */
export function getReorderableItemsCount(order: OrderDto): number {
  return order.OrderItems?.filter(item => 
    item.Status === "Delivered" || item.Status === "Cancelled"
  ).length || 0
}