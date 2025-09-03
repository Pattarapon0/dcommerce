import { atomWithQuery,atomWithMutation } from "jotai-tanstack-query";
import type { components } from "@/lib/types/api";
import { hasValidTokenAtom } from "./auth";
import { getUserAddress, saveUserAddress } from "@/lib/api/user";
import { atomWithStorage} from 'jotai/utils'
import { atom } from "jotai";
import {queryClient} from "@/components/providers/AuthProviders";
import store from "@/stores/store";
export type userAddressDto = components["schemas"]["UserAddressDto"];

export const userAddressAtom = atomWithQuery((get) => ({
  queryKey: ["userAddress"],
  queryFn: async () => {
    return await getUserAddress();
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
    return await saveUserAddress(addressData, currentAddress);
  },
  onSuccess: (updatedAddress) => {
    const queryKey = ["userAddress"];
    queryClient.setQueryData(queryKey, updatedAddress);
    store.set(userAddressDraftAtom, null); // Clear draft after successful save
  },  onError: (error) => {
    console.error('Failed to save user address:', error);
  }
}));