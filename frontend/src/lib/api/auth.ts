import apiClient from './client';
import type { components } from '@/lib/types/api';
import type { RegisterFormData } from '@/lib/validation/register';

type RegisterRequest = components["schemas"]["RegisterRequest"];
type ServiceSuccess = components["schemas"]["ServiceSuccess`1"];

/**
 * Register a new user account
 * @param formData - Validated form data from the registration form
 * @returns Promise resolving to registration response data
 * @throws Will throw axios error if registration fails (handled by axios interceptor)
 */
export async function registerUser(formData: RegisterFormData): Promise<ServiceSuccess> {
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
    PreferredLanguage: formData.preferredLanguage || null,
    PreferredCurrency: formData.preferredCurrency || null,
  };

  // Make API call - Axios interceptor handles global error scenarios automatically
  const response = await apiClient.post<ServiceSuccess>('/auth/register', registerRequest);
  return response.data;
}