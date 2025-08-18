'use client'

import { Provider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClientAtom } from 'jotai-tanstack-query'
import store from '@/stores/store' // Import explicit store

// ✅ Export the queryClient so atoms can use it
export const queryClient = new QueryClient()

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

interface AuthProvidersProps {
  children: ReactNode
}

/**
 * Providers setup using explicit Jotai store:
 * - Jotai Provider with explicit store for consistent state management
 * - atomWithQuery/atomWithMutation handle their own QueryClient internally
 * - Both global store and useAtom hooks use the same store instance
 */
export function AuthProviders({ children }: AuthProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}