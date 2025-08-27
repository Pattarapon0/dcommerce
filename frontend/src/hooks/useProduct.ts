import { useQuery,keepPreviousData} from "@tanstack/react-query";;
import { getProductById } from "@/lib/api/products";

export const useGetProductById= (productId:string) => {
    console.log("Fetching product with ID:", productId);
    return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  })

}