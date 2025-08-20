import  {atomWithQuery} from 'jotai-tanstack-query';
import { getSellerDashboard } from '@/lib/api/seller';
import { userBasicAtom } from './auth';

export const sellerDashboardAtom = atomWithQuery((get) => ({
  queryKey: ['seller', 'dashboard', get(userBasicAtom)?.id],
  queryFn: async () => {
    return await getSellerDashboard();
  },
  enabled: !!get(userBasicAtom)?.id && get(userBasicAtom)?.role === 'Seller',
  refetchInterval: 5 * 60 * 1000,
  staleTime: 2 * 60 * 1000,
}));