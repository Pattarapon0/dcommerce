import { atomWithQuery} from "jotai-tanstack-query";

import { getExchangeRates } from "@/lib/api/exchange-rates";

export const exchangeRateAtom = atomWithQuery(() => ({
  queryKey: ["exchangeRate"],
  queryFn: async () => {
    return await getExchangeRates();
  },
  staleTime: 60 * 60 * 1000, // 1 hour
}));

