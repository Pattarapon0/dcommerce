'use client'

import { Provider } from 'jotai'
import { ReactNode } from 'react'

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
    <Provider>
      {children}
    </Provider>
  )
}