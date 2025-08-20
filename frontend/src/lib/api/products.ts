import apiClient from "./client";
import type { components, paths } from "../types/api";

type MyProductsQuery = paths["/api/v1/products/my-products"]["get"]["parameters"]["query"];

type ProductDto = components["schemas"]["ProductDto"];
type ProductDtoPagedResult = components["schemas"]["ProductDtoPagedResult"];
type ProductDtoPagedResultServiceSuccess = components["schemas"]["ProductDtoPagedResultServiceSuccess"];
type ProductCategory = components["schemas"]["ProductCategory"];

/**
 * Get seller's products with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to paged product results
 */
export async function getMyProducts(params?: MyProductsQuery): Promise<ProductDtoPagedResult> {
  const response = await apiClient.get<ProductDtoPagedResultServiceSuccess>(
    "/products/my-products", // Remove /api/v1 prefix (baseURL handles it)
    { params }
  );

  // Extract from ServiceSuccess wrapper, with proper fallback
  return response.data.Data || {
    Items: [],
    TotalCount: 0,
    Page: params?.Page || 1,
    PageSize: params?.PageSize || 20,
    TotalPages: 0,
    HasNextPage: false,
    HasPreviousPage: false
  };
}

/**
 * Get single product by ID
 * @param productId - Product identifier  
 * @returns Promise resolving to product details
 */
export async function getMyProduct(productId: string): Promise<ProductDto> {
  const response = await apiClient.get<components["schemas"]["ProductDtoServiceSuccess"]>(
    `/products/my-products/${productId}`
  );
  
  if (!response.data.Data) {
    throw new Error('Product not found');
  }
  
  return response.data.Data;
}

// Export types for use in components
export type { ProductDto, ProductCategory, MyProductsQuery };