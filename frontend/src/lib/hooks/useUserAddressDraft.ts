import { useAtom, useAtomValue } from 'jotai'
import { userAddressDraftAtom, userAddressAtom, saveUserAddressMutationAtom } from '@/lib/stores/userAddress'
import type { components } from '@/lib/types/api'

type UserAddressDto = components["schemas"]["UserAddressDto"]

interface UseUserAddressDraftReturn {
  data: Partial<UserAddressDto>
  hasDraft: boolean
  saveDraft: (draft: Partial<UserAddressDto>) => void
  clearDraft: () => void
  saveToServer: (data: Partial<UserAddressDto>) => Promise<void>
  isSaving: boolean
  isLoading: boolean
}

/**
 * Hook for managing user address draft data - simplified without hydration complexity
 */
export function useUserAddressDraft(): UseUserAddressDraftReturn {
  // User address atoms
  const serverAddress = useAtomValue(userAddressAtom)
  const [draft, setDraft] = useAtom(userAddressDraftAtom)
  const saveAddressMutation = useAtomValue(saveUserAddressMutationAtom)

  // Calculate working data (server + draft) - handle null server data gracefully
  const serverData = serverAddress.data || {}
  const workingData = draft ? { ...serverData, ...draft } : serverData
  
  const hasDraft = draft !== null && Object.keys(draft).length > 0
  
  // Actions
  const saveDraft = (newDraft: Partial<UserAddressDto>) => {
    setDraft(newDraft)
  }
  
  const clearDraft = () => {
    setDraft(null)
  }
  
  const saveToServer = async (data: Partial<UserAddressDto>) => {
    try {
      await saveAddressMutation.mutateAsync(data)
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
    isSaving: saveAddressMutation.isPending,
    isLoading: serverAddress.isLoading
  }
}