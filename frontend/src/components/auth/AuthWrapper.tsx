'use client'

import { useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { isAuthenticatedAtom, userBasicAtom } from '@/lib/stores/auth'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'Buyer' | 'Seller'
  fallback?: React.ReactNode
}

/**
 * AuthWrapper component for protecting routes and components
 * 
 * Features:
 * - Automatic redirect to login for unauthenticated users
 * - Role-based access control
 * - Pure reactive rendering with Jotai atoms
 * - Custom fallback components
 * - No useEffect needed - atoms are reactive by default
 */
export const AuthWrapper = ({ 
  children, 
  requireAuth = true,
  requireRole,
  fallback
}: AuthWrapperProps) => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const userBasic = useAtomValue(userBasicAtom)
  const router = useRouter()

  // Handle unauthenticated users - immediate redirect
  if (requireAuth && !isAuthenticated) {
    router.push('/login')
    return fallback || null
  }

  // Handle role-based access control
  if (requireRole && userBasic?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requireRole} | Your role: {userBasic?.role || 'None'}
          </p>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthWrapperProps, 'children'>
) => {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthWrapper {...options}>
        <Component {...props} />
      </AuthWrapper>
    )
  }
}

/**
 * Hook for conditional rendering based on auth state
 */
export const useAuthGuard = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const userBasic = useAtomValue(userBasicAtom)

  return {
    isAuthenticated,
    isLoading: false, // No loading needed - atoms are immediately available
    isBuyer: userBasic?.role === 'Buyer',
    isSeller: userBasic?.role === 'Seller',
    canAccess: (role?: 'Buyer' | 'Seller') => {
      if (!isAuthenticated) return false
      if (!role) return true
      return userBasic?.role === role
    }
  }
}