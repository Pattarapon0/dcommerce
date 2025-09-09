import * as v from 'valibot';

// Profile completion validation schema - matches backend CompleteProfileRequestValidator exactly
export const profileCompletionSchema = v.object({
  // Phone number validation - required for completion, matches backend regex
  phoneNumber: v.pipe(
    v.string('Phone number is required'),
    v.trim(),
    v.nonEmpty('Phone number is required'),
    v.maxLength(20, 'Phone number cannot exceed 20 characters'),
    v.regex(/^\+?[1-9]\d{1,14}$/, 'Phone number format is invalid. Use format: +1234567890')
  ),
  
  // Date of birth validation - required for completion, matches backend age check  
  dateOfBirth: v.pipe(
    v.date('Date of birth is required'),
    v.check((date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const dayDiff = today.getDate() - date.getDate();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 13;
    }, 'You must be at least 13 years old'),
    v.check((date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age <= 120;
    }, 'Invalid date of birth')
  ),

  // Country validation - optional with default, matches backend
  country: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.maxLength(100, 'Country cannot exceed 100 characters')
    )
  )
});

export type ProfileCompletionFormData = v.InferInput<typeof profileCompletionSchema>;

// Helper function to check if profile is complete
export function isProfileComplete(profile: {
  PhoneNumber?: string | null;
  DateOfBirth?: Date | string | null;
}): boolean {
  return !!(profile.PhoneNumber && profile.DateOfBirth);
}