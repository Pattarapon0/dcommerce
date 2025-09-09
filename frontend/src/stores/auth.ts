import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomWithMutation } from 'jotai-tanstack-query'
import { jwtDecode } from 'jwt-decode'
import { loginUser, refreshTokens } from '@/lib/api/auth'
import type { components } from '@/lib/types/api'
import store from './store'
import type { RegisterFormData } from '@/lib/validation/register';

// Types
type LoginRequest = components["schemas"]["LoginRequest"]
type LoginResponse = components["schemas"]["LoginResponse"]

interface JWTPayload {
  sub: string     // User ID
  email: string   // Email
  role: string    // User role: "Buyer" | "Seller"
  exp: number     // Expiration
  iat: number     // Issued at
  jti: string     // JWT ID
}


// ================== PERSISTENT ATOMS ==================
// These atoms persist data to localStorage and sync across tabs with proper hydration

export const accessTokenAtom = atomWithStorage<string | null>(
  'accessToken',
  null,
  undefined,
  { getOnInit: true }
)

export const refreshTokenAtom = atomWithStorage<string | null>(
  'refreshToken',
  null,
  undefined,
  { getOnInit: true }
)

export const tokenExpirationAtom = atomWithStorage<string | null>(
  'tokenExpiration',
  null,
  undefined,
  { getOnInit: true }
)

// ================== COMPUTED ATOMS ==================
// These atoms derive state from other atoms

// Synchronous version for query enablement (doesn't auto-refresh)
export const hasValidTokenAtom = atom((get) => {
  const token = get(accessTokenAtom)
  const expiration = get(tokenExpirationAtom)

  if (!token || !expiration) return false

  const expirationTime = new Date(expiration).getTime()
  const now = Date.now()
  const buffer = 5 * 60 * 1000 // 5 minutes buffer

  return expirationTime > (now + buffer)
})

// Smart authentication atom that checks token validity without auto-refresh
// (API client handles refresh automatically on 401 errors)
export const isAuthenticatedAtom = atom(async (get) => {
  const token = get(accessTokenAtom)
  const expiration = get(tokenExpirationAtom)

  if (!token || !expiration) return false

  const expirationTime = new Date(expiration).getTime()
  const now = Date.now()
  const buffer = 5 * 60 * 1000 // 5 minutes buffer

  // Return true if token exists and isn't expired
  // API client will handle refresh automatically if 401 occurs
  return expirationTime > (now + buffer)
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
  const expiration = get(tokenExpirationAtom)
  if (!expiration) return true

  const expirationTime = new Date(expiration).getTime()
  const now = Date.now()

  return now >= expirationTime
})

// ================== MUTATION ATOMS ==================
// These atoms handle API mutations (login, logout, etc.)

export const registerMutationAtom = atomWithMutation(() => ({
  mutationFn: async ({ formData }: { formData: RegisterFormData }) => {
    const { registerUser } = await import('@/lib/api/auth')
    return await registerUser(formData)
  },
  // No complex side effects needed - just basic success/error
}))

export const loginMutationAtom = atomWithMutation(() => ({
  mutationFn: async ({ credentials }: { credentials: LoginRequest }): Promise<LoginResponse> => {
    const response = await loginUser({
      email: credentials.Email ?? '',
      password: credentials.Password ?? ''
    });
    return response;
  },
  onSuccess: (data: LoginResponse) => {
    store.set(updateTokensAtom, data)
  },
  onError: (error: unknown) => {
    console.error('❌ Login failed:', error)
  }
}))

// ================== ACTION ATOMS ==================
// These are write-only atoms for performing actions

export const logoutAtom = atom(
  null,
  (get, set) => {
    set(accessTokenAtom, null)
    set(refreshTokenAtom, null)
    set(tokenExpirationAtom, null)
  }
)

// Update tokens after refresh or login
export const updateTokensAtom = atom(
  null,
  (get, set, response: LoginResponse) => {
    if (!response.AccessToken || !response.Token || !response.RefreshToken) {
      throw new Error('Invalid token response')
    }

    set(accessTokenAtom, response.AccessToken)
    set(refreshTokenAtom, response.RefreshToken.RefreshToken)
    set(tokenExpirationAtom, response.Token.ExpiresAt)
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