import apiClient from "./client";
import type { components, paths } from "../types/api";

type MyProductsQuery = paths["/api/v1/products/my-products"]["get"]["parameters"]["query"];

type ProductDto = components["schemas"]["ProductDto"];
type ProductDtoPagedResult = components["schemas"]["ProductDtoPagedResult"];
type ProductDtoPagedResultServiceSuccess = components["schemas"]["ProductDtoPagedResultServiceSuccess"];
type ProductCategory = components["schemas"]["ProductCategory"];
type BatchUploadUrlRequest = components["schemas"]["BatchUploadUrlRequest"];
type BatchUploadUrlResponse = components["schemas"]["BatchUploadUrlResponse"];
type BatchUploadUrlResponseServiceSuccess = components["schemas"]["BatchUploadUrlResponseServiceSuccess"];
type CreateProductRequest = components["schemas"]["CreateProductRequest"];
type ProductDtoServiceSuccess = components["schemas"]["ProductDtoServiceSuccess"];
type UpdateProductRequest = components["schemas"]["UpdateProductRequest"];
type SearchProductsQuery = paths["/api/v1/products/search"]["get"]["parameters"]["query"];
type ProductDtoListServiceSuccess = components["schemas"]["ProductDtoListServiceSuccess"];
type ProductSearchRequest = paths["/api/v1/products"]["get"]["parameters"]["query"];

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

export async function getBatchPreSignUrl(data: BatchUploadUrlRequest): Promise<BatchUploadUrlResponse> {
  const response = await apiClient.post<BatchUploadUrlResponseServiceSuccess>(
    "/products/batch-upload-urls",
    data
  );
  return response.data.Data as BatchUploadUrlResponse;
}

export async function createProduct(data: CreateProductRequest): Promise<ProductDto> {
  const response = await apiClient.post<ProductDtoServiceSuccess>(
    "/products",
    data
  );
  return response.data.Data as ProductDto;
}

export async function toggleProductStatus(productId: string){
  const response = await apiClient.patch<void>(
    `/products/${productId}/toggle-status`
  );
  return response.data;
}

export async function deleteProduct(productId: string){
  const response = await apiClient.delete<void>(`/products/${productId}`);
  return response.data;
}

export async function updateProduct(productId: string, data: UpdateProductRequest): Promise<ProductDto> {
  const response = await apiClient.patch<ProductDtoServiceSuccess>(
    `/products/${productId}`,
    data
  );
  return response.data.Data as ProductDto;
}

export async function getProductById(productId: string): Promise<ProductDto> {
  const response = await apiClient.get<ProductDtoServiceSuccess>(
    `/products/${productId}`
  );
  return response.data.Data as ProductDto;
}

export async function getProductsBySearchQuery(params: SearchProductsQuery): Promise<ProductDto[]> {
  const response = await apiClient.get<ProductDtoListServiceSuccess>(
    "/products/search",
    { params }
  );

  return response.data.Data as ProductDto[];
}

export async function getProductsSearchResults(params: ProductSearchRequest): Promise<ProductDtoPagedResult> {
  const response = await apiClient.get<ProductDtoPagedResultServiceSuccess>(
    "/products",
    { params }
  );

  return response.data.Data as ProductDtoPagedResult;
}

export async function getRelatedProducts(productId: string, limit: number = 5): Promise<ProductDto[]> {
  const response = await apiClient.get<ProductDtoListServiceSuccess>(
    `/products/${productId}/related`,
    { params: { limit } }
  );

  return response.data.Data as ProductDto[];
}

export async function getSellerProducts(sellerId: string): Promise<ProductDtoPagedResult> {
  const response = await apiClient.get<ProductDtoPagedResultServiceSuccess>(
    `/products/seller/${sellerId}`
  );

  return response.data.Data as ProductDtoPagedResult;
}

// Export types for use in components
export type { ProductDto, ProductCategory,ProductSearchRequest, SearchProductsQuery, CreateProductRequest, MyProductsQuery, UpdateProductRequest, BatchUploadUrlRequest, BatchUploadUrlResponse };