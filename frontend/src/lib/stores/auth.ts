import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import { jwtDecode } from 'jwt-decode'
import apiClient from '@/lib/api/client'
import type { components } from '@/lib/types/api'


// Types
type LoginRequest = components["schemas"]["LoginRequest"]
type LoginResponseServiceSuccess = components["schemas"]["LoginResponseServiceSuccess"]
type LoginResponse = components["schemas"]["LoginResponse"]
type UserProfileDtoServiceSuccess = components["schemas"]["UserProfileDtoServiceSuccess"]
type UserProfileDto = components["schemas"]["UserProfileDto"]
// Define UserProfileDto based on backend DTO since it's not properly in generated types

interface JWTPayload {
  sub: string     // User ID
  email: string   // Email
  role: string    // User role: "Buyer" | "Seller"
  exp: number     // Expiration
  iat: number     // Issued at
  jti: string     // JWT ID
}

// ================== PERSISTENT ATOMS ==================
// These atoms persist data to localStorage and sync across tabs

export const accessTokenAtom = atomWithStorage<string | null>('accessToken', null)
export const refreshTokenAtom = atomWithStorage<string | null>('refreshToken', null)

// ================== COMPUTED ATOMS ==================
// These atoms derive state from other atoms

export const isAuthenticatedAtom = atom((get) => {
  const token = get(accessTokenAtom)
  return !!token
})

export const userBasicAtom = atom((get) => {
  const token = get(accessTokenAtom)
  if (!token) return null
  
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
})

export const isTokenExpiredAtom = atom((get) => {
  const token = get(accessTokenAtom)
  if (!token) return true
  
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
})

// ================== QUERY ATOMS ==================
// These atoms handle API calls with React Query integration

export const userProfileAtom = atomWithQuery((get) => ({
  queryKey: ['user', 'profile'],
  queryFn: async (): Promise<UserProfileDto> => {
    const response = await apiClient.get<UserProfileDtoServiceSuccess>('/user/profile')
    return response.data.Data as UserProfileDto
  },
  enabled: get(isAuthenticatedAtom) && !get(isTokenExpiredAtom),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000,   // 30 minutes cache
  retry: 3
}))

// ================== MUTATION ATOMS ==================
// These atoms handle API mutations (login, logout, etc.)

export const loginMutationAtom = atomWithMutation(() => ({
  mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponseServiceSuccess>('/auth/login', credentials)
    return response.data.Data as LoginResponse
  },
  onSuccess: (data: LoginResponse) => {
    // Note: Token setting is handled in the useAuth hook
    console.log('✅ Login successful:', { 
      hasAccessToken: !!data.AccessToken,
      hasRefreshToken: !!data.RefreshToken 
    })
  },
  onError: (error) => {
    console.error('❌ Login failed:', error)
  }
}))

// ================== ACTION ATOMS ==================
// These are write-only atoms for performing actions

export const logoutAtom = atom(
  null, // No read value
  (get, set) => {
    // Clear all auth state
    set(accessTokenAtom, null)
    set(refreshTokenAtom, null)
    
    // Clear user profile cache by invalidating the query
    // Note: Query invalidation will be handled in the useAuth hook
    
    console.log('🚪 User logged out')
  }
)

// ================== UTILITY ATOMS ==================
// Helper atoms for common auth checks

export const isSellerAtom = atom((get) => {
  const user = get(userBasicAtom)
  return user?.role === 'Seller'
})

export const isBuyerAtom = atom((get) => {
  const user = get(userBasicAtom)
  return user?.role === 'Buyer'
})