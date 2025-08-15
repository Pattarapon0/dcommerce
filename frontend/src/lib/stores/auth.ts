import { atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import { jwtDecode } from 'jwt-decode'
import apiClient from '@/lib/api/client'
import { loginUser, refreshTokens } from '../api/auth'
import { queryClient } from '@/components/providers/AuthProviders'
import type { components } from '@/lib/types/api'
import store from './store';
import { deleteFile, getFile ,saveFile} from '@/lib/utils/OPFS'
import {fileToUsableBlobUrl,convertToWebP} from "@/lib/utils/imageUtils"
import { string } from 'valibot'

// Types
type LoginRequest = components["schemas"]["LoginRequest"]
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

export const userAvatarUrlAtom = atomWithStorage<string | null>(
  'userAvatarUrl',
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

// Smart authentication atom that auto-refreshes expired tokens
export const isAuthenticatedAtom = atom(async (get) => {
  const token = get(accessTokenAtom)
  const refreshToken = get(refreshTokenAtom)
  const expiration = get(tokenExpirationAtom)

  if (!token || !expiration) return false

  const expirationTime = new Date(expiration).getTime()
  const now = Date.now()
  const buffer = 5 * 60 * 1000 // 5 minutes buffer

  // If token is still valid, return true
  if (expirationTime > (now + buffer)) {
    return true
  }

  // Token is expired/expiring - try to refresh if we have refresh token
  if (!refreshToken) {
    // No refresh token - clear everything and return false
    store.set(logoutAtom)
    return false
  }

  try {
    console.log('🔄 Token expired, attempting refresh...')
    // Auto-refresh the token
    const newTokens = await refreshTokens(refreshToken)

    // Update storage with new tokens
    store.set(updateTokensAtom, newTokens)
    console.log('✅ Token refreshed successfully')

    return true
  } catch (error) {
    console.error('❌ Token refresh failed:', error)
    // Refresh failed - clear everything
    store.set(logoutAtom)
    return false
  }
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

// Base async atom for avatar processing
const baseUserProfileAvatarAtom = atom(async (get) => {
  const userProfile = get(userProfileAtom)
  const storagePicUrl = get(userAvatarUrlAtom)
  if (!userProfile?.data?.AvatarUrl) {
    return null
  }
  else {
    if (storagePicUrl && (userProfile?.data?.AvatarUrl === storagePicUrl)) {
      const file = await getFile("buyer-avatars", "avatar.webp")
      if (file.success && file.data) {
        return fileToUsableBlobUrl(file.data)
      }
    }
    const file= await convertToWebP(userProfile.data.AvatarUrl)
    if (file) {
      const result= await saveFile("buyer-avatars", "avatar.webp", file)
      if (result.success) {
        store.set(userAvatarUrlAtom, userProfile.data.AvatarUrl)
        return fileToUsableBlobUrl(file)
      }
    }
  }
  return null
})

// ================== REACTIVE AVATAR SYSTEM ==================
// Boolean toggle for avatar invalidation - prevents overflow and always triggers change
const avatarInvalidationAtom = atom(false)

// Action atom to trigger avatar re-evaluation
export const invalidateAvatarAtom = atom(
  null,
  (get, set) => {
    set(avatarInvalidationAtom, prev => !prev) // Toggle true↔false
    console.log('🔄 Avatar atom invalidated')
  }
)

const baseDraftUserProfileAvatarAtom = atom(async (get) => {
  get(avatarInvalidationAtom) // Subscribe to invalidation trigger - any change forces re-evaluation
  
  const file = await getFile("drafts-buyer-avatars", "avatar.webp")
  if (file.success && file.data) {
    console.log('📁 Draft avatar found in OPFS')
    return fileToUsableBlobUrl(file.data)
  }
  
  console.log('📁 No draft avatar, falling back to profile avatar')
  return null
})

// Loadable wrapper that provides loading/error states
export const userProfileAvatarAtom = loadable(baseUserProfileAvatarAtom)
export const userDraftProfileAvatarAtom = loadable(baseDraftUserProfileAvatarAtom)
export const isDraftNoAvatarAtom = atomWithStorage<boolean>('isDraftNoAvatar', 
  false,undefined,{getOnInit: true})

// ================== QUERY ATOMS ==================
// These atoms handle API calls with React Query integration

export const userProfileAtom = atomWithQuery((get) => ({
  queryKey: ['user', 'profile', get(userBasicAtom)?.id],
  queryFn: async (): Promise<UserProfileDto> => {
    const response = await apiClient.get<UserProfileDtoServiceSuccess>('/user/profile')
    console.log('User profile fetched:', response.data.Data)
    return response.data.Data as UserProfileDto
  },
  enabled: get(hasValidTokenAtom), // Use synchronous version for query enablement
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000,   // 30 minutes cache
  retry: 3
}))

// ================== MUTATION ATOMS ==================
// These atoms handle API mutations (login, logout, etc.)



export const loginMutationAtom = atomWithMutation(() => ({
  mutationFn: async ({ credentials }: { credentials: LoginRequest }): Promise<LoginResponse> => {
    const response = await loginUser({
      email: credentials.Email ?? '',
      password: credentials.Password ?? ''
    });
    return response;
  },
  onSuccess: (data: LoginResponse) => {
    // Use the new updateTokensAtom to handle token storage properly
    store.set(updateTokensAtom, data)

    console.log('✅ Login successful - tokens saved:', {
      hasAccessToken: !!data.AccessToken,
      hasRefreshToken: !!data.RefreshToken,
      refreshTokenValue: data.RefreshToken?.RefreshToken,
      expiresAt: data.Token?.ExpiresAt
    })
  },
  onError: (error: unknown) => {
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
    set(tokenExpirationAtom, null)
    set(profileDraftStorageAtom, null)

    // Clear user profile cache by invalidating the query
    // Note: Query invalidation will be handled in the useAuth hook

    console.log('🚪 User logged out')
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

    console.log('🔄 Tokens updated:', {
      hasAccessToken: !!response.AccessToken,
      hasRefreshToken: !!response.RefreshToken,
      expiresAt: response.Token.ExpiresAt
    })
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

// ================== PROFILE DRAFT SYSTEM ==================
// Smart draft atom with auto-expiry using atomWithStorage

const DRAFT_EXPIRY_DAYS = 7

interface ProfileDraftMeta {
  data: Partial<UserProfileDto>
  timestamp: number
  expiresAt: number
}

// Raw storage atom with metadata
const profileDraftStorageAtom = atomWithStorage<ProfileDraftMeta | null>(
  'profileDraft',
  null,
  undefined,
  { getOnInit: true }
)

// Smart atom that handles expiry automatically
export const profileDraftAtom = atom(
  // Read: Auto-expire check built-in
  (get) => {
    const stored = get(profileDraftStorageAtom)
    if (!stored) return null

    // ✅ Auto-expire old drafts on read
    if (Date.now() > stored.expiresAt) {
      return null // Don't clear here, let write handle it
    }

    return stored.data
  },

  // Write: Auto-timestamp or clear expired
  (get, set, newDraft: Partial<UserProfileDto> | null) => {
    if (newDraft === null) {
      set(profileDraftStorageAtom, null)
    } else {
      const stored = get(profileDraftStorageAtom)
      const draftWithMeta: ProfileDraftMeta = {
        data: { ...stored?.data, ...newDraft },
        timestamp: Date.now(),
        expiresAt: Date.now() + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      }
      set(profileDraftStorageAtom, draftWithMeta)
    }
  }
)

// Profile update mutation atom
export const updateProfileMutationAtom = atomWithMutation(() => ({
  mutationKey: ['updateProfile'],
  mutationFn: async (profileData: Partial<UserProfileDto>) => {
    const response = await apiClient.put<UserProfileDtoServiceSuccess>('/user/profile', profileData)
    return response.data.Data as UserProfileDto
  },
  onSuccess: (updatedProfile) => {
    const userBasic = store.get(userBasicAtom)
    const queryKey = ['user', 'profile', userBasic?.id]

    // ✅ Direct cache update - no refetch needed
    queryClient.setQueryData(queryKey, updatedProfile)

    // Clear draft after successful save
    store.set(profileDraftAtom, null)

    console.log('✅ Profile updated successfully')
  },
  onError: (error) => {
    console.error('❌ Profile update failed:', error)
  }
}))

// ================== AVATAR FILE SYSTEM ==================
// In-memory storage for WebP avatar files (buyer/seller separation)

interface AvatarFileState {
  buyer?: File | null
  seller?: File | null
}

// Memory-only atom for WebP files (not persisted to localStorage)
export const avatarFileAtom = atom<AvatarFileState>({
  buyer: null,
  seller: null
})

// Helper atom to update specific role's avatar
export const updateAvatarFileAtom = atom(
  null,
  (get, set, update: { role: 'buyer' | 'seller'; file: File | null }) => {
    const current = get(avatarFileAtom)
    set(avatarFileAtom, {
      ...current,
      [update.role]: update.file
    })

    console.log(`🖼️ Avatar file updated for ${update.role}:`, {
      hasFile: !!update.file,
      fileName: update.file?.name,
      fileSize: update.file ? `${(update.file.size / 1024).toFixed(1)}KB` : 'N/A'
    })
  }
)