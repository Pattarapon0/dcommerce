import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders, getOrderStats, type OrderFilterRequest } from "@/lib/api/orders";
import { useAuth } from "@/hooks/useAuth";

export const useGetOrders = (filters?: OrderFilterRequest) => {
  const { isAuthenticated, userProfile } = useAuth();
  return useQuery({
    queryKey: ['orders', userProfile?.UserId, filters],
    queryFn: () => getOrders(filters),
    enabled: isAuthenticated && !!userProfile?.UserId,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetOrderStats = () => {
  const { isAuthenticated, userProfile } = useAuth();
  return useQuery({
    queryKey: ['orderStats', userProfile?.UserId],
    queryFn: () => getOrderStats(),
    enabled: isAuthenticated && !!userProfile?.UserId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};