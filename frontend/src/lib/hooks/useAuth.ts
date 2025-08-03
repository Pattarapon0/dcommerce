import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { 
  accessTokenAtom, 
  refreshTokenAtom, 
  isAuthenticatedAtom, 
  userBasicAtom, 
  userProfileAtom, 
  loginMutationAtom,
  logoutAtom,
  isSellerAtom,
  isBuyerAtom,
  isTokenExpiredAtom
} from '@/lib/stores/auth'
import { loginUser } from '@/lib/api/auth'

// Define UserProfileDto based on backend DTO since it's not properly in generated types
interface UserProfileDto {
  UserId: string;
  Email: string;
  Username?: string | null;
  Role: string;
  IsActive: boolean;
  IsVerified: boolean;
  CreatedAt: string;
  LastLogin?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  FullName: string;
  PhoneNumber?: string | null;
  AvatarUrl?: string | null;
  ProfileComplete: boolean;
  IsOAuthUser: boolean;
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthState {
  // Auth status
  isAuthenticated: boolean
  isLoading: boolean
  
  // User data
  userBasic: {
    id: string
    email: string
    role: string
  } | null
  userProfile: UserProfileDto | null
  
  // Role checks
  isSeller: boolean
  isBuyer: boolean
  
  // Token status
  isTokenExpired: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  
  // Loading states
  isLoggingIn: boolean
  isProfileLoading: boolean
  
  // Errors
  loginError: Error | null
  profileError: Error | null
}

/**
 * Comprehensive auth hook that provides all authentication state and actions
 * 
 * Features:
 * - Immediate auth status from JWT token in localStorage
 * - Background profile fetching with React Query caching
 * - Login/logout mutations with automatic token management
 * - Role-based access control helpers
 * - Loading states and error handling
 * - Cross-tab synchronization via Jotai storage atoms
 */
export const useAuth = (): AuthState => {
  const queryClient = useQueryClient()
  
  // Auth atoms
  const [, setAccessToken] = useAtom(accessTokenAtom)
  const [, setRefreshToken] = useAtom(refreshTokenAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [userBasic] = useAtom(userBasicAtom)
  const [isTokenExpired] = useAtom(isTokenExpiredAtom)
  
  // Role atoms
  const [isSeller] = useAtom(isSellerAtom)
  const [isBuyer] = useAtom(isBuyerAtom)
  
  // Profile query atom
  const [profileQuery] = useAtom(userProfileAtom)
  
  // Login mutation atom
  const [loginMutation] = useAtom(loginMutationAtom)
  
  // Logout action atom
  const [, performLogout] = useAtom(logoutAtom)
  
  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await loginUser(credentials)
      
      // Set tokens in atoms (automatically persists to localStorage)
      setAccessToken(response.AccessToken)
      setRefreshToken(response.RefreshToken)
      
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      
      console.log('🎉 Login successful - tokens saved')
    } catch (error) {
      console.error('🚨 Login failed:', error)
      throw error // Re-throw so components can handle it
    }
  }
  
  // Logout function
  const logout = (): void => {
    // Clear tokens via atom action
    performLogout()
    
    // Clear all React Query cache
    queryClient.clear()
    
    console.log('👋 Logged out successfully')
  }
  
  // Determine loading state
  const isLoading = isAuthenticated && profileQuery.isPending
  const isProfileLoading = profileQuery.isPending
  const isLoggingIn = loginMutation.isPending
  
  return {
    // Auth status
    isAuthenticated,
    isLoading,
    
    // User data
    userBasic,
    userProfile: profileQuery.data || null,
    
    // Role checks
    isSeller,
    isBuyer,
    
    // Token status
    isTokenExpired,
    
    // Actions
    login,
    logout,
    
    // Loading states
    isLoggingIn,
    isProfileLoading,
    
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
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [userBasic] = useAtom(userBasicAtom)
  const [isSeller] = useAtom(isSellerAtom)
  const [isBuyer] = useAtom(isBuyerAtom)
  
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
  const [isSeller] = useAtom(isSellerAtom)
  const [isBuyer] = useAtom(isBuyerAtom)
  const [userBasic] = useAtom(userBasicAtom)
  
  return {
    isSeller,
    isBuyer,
    role: userBasic?.role || null
  }
}