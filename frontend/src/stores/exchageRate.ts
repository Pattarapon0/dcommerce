import { atomWithQuery} from "jotai-tanstack-query";
import apiClient from "@/lib/api/client";
import type {components} from "@/lib/types/api";

type ExchangeRateResponseDtoServiceSuccess = components['schemas']['ExchangeRateResponseDtoServiceSuccess'];
type ExchangeRateResponseDto = components['schemas']['ExchangeRateResponseDto'];


export const exchangeRateAtom = atomWithQuery((get) => ({
  queryKey: ["exchangeRate"],
  queryFn: async () => {
    const response = await apiClient.get("/exchange-rates");
    return response.data as ExchangeRateResponseDtoServiceSuccess['Data'] as ExchangeRateResponseDto;
  },
  refetchInterval: 60 * 60 * 1000,
  staleTime: 60 * 60 * 1000, // 1 hour
}));

