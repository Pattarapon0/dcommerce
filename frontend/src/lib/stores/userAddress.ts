import { atomWithQuery,atomWithMutation } from "jotai-tanstack-query";
import type { components } from "@/lib/types/api";
import { hasValidTokenAtom } from "./auth";
import apiClient from "@/lib/api/client";
import { atomWithStorage} from 'jotai/utils'
import { atom } from "jotai";
import {queryClient} from "@/components/providers/AuthProviders";
import store from "@/lib/stores/store";
type userAddressDto = components["schemas"]["UserAddressDto"];
type userAddressDtoServiceSuccess = components["schemas"]["UserAddressDtoServiceSuccess"];

export const userAddressAtom = atomWithQuery((get) => ({
  queryKey: ["userAddress"],
  queryFn: async () => {
    try {
      const response = await apiClient.get<userAddressDtoServiceSuccess>(`/user/address`);
      return response.data.Data as userAddressDto;
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
  },
  enabled: get(hasValidTokenAtom),
  staleTime: 1000 * 60 * 5, 
  gcTime: 1000 * 60 * 30,
  retry: (failureCount, error: unknown) => {
    // Don't retry 404s (expected when no address exists)
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status === "number" &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return false;
    }
    return failureCount < 3;
  }
}));interface UserAddressMeta {
    data: Partial<userAddressDto>;
    timestamp: number;
    expiresAt: number;
}

const userAddressDraftStorageAtom = atomWithStorage<UserAddressMeta | null>('userAddressDraft', null, undefined,{getOnInit: true});

export const userAddressDraftAtom = atom(
    (get) => {
        const draft = get(userAddressDraftStorageAtom);
        if (!draft) return null;
        const now = Date.now();
        if (now >= draft.expiresAt) {
            return null; 
        }
        return draft.data as userAddressDto;
    },

    (get, set, newData: Partial<userAddressDto> | null) => {
        if (newData === null) {
            set(userAddressDraftStorageAtom, null);
            return;
        }
        const now = Date.now();
        const expiresAt = now + 1000 * 60 * 5; // 5 minutes expiration
        set(userAddressDraftStorageAtom, {
            data: newData,
            timestamp: now,
            expiresAt
        });
    }

);

export const saveUserAddressMutationAtom = atomWithMutation((get) => ({
  mutationKey: ['saveUserAddress'],
  mutationFn: async (addressData: Partial<userAddressDto>) => {
    const currentAddress = get(userAddressAtom).data;
    
    // If no current address exists, CREATE new one (POST)
    if (!currentAddress) {
      const response = await apiClient.post<userAddressDtoServiceSuccess>(`/user/address`, addressData);
      return response.data.Data as userAddressDto;
    } else {
      // If address exists, UPDATE it (PUT)
      const response = await apiClient.put<userAddressDtoServiceSuccess>(`/user/address`, addressData);
      return response.data.Data as userAddressDto;
    }
  },
  onSuccess: (updatedAddress) => {
    const queryKey = ["userAddress"];
    queryClient.setQueryData(queryKey, updatedAddress);
    store.set(userAddressDraftAtom, null); // Clear draft after successful save
  },  onError: (error) => {
    console.error('Failed to save user address:', error);
  }
}));