// Export all generated API types
export type { paths, components } from './api'

// Import types for local use
import type { paths, components } from './api'

// Convenience type extractors
export type ApiPaths = paths
export type ApiSchemas = components['schemas']

// Common request/response type helpers
export type GetEndpoint<T extends keyof paths> = paths[T] extends { get: unknown } ? paths[T]['get'] : never
export type PostEndpoint<T extends keyof paths> = paths[T] extends { post: unknown } ? paths[T]['post'] : never
export type PutEndpoint<T extends keyof paths> = paths[T] extends { put: unknown } ? paths[T]['put'] : never
export type DeleteEndpoint<T extends keyof paths> = paths[T] extends { delete: unknown } ? paths[T]['delete'] : never

// Request body type extractor
export type RequestBody<T> = T extends { requestBody: { content: { 'application/json': infer U } } } ? U : never

// Response type extractor
export type ResponseBody<T> = T extends { responses: { 200: { content: { 'application/json': infer U } } } } ? U : never

// Example usage types (can be removed in production)
export type LoginRequest = RequestBody<PostEndpoint<'/api/v1/auth/login'>>
export type RegisterRequest = RequestBody<PostEndpoint<'/api/v1/auth/register'>>
export type CreateProductRequest = RequestBody<PostEndpoint<'/api/v1/products'>>
export type AddToCartRequest = RequestBody<PostEndpoint<'/api/v1/cart/items'>>