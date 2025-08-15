import { useAtomValue, useAtom } from 'jotai'
import { 
  isAuthenticatedAtom, 
  userBasicAtom, 
  userProfileAtom,
  loginMutationAtom,
  logoutAtom,
  isSellerAtom,
  isBuyerAtom,
  isTokenExpiredAtom,
  accessTokenAtom,
  refreshTokenAtom
} from '@/lib/stores/auth'
import type { components } from '@/lib/types/api'

type LoginRequest = components["schemas"]["LoginRequest"]
/**
 * Main auth hook that exposes auth state and actions
 * Simple wrapper around auth atoms with familiar interface
 */
export const useAuth = () => {
  // Read-only atoms
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const userBasic = useAtomValue(userBasicAtom)
  const isSeller = useAtomValue(isSellerAtom)
  const isBuyer = useAtomValue(isBuyerAtom)
  const isTokenExpired = useAtomValue(isTokenExpiredAtom)
  
  // Query atoms
  const profileQuery = useAtomValue(userProfileAtom)

  // Mutation and action atoms
  const [loginMutation] = useAtom(loginMutationAtom)
  const [, performLogout] = useAtom(logoutAtom)
  
  // Token setter atoms for component context
  const [, setAccessToken] = useAtom(accessTokenAtom)
  const [, setRefreshToken] = useAtom(refreshTokenAtom)
  
  // Simple wrapper functions that call the atoms
  const login = async (credentials: LoginRequest) => {
    const data = await loginMutation.mutateAsync({
      credentials: {
        Email: credentials.Email ?? undefined,
        Password: credentials.Password ?? undefined
      }}
    )
    
    // NEW APPROACH: Set tokens in component context (syncs properly with useAtom!)
    if (!data.AccessToken || !data.RefreshToken) {
      throw new Error('Login response did not contain tokens')
    }
    
    setAccessToken(data.AccessToken)
    setRefreshToken(data.RefreshToken.RefreshToken)    
    // OLD APPROACH (kept for reference):
    // await loginMutation.mutateAsync({...}) 
    // Profile would auto-fetch when queryKey changes, but atoms weren't syncing
    setTimeout(() => profileQuery.refetch(), 200) // Manual backup refetch
  }
  
  const logout = () => {
    performLogout()
  }
  
  return {
    // Auth status - match what components expect
    isAuthenticated,
    isLoading: isAuthenticated && profileQuery.isPending,
    
    // User data - match expected property names
    userBasic,
    userProfile: profileQuery.data || null,
    
    // Role checks
    isSeller,
    isBuyer,
    
    // Token status
    isTokenExpired,
    
    // Actions - match what components expect
    login,
    logout,
    
    // Loading states - match what components expect
    isLoggingIn: loginMutation.isPending,
    isProfileLoading: profileQuery.isPending,
    
    // Errors
    loginError: loginMutation.error,
    profileError: profileQuery.error
  }
}

/**
 * Hook for components that only need basic auth status
 * Lighter weight alternative to useAuth for simple use cases
 */
export const useAuthStatus = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const userBasic = useAtomValue(userBasicAtom)
  const isSeller = useAtomValue(isSellerAtom)
  const isBuyer = useAtomValue(isBuyerAtom)
  
  return {
    isAuthenticated,
    userBasic,
    isSeller,
    isBuyer
  }
}

/**
 * Hook specifically for role-based access control
 * Useful for conditional rendering based on user roles
 */
export const useUserRoles = () => {
  const isSeller = useAtomValue(isSellerAtom)
  const isBuyer = useAtomValue(isBuyerAtom)
  const userBasic = useAtomValue(userBasicAtom)
  
  return {
    isSeller,
    isBuyer,
    role: userBasic?.role || null
  }
}