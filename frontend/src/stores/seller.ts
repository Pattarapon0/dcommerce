import  {atomWithQuery} from 'jotai-tanstack-query';
import apiClient from '@/lib/api/client';
import { userBasicAtom } from './auth';
import type { components } from '@/lib/types/api'

type SellerDashboardDtoServiceSuccess = components['schemas']['SellerDashboardDtoServiceSuccess']
type SellerDashboardDto = components['schemas']['SellerDashboardDto']

export const sellerDashboardAtom = atomWithQuery((get) => ({
  queryKey: ['seller', 'dashboard', get(userBasicAtom)?.id],
  queryFn: async () => {
    const response = await apiClient.get('/seller/dashboard');
    return response.data as SellerDashboardDtoServiceSuccess['Data'] as SellerDashboardDto;
  },
  refetchInterval: 5*60*1000 ,
  staleTime: 2*60*1000, 
}));