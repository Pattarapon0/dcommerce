import apiClient from './client';
import type { components } from '@/lib/types/api';
import type { RegisterFormData } from '@/lib/validation/register';

type RegisterRequest = components["schemas"]["RegisterRequest"];
type RegisterResponseServiceSuccess = components["schemas"]["RegisterResponseServiceSuccess"];
type RegisterResponse = components["schemas"]["RegisterResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type LoginResponseServiceSuccess = components["schemas"]["LoginResponseServiceSuccess"];
type LoginResponse = components["schemas"]["LoginResponse"];

/**
 * Register a new user account
 * @param formData - Validated form data from the registration form
 * @returns Promise resolving to registration response data
 * @throws Will throw axios error if registration fails (handled by axios interceptor)
 */
export async function registerUser(formData: RegisterFormData): Promise<RegisterResponse> {
  // Transform frontend form data to backend RegisterRequest
  // Note: confirmPassword is excluded as backend doesn't expect it
  const registerRequest: RegisterRequest = {
    Email: formData.email,
    Password: formData.password,
    FirstName: formData.firstName,
    LastName: formData.lastName,
    Country: formData.country,
    PhoneNumber: formData.phoneNumber || null,
    DateOfBirth: formData.dateOfBirth?.toISOString() || null,
    AcceptedTerms: formData.acceptedTerms,
    NewsletterSubscription: formData.newsletterSubscription || false,
    Username: formData.username || null,
    PreferredLanguage: "en", // Always default to English
    PreferredCurrency: formData.preferredCurrency ?? undefined,
  };

  // Make API call - Axios interceptor handles global error scenarios automatically
  const response = await apiClient.post<RegisterResponseServiceSuccess>('/auth/register', registerRequest);
  return response.data;
}

/**
 * Login user with email and password
 * @param credentials - Email and password for login
 * @returns Promise resolving to login response with tokens
 * @throws Will throw axios error if login fails (handled by axios interceptor)
 */
export async function loginUser(credentials: { email: string; password: string }): Promise<LoginResponse> {
  // Transform frontend credentials to backend LoginRequest
  const loginRequest: LoginRequest = {
    Email: credentials.email,
    Password: credentials.password,
  };
  console.log('🔐 Attempting login with credentials:', loginRequest);
  // Make API call - Axios interceptor handles global error scenarios automatically
  const response = await apiClient.post<LoginResponseServiceSuccess>('/auth/login', loginRequest);

  // Since the backend returns LoginResponse in the Data field, but TypeScript doesn't know this,
  // we need to cast it properly
  const loginResponse = response.data.Data ;
  
  if (!loginResponse?.AccessToken) {
    throw new Error('Invalid login response: missing access token');
  }
  
  return loginResponse;
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Current refresh token
 * @returns Promise resolving to new login response with fresh tokens
 * @throws Will throw axios error if refresh fails
 */
export async function refreshTokens(refreshToken: string): Promise<LoginResponse> {
  console.log('🔄 Attempting to refresh with token:', refreshToken)
  
  // Use plain axios to avoid circular dependency with client interceptors
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5295/api/v1'}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      RefreshToken: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.Data?.AccessToken) {
    throw new Error('Invalid refresh response: missing access token');
  }
  
  return data.Data;
}