import { useAtomValue } from "jotai";
import { sellerDashboardAtom } from "@/stores/seller";

export const useSellerDashboard = () => {
  const dashboardQuery = useAtomValue(sellerDashboardAtom);

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isPending,
    isFetching: dashboardQuery.isFetching,
    refetch: dashboardQuery.refetch,
    error: dashboardQuery.error,
  }
};
