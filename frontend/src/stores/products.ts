import { atomWithQuery } from 'jotai-tanstack-query'
import { getMyProducts } from '@/lib/api/products'
import { hasValidTokenAtom, userBasicAtom } from './auth'

// ================== QUERY ATOMS ==================

export const myProductsAtom = atomWithQuery((get) => ({
  queryKey: ['myProducts', get(userBasicAtom)?.id],
  queryFn: () => getMyProducts(),
  enabled: get(hasValidTokenAtom),
  staleTime: 2 * 60 * 1000, // 2 minutes
}))