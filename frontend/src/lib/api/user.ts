import apiClient from './client';
import type { components } from '@/lib/types/api';

// Types
type UserProfileDtoServiceSuccess = components["schemas"]["UserProfileDtoServiceSuccess"];
type UserProfileDto = components["schemas"]["UserProfileDto"];
type UserAddressDtoServiceSuccess = components["schemas"]["UserAddressDtoServiceSuccess"];
type UserAddressDto = components["schemas"]["UserAddressDto"];

/**
 * Get user profile
 * @returns Promise resolving to user profile data
 * @throws Will throw axios error if request fails
 */
export async function getUserProfile(): Promise<UserProfileDto> {
  const response = await apiClient.get<UserProfileDtoServiceSuccess>('/user/profile');
  return response.data.Data as UserProfileDto;
}

/**
 * Update user profile
 * @param profileData - Partial profile data to update
 * @returns Promise resolving to updated profile data
 * @throws Will throw axios error if request fails
 */
export async function updateUserProfile(profileData: Partial<UserProfileDto>): Promise<UserProfileDto> {
  console.log('Updating user profile with data:', profileData);
  const response = await apiClient.put<UserProfileDtoServiceSuccess>('/user/profile', profileData);
  return response.data.Data as UserProfileDto;
}

/**
 * Get user address
 * @returns Promise resolving to user address data or null if not found
 * @throws Will throw axios error if request fails (except 404)
 */
export async function getUserAddress(): Promise<UserAddressDto | null> {
  try {
    const response = await apiClient.get<UserAddressDtoServiceSuccess>('/user/address');
    return response.data.Data as UserAddressDto;
  } catch (error: unknown) {
    // If 404, return null (no address exists yet) - this is expected behavior
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status === "number" &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    // Re-throw other errors (network, auth, server errors)
    throw error;
  }
}

/**
 * Create new user address
 * @param addressData - Address data to create
 * @returns Promise resolving to created address data
 * @throws Will throw axios error if request fails
 */
export async function createUserAddress(addressData: Partial<UserAddressDto>): Promise<UserAddressDto> {
  const response = await apiClient.post<UserAddressDtoServiceSuccess>('/user/address', addressData);
  return response.data.Data as UserAddressDto;
}

/**
 * Update existing user address
 * @param addressData - Address data to update
 * @returns Promise resolving to updated address data
 * @throws Will throw axios error if request fails
 */
export async function updateUserAddress(addressData: Partial<UserAddressDto>): Promise<UserAddressDto> {
  const response = await apiClient.put<UserAddressDtoServiceSuccess>('/user/address', addressData);
  return response.data.Data as UserAddressDto;
}

/**
 * Save user address (create or update based on existence)
 * @param addressData - Address data to save
 * @param currentAddress - Current address if it exists
 * @returns Promise resolving to saved address data
 * @throws Will throw axios error if request fails
 */
export async function saveUserAddress(
  addressData: Partial<UserAddressDto>, 
  currentAddress?: UserAddressDto | null
): Promise<UserAddressDto> {
  // If no current address exists, CREATE new one (POST)
  if (!currentAddress) {
    return createUserAddress(addressData);
  } else {
    // If address exists, UPDATE it (PUT)
    return updateUserAddress(addressData);
  }
}