import { useAtomValue } from 'jotai'
import { userProfileAtom, completeProfileMutationAtom } from '@/stores/profile'
import { isProfileComplete, type ProfileCompletionFormData } from '@/lib/validation/profileCompletion'
import { useAuthStatus } from '@/hooks/useAuth'
import type { components } from '@/lib/types/api'

type UserProfileDto = components["schemas"]["UserProfileDto"]

interface UseProfileCompletionReturn {
  // Profile completeness state
  isComplete: boolean
  profile: UserProfileDto | undefined
  
  // Completion actions
  completeProfile: (data: ProfileCompletionFormData) => Promise<UserProfileDto>
  
  // Loading states
  isCompleting: boolean
  isLoading: boolean
  
  // Check specific missing fields
  missingFields: {
    phoneNumber: boolean
    dateOfBirth: boolean
  }
}

/**
 * Hook for managing profile completion flow
 * Provides profile completeness checking and completion functionality
 */
export function useProfileCompletion(): UseProfileCompletionReturn {
  const { isAuthenticated } = useAuthStatus()
  const profileQuery = useAtomValue(userProfileAtom)
  const completeProfileMutation = useAtomValue(completeProfileMutationAtom)
  
  const profile = profileQuery.data
  const isComplete = profile ? isProfileComplete(profile) : false
  
  // Check which specific fields are missing
  const missingFields = {
    phoneNumber: !profile?.PhoneNumber,
    dateOfBirth: !profile?.DateOfBirth
  }
  
  const completeProfile = async (data: ProfileCompletionFormData): Promise<UserProfileDto> => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to complete profile')
    }
    
    try {
      const completedProfile = await completeProfileMutation.mutateAsync(data)
      return completedProfile
    } catch (error) {
      // Error handling is done by the mutation's onError + toast system
      throw error
    }
  }
  
  return {
    isComplete,
    profile,
    completeProfile,
    isCompleting: completeProfileMutation.isPending,
    isLoading: profileQuery.isLoading,
    missingFields
  }
}