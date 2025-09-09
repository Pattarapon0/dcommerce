import { isProfileComplete } from '@/lib/validation/profileCompletion'
import type { components } from '@/lib/types/api'

type UserProfileDto = components["schemas"]["UserProfileDto"]

/**
 * Profile completeness utilities for checking OAuth user profile status
 */
export class ProfileCompleteness {
  /**
   * Check if a user profile is complete (has phone number and date of birth)
   */
  static isComplete(profile: UserProfileDto | null | undefined): boolean {
    if (!profile) return false
    return isProfileComplete(profile)
  }

  /**
   * Get missing required fields from a user profile
   */
  static getMissingFields(profile: UserProfileDto | null | undefined): string[] {
    if (!profile) return ['profile']
    
    const missing: string[] = []
    
    if (!profile.PhoneNumber) {
      missing.push('phoneNumber')
    }
    
    if (!profile.DateOfBirth) {
      missing.push('dateOfBirth')
    }
    
    return missing
  }

  /**
   * Check if profile completion is required after OAuth login
   */
  static requiresCompletion(profile: UserProfileDto | null | undefined): boolean {
    return !this.isComplete(profile)
  }

  /**
   * Get user-friendly field names for missing fields
   */
  static getMissingFieldLabels(profile: UserProfileDto | null | undefined): string[] {
    const missing = this.getMissingFields(profile)
    const labels: string[] = []
    
    if (missing.includes('phoneNumber')) {
      labels.push('Phone Number')
    }
    
    if (missing.includes('dateOfBirth')) {
      labels.push('Date of Birth')
    }
    
    return labels
  }
}

/**
 * Hook for checking profile completeness with reactive updates
 */
export function useProfileCompleteness(profile: UserProfileDto | null | undefined) {
  return {
    isComplete: ProfileCompleteness.isComplete(profile),
    requiresCompletion: ProfileCompleteness.requiresCompletion(profile),
    missingFields: ProfileCompleteness.getMissingFields(profile),
    missingFieldLabels: ProfileCompleteness.getMissingFieldLabels(profile)
  }
}