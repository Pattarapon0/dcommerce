'use client'

import { Provider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClientAtom } from 'jotai-tanstack-query'

const queryClient = new QueryClient()

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

interface AuthProvidersProps {
  children: ReactNode
}

/**
 * Simplified providers setup using only Jotai:
 * - Jotai Provider for global state management
 * - atomWithQuery/atomWithMutation handle their own QueryClient internally
 * - No React Query Provider needed since we're using pure Jotai approach
 */
export function AuthProviders({ children }: AuthProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}