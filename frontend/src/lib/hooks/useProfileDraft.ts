import { useAtom, useAtomValue } from 'jotai'
import { profileDraftAtom, userProfileAtom, updateProfileMutationAtom } from '@/lib/stores/auth'
import type { components } from '@/lib/types/api'

type UserProfileDto = components["schemas"]["UserProfileDto"]

interface UseProfileDraftReturn {
  // Current working data (server + draft)
  data: Partial<UserProfileDto>
  
  // Draft-specific state
  hasDraft: boolean
  
  // Actions
  saveDraft: (draft: Partial<UserProfileDto>) => void
  clearDraft: () => void
  saveToServer: (data: Partial<UserProfileDto>) => Promise<void>
  
  // Loading states
  isSaving: boolean
  isLoading: boolean
}

/**
 * Hook for managing profile draft data - simplified without hydration complexity
 */
export function useProfileDraft(): UseProfileDraftReturn {
  // Profile atoms
  const serverProfile = useAtomValue(userProfileAtom)
  const [draft, setDraft] = useAtom(profileDraftAtom)
  const updateProfileMutation = useAtomValue(updateProfileMutationAtom)
  
  // Calculate working data (server + draft)
  const serverData = serverProfile.data || {}
  const workingData = draft ? { ...serverData, ...draft } : serverData
  
  const hasDraft = draft !== null && Object.keys(draft).length > 0
  
  // Actions
  const saveDraft = (newDraft: Partial<UserProfileDto>) => {
    setDraft(newDraft)
  }
  
  const clearDraft = () => {
    setDraft(null)
  }
  
  const saveToServer = async (data: Partial<UserProfileDto>) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      // Draft is automatically cleared by the mutation's onSuccess
    } catch (error) {
      // Error handling is done by the mutation's onError + toast system
      throw error
    }
  }
  
  return {
    data: workingData,
    hasDraft,
    saveDraft,
    clearDraft,
    saveToServer,
    isSaving: updateProfileMutation.isPending,
    isLoading: serverProfile.isLoading
  }
}