import * as v from 'valibot';

// Validation schema that matches backend RegisterRequestValidator exactly
export const registerSchema = v.object({
  // Email validation - matches backend exactly
  email: v.pipe(
    v.string('Email is required'),
    v.nonEmpty('Email is required'),
    v.email('Email format is invalid'),
    v.maxLength(255, 'Email cannot exceed 255 characters')
  ),
  
  // Password validation - matches backend intended regex (includes underscore)
  password: v.pipe(
    v.string('Password is required'),
    v.nonEmpty('Password is required'),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&_)'
    )
  ),
  
  // Confirm password - not validated by backend but needed for UX
  confirmPassword: v.pipe(
    v.string('Confirm password is required'),
    v.nonEmpty('Confirm password is required')
  ),
  
  // First name validation - matches backend exactly
  firstName: v.pipe(
    v.string('First name is required'),
    v.nonEmpty('First name is required'),
    v.maxLength(100, 'First name cannot exceed 100 characters'),
    v.regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
  ),
  
  // Last name validation - matches backend exactly
  lastName: v.pipe(
    v.string('Last name is required'),
    v.nonEmpty('Last name is required'),
    v.maxLength(100, 'Last name cannot exceed 100 characters'),
    v.regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
  ),
  
  // Country validation - matches backend exactly
  country: v.pipe(
    v.string('Country is required'),
    v.nonEmpty('Country is required'),
    v.maxLength(100, 'Country cannot exceed 100 characters')
  ),
  
  // Phone number validation - optional, matches backend when provided
  phoneNumber: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(20, 'Phone number cannot exceed 20 characters'),
      v.regex(/^\+?[1-9]\d{1,14}$/, 'Phone number format is invalid')
    )
  ),
  
  // Username validation - optional, matches backend when provided
  username: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(50, 'Username cannot exceed 50 characters'),
      v.regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    )
  ),
  
  // Date of birth validation - optional, matches backend age check
  dateOfBirth: v.optional(
    v.pipe(
      v.date('Invalid date format'),
      v.check((date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        const dayDiff = today.getDate() - date.getDate();
        
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        return actualAge >= 13;
      }, 'You must be at least 13 years old')
    )
  ),
  

  // Preferred currency validation - optional, matches backend
  preferredCurrency: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(10, 'Preferred currency code cannot exceed 10 characters')
    )
  ),
  
  // Terms acceptance - matches backend exactly
  acceptedTerms: v.pipe(
    v.boolean(),
    v.literal(true, 'You must accept the terms and conditions')
  ),
  
  // Newsletter subscription - optional boolean
  newsletterSubscription: v.optional(v.boolean())
});

// Additional validation for password confirmation match
export const registerSchemaWithPasswordMatch = v.pipe(
  registerSchema,
  v.check(
    (data) => data.password === data.confirmPassword,
    'Passwords do not match'
  )
);

// Type inference
export type RegisterFormData = v.InferInput<typeof registerSchemaWithPasswordMatch>;

// Simple type-safe error interface - all fields optional since we don't know which will have errors
export interface RegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phoneNumber?: string;
  username?: string;
  dateOfBirth?: string;

  preferredCurrency?: string;
  acceptedTerms?: string;
  newsletterSubscription?: string;
}