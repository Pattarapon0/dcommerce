import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import { getUserProfile, updateUserProfile, completeUserProfile } from '@/lib/api/user'
import { queryClient } from '@/components/providers/AuthProviders'
import { userBasicAtom, hasValidTokenAtom } from './auth'
import store from './store'
import type { components } from '@/lib/types/api'
import type { ProfileCompletionFormData } from '@/lib/validation/profileCompletion'

// Types
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
    const profile = await getUserProfile();
    return profile;
  },
  enabled: get(hasValidTokenAtom),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 3
}))

// ================== MUTATION ATOMS ==================

// Profile update mutation atom
export const updateProfileMutationAtom = atomWithMutation(() => ({
  mutationKey: ['updateProfile'],
  mutationFn: async (profileData: Partial<UserProfileDto>) => {
    return await updateUserProfile(profileData);
  },
  onSuccess: (updatedProfile) => {
    const userBasic = store.get(userBasicAtom)
    const queryKey = ['user', 'profile', userBasic?.id]

    queryClient.setQueryData(queryKey, updatedProfile)

    store.set(profileDraftAtom, null)
  },
  onError: (error) => {
    console.error('❌ Profile update failed:', error)
  }
}))

// Profile completion mutation atom
export const completeProfileMutationAtom = atomWithMutation(() => ({
  mutationKey: ['completeProfile'],
  mutationFn: async (profileData: ProfileCompletionFormData) => {
    return await completeUserProfile(profileData);
  },
  onSuccess: (completedProfile) => {
    const userBasic = store.get(userBasicAtom)
    const queryKey = ['user', 'profile', userBasic?.id]

    queryClient.setQueryData(queryKey, completedProfile)

    store.set(profileDraftAtom, null)
  },
  onError: (error) => {
    console.error('❌ Profile completion failed:', error)
  }
}))