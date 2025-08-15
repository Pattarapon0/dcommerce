import * as v from 'valibot';

// Validation schema that matches backend LoginRequestValidator exactly
export const loginSchema = v.object({
  // Email validation - matches backend exactly
  email: v.pipe(
    v.string('Email is required'),
    v.trim(),
    v.nonEmpty('Email is required'),
    v.email('Invalid email format')
  ),
  
  // Password validation - just required for login (no complexity check)
  password: v.pipe(
    v.string('Password is required'),
    v.trim(),
    v.nonEmpty('Password is required')
  )
});

// Type inference
export type LoginFormData = v.InferInput<typeof loginSchema>;

// Simple type-safe error interface
export interface LoginErrors {
  email?: string;
  password?: string;
}