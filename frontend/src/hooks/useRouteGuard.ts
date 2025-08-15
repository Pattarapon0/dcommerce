'use client'

import { useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAuthenticatedAtom, userBasicAtom } from '@/lib/stores/auth'

export interface RouteConfig {
  allowedRoles: string[]
  unauthorizedRedirect: string
  customRedirects?: Record<string, string>
}

export const useRouteGuard = (config: RouteConfig) => {
  const router = useRouter()
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const user = useAtomValue(userBasicAtom)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for auth state to be determined
    if (isAuthenticated === null || (isAuthenticated && !user)) {
      return // Still loading auth state
    }

    const userRole = isAuthenticated ? user?.role : 'GUEST'
    
    // Check if current role is allowed
    if (config.allowedRoles.includes(userRole)) {
      setIsChecking(false)
      return // Access granted
    }

    // Determine redirect URL
    const redirectUrl = config.customRedirects?.[userRole] || config.unauthorizedRedirect
    
    // Prevent infinite redirects by checking current path
    if (typeof window !== 'undefined' && window.location.pathname !== redirectUrl) {
      router.replace(redirectUrl)
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, user, config, router])

  return { isChecking }
}