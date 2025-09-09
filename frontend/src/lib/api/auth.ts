import apiClient from './client';
import type { components } from '@/lib/types/api';
import type { RegisterFormData } from '@/lib/validation/register';
import { initiateGooglePkceFlow } from '@/lib/utils/pkce';

type RegisterRequest = components["schemas"]["RegisterRequest"];
type RegisterResponseServiceSuccess = components["schemas"]["RegisterResponseServiceSuccess"];
type RegisterResponse = components["schemas"]["RegisterResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type LoginResponseServiceSuccess = components["schemas"]["LoginResponseServiceSuccess"];
type LoginResponse = components["schemas"]["LoginResponse"];

// PKCE callback request type - matches backend PkceCallbackRequest
interface PkceCallbackRequest {
  Code: string;
  CodeVerifier: string;
  State?: string;
}

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
  const loginRequest: LoginRequest = {
    Email: credentials.email,
    Password: credentials.password,
  };
  
  const response = await apiClient.post<LoginResponseServiceSuccess>('/auth/login', loginRequest);

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

/**
 * Initiate Google OAuth PKCE flow
 * @returns Redirects to Google OAuth with PKCE challenge
 */
export async function initiateGoogleLogin(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }
  
  // For SPA, we redirect back to our own callback page
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  await initiateGooglePkceFlow(clientId, redirectUri);
}

/**
 * Handle PKCE OAuth callback with authorization code
 * @param code - Authorization code from Google
 * @param codeVerifier - PKCE code verifier from session storage
 * @param state - State parameter for CSRF validation
 * @returns Promise resolving to login response with tokens
 * @throws Will throw axios error if PKCE callback fails
 */
export async function handlePkceCallback(
  code: string, 
  codeVerifier: string, 
  state?: string
): Promise<LoginResponse> {
  const pkceRequest: PkceCallbackRequest = {
    Code: code,
    CodeVerifier: codeVerifier,
    State: state
  };
  
  const response = await apiClient.post<LoginResponseServiceSuccess>('/auth/google/pkce', pkceRequest);
  
  const loginResponse = response.data.Data;
  
  if (!loginResponse?.AccessToken) {
    throw new Error('Invalid PKCE callback response: missing access token');
  }
  
  return loginResponse;
}

/**
 * Parse OAuth callback URL parameters
 * @param searchParams - URL search parameters from callback
 * @returns Parsed callback data
 */
export function parseOAuthCallback(searchParams: URLSearchParams): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} {
  return {
    code: searchParams.get('code') || undefined,
    state: searchParams.get('state') || undefined,
    error: searchParams.get('error') || undefined,
    errorDescription: searchParams.get('error_description') || undefined,
  };
}