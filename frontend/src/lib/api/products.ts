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
  console.log("Batch pre-sign URL response:", response.data.Data);
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

// Export types for use in components
export type { ProductDto, ProductCategory, CreateProductRequest,MyProductsQuery, BatchUploadUrlRequest, BatchUploadUrlResponse };