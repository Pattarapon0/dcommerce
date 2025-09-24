import { useQuery,keepPreviousData,useInfiniteQuery} from "@tanstack/react-query";;
import { getProductById,getProductsBySearchQuery,type SearchProductsQuery,type ProductSearchRequest,getProductsSearchResults,getRelatedProducts,getSellerProducts,getFeaturedProducts,getTopSellingProducts} from "@/lib/api/products";

export const useGetProductById= (productId:string) => {
    return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  })
}
export const useGetProductsSearch = (searchQuery: SearchProductsQuery,enabled:boolean) => {
  return useQuery({
    queryKey: ['products', 'search', searchQuery],
    queryFn: () => getProductsBySearchQuery(searchQuery),
    enabled: !!searchQuery && enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}
  export const useGetProductsSearchResult = (searchRequest: ProductSearchRequest, enabled: boolean = true) => {
    return useInfiniteQuery({
      queryKey: ['products', 'search', searchRequest],
      queryFn: async ({ pageParam = 1 }) => {
        const results = await getProductsSearchResults({ ...searchRequest, Page: pageParam });
        return results;
      },
      initialPageParam: 1,
      getPreviousPageParam: (firstPage) => firstPage.HasPreviousPage && firstPage.Page !== undefined ? firstPage.Page - 1 : undefined,
      getNextPageParam: (lastPage) => lastPage.HasNextPage && lastPage.Page !== undefined ? lastPage.Page + 1 : undefined,
      enabled: !!searchRequest && enabled,
    })
  }

export const useGetRelatedProducts = (productId: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: () => getRelatedProducts(productId, limit),
    enabled: !!productId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetSellerProducts = (sellerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products', 'seller', sellerId],
    queryFn: () => getSellerProducts(sellerId),
    enabled: !!sellerId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetTopSellingProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'top-selling', limit],
    queryFn: () => getTopSellingProducts(limit),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};