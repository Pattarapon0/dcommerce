import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import apiClient from '@/lib/api/client'
import { queryClient } from '@/components/providers/AuthProviders'
import { userBasicAtom, hasValidTokenAtom } from './auth'
import store from './store'
import type { components } from '@/lib/types/api'

// Types
type UserProfileDtoServiceSuccess = components["schemas"]["UserProfileDtoServiceSuccess"]
type UserProfileDto = components["schemas"]["UserProfileDto"]

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