import { useQuery,keepPreviousData} from "@tanstack/react-query";
import { getMyProducts, type MyProductsQuery } from "@/lib/api/products";
import { useAuth } from "@/hooks/useAuth";

export interface ServerSideTableParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  ascending?: boolean;
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

/**
 * Hook to fetch seller's products with full server-side support
 * Handles pagination, sorting, filtering, and search on the backend
 */
export function useSellerProducts(params: ServerSideTableParams = {}) {
  const { isAuthenticated, userBasic } = useAuth();
  
  const {
    page = 1,
    pageSize = 20,
    sortBy = "CreatedAt",
    ascending = false,
    searchTerm,
    category,
    minPrice,
    maxPrice,
    isActive
  } = params;

  const queryParams: MyProductsQuery = {
    Page: page,
    PageSize: pageSize,
    SortBy: sortBy,
    Ascending: ascending,
    ...(searchTerm && { SearchTerm: searchTerm }),
    ...(category && category !== "all" && { Category: category as any }),
    ...(minPrice !== undefined && { MinPrice: minPrice }),
    ...(maxPrice !== undefined && { MaxPrice: maxPrice }),
    ...(isActive !== undefined && { IsActive: isActive })
  };
  
  return useQuery({
    queryKey: ['my-products', queryParams, userBasic?.id],
    queryFn: () => getMyProducts(queryParams),
    enabled: isAuthenticated && !!userBasic?.id && userBasic?.role === "Seller",
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData:keepPreviousData
  });
}