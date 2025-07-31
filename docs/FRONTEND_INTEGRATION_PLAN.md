# Frontend-Backend Integration Plan

## 1. Project Overview

- **Backend**: .NET 9 + LanguageExt (Functional Programming)
- **Frontend**: Next.js 15 + TypeScript
- **Architecture**: E-commerce platform with Buyer/Seller roles
- **Development URLs**: 
  - Backend: https://localhost:7063 (HTTPS), http://localhost:5295 (HTTP)
  - Frontend: http://localhost:3000
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT with refresh tokens, role-based access

## 2. Library Stack Decisions

### Phase 1: Core Infrastructure

- **HTTP Client**: Axios
  - Excellent TypeScript support
  - Built-in interceptors for auth/error handling
  - Request/response transformers
  - Timeout and retry logic

- **Type Generation**: OpenAPI TypeScript
  - Generate types from backend OpenAPI spec
  - 100% type safety matching backend DTOs
  - Auto-updates when backend changes

- **Error Handling**: Effect-TS
  - Railway-oriented programming matching backend's `Fin<T>`
  - Structured error handling for `ServiceError`
  - Functional composition aligning with LanguageExt
  - **Note**: Effect-TS is officially fp-ts v3 (fp-ts merger completed)

- **Validation**: Valibot
  - 10x smaller bundle than Zod
  - Better TypeScript inference
  - Modular design matching structured backend
  - Easy to mirror FluentValidation rules

- **State Management**: Jotai + TanStack Query
  - Jotai for auth state (atomic, functional composition)
  - TanStack Query for server state (API caching, loading states)
  - Better functional composition than Zustand

- **Forms**: React Hook Form + Valibot
  - Excellent performance (uncontrolled components)
  - Built-in validation integration
  - Perfect for login/register forms

- **Notifications**: React Hot Toast
  - Beautiful toast notifications
  - API success/error feedback
  - Lightweight and customizable

- **Environment**: T3 Env
  - Type-safe environment variable access
  - Runtime validation
  - Build-time validation

- **Date Handling**: date-fns
  - Tree-shakeable (smaller bundle)
  - TypeScript native
  - Perfect for order dates, timestamps

### Alternative Libraries Considered

- **Effect-TS vs fp-ts**: Chose Effect-TS due to official merger (Effect is fp-ts v3)
- **Valibot vs Zod**: Chose Valibot for size/performance (10x smaller)
- **Jotai vs Zustand**: Chose Jotai for better functional composition
- **Axios vs Ky vs Fetch**: Chose Axios for mature TypeScript support

## 3. Implementation Phases

### Phase 1: Foundation (High Priority)

1. ✅ Set up HTTP client configuration in frontend
2. ✅ Configure API base URL and environment variables
3. ✅ Create API service layer with TypeScript interfaces
4. ✅ Implement authentication state management
5. ⏳ Create auth interceptors for JWT token handling
6. ⏳ Set up error handling and response types
7. ⏳ Create Effect-TS API client wrapper

### Phase 2: API Integration (Medium Priority)

8. ⏳ Implement authentication API integration
9. ⏳ Create product browsing API integration
10. ⏳ Create product management API integration (seller)
11. ⏳ Create cart API integration
12. ⏳ Create order API integration
13. ⏳ Implement file upload API integration
14. ⏳ Create role-based API access patterns

### Phase 3: User Features & Production (Low-Medium Priority)

15. ⏳ Create user profile management APIs
16. ⏳ Create user address management APIs
17. ⏳ Create seller profile management APIs
18. ⏳ Implement user preferences and settings
19. ⏳ Create seller onboarding flow
20. ⏳ Update backend CORS for production URLs
21. ⏳ Create deployment configuration
22. ⏳ Test API connectivity end-to-end

## 4. Backend API Analysis

### Authentication Endpoints
```
POST /api/v1/auth/register        - User registration
POST /api/v1/auth/login           - Login with JWT response
POST /api/v1/auth/verify-email    - Email verification
```

### Product Endpoints (40+ endpoints)

**Public Endpoints (No Auth Required):**
```
GET  /api/v1/products                    - Paginated product listing
GET  /api/v1/products/{id}               - Product details
GET  /api/v1/products/search             - Product search
GET  /api/v1/products/featured           - Featured products
GET  /api/v1/products/{id}/related       - Related products
GET  /api/v1/products/top-selling        - Popular products
GET  /api/v1/products/seller/{id}        - Seller's products (public)
GET  /api/v1/products/{id}/stock-check   - Stock validation
```

**Seller Endpoints (Auth + Seller Role Required):**
```
POST   /api/v1/products                  - Create product
PUT    /api/v1/products/{id}             - Update product
DELETE /api/v1/products/{id}             - Delete product
GET    /api/v1/products/my-products      - Seller's own products
GET    /api/v1/products/my-products/{id} - Seller's specific product
PUT    /api/v1/products/{id}/stock       - Update stock
PUT    /api/v1/products/{id}/stock/atomic - Atomic stock decrement
POST   /api/v1/products/stock/bulk-restore - Bulk stock restore
GET    /api/v1/products/analytics        - Seller analytics
```

**Image Management (Seller Role):**
```
POST   /api/v1/products/upload-url      - Generate pre-signed URL
POST   /api/v1/products/{id}/images     - Add product images
DELETE /api/v1/products/{id}/images     - Remove product image
POST   /api/v1/products/confirm-upload  - Confirm upload
```

### Cart Endpoints (Authenticated)
```
POST   /api/v1/cart/items               - Add to cart
GET    /api/v1/cart                     - Get cart summary
GET    /api/v1/cart/items/{id}          - Get cart item
PUT    /api/v1/cart/items/{id}          - Update cart item
DELETE /api/v1/cart/items/{id}          - Remove cart item
DELETE /api/v1/cart/products/{id}       - Remove by product ID
DELETE /api/v1/cart                     - Clear cart
GET    /api/v1/cart/checkout-summary    - Checkout preparation
```

### Order Endpoints (Authenticated)
```
POST /api/v1/orders                     - Create order
POST /api/v1/orders/from-cart           - Order from cart
GET  /api/v1/orders                     - Get user's orders
GET  /api/v1/orders/{id}                - Order details
GET  /api/v1/orders/stats               - Order statistics
GET  /api/v1/orders/search              - Search orders
POST /api/v1/orders/{id}/cancel         - Cancel order
GET  /api/v1/orders/{id}/can-cancel     - Check if cancellable
GET  /api/v1/orders/{id}/items          - Order items (seller view)
GET  /api/v1/orders/items/{id}          - Specific order item
PUT  /api/v1/orders/items/{id}/status   - Update item status
POST /api/v1/orders/items/{id}/cancel   - Cancel order item
```

### User Management Endpoints
```
GET    /api/v1/user/profile             - Get user profile
PUT    /api/v1/user/profile             - Update profile
POST   /api/v1/user/profile/complete    - Complete profile (first-time)
GET    /api/v1/user/summary             - User summary
PUT    /api/v1/user/preferences         - Update preferences
POST   /api/v1/user/deactivate          - Deactivate account

GET    /api/v1/user/address             - Get user address
POST   /api/v1/user/address             - Create address
PUT    /api/v1/user/address             - Update address
DELETE /api/v1/user/address             - Delete address
```

### Seller Management Endpoints
```
POST   /api/v1/sellers/profile                    - Create seller profile
GET    /api/v1/sellers/profile                    - Get own seller profile
PUT    /api/v1/sellers/profile                    - Update seller profile
DELETE /api/v1/sellers/profile                    - Delete seller profile
GET    /api/v1/sellers/profile/exists             - Check if user is seller
GET    /api/v1/sellers/{id}                       - Get seller by ID (public)
GET    /api/v1/sellers/business-name-available/{name} - Check business name availability
```

## 5. Error Handling Architecture

### Backend ServiceError Structure
```csharp
public record ServiceError {
    public string ErrorCode { get; }      // e.g., "EMAIL_NOT_VERIFIED"
    public string Message { get; }        // Human-readable message
    public int StatusCode { get; }        // HTTP status code
    public ServiceCategory Category { get; } // Error categorization
}

public enum ServiceCategory {
    General, Authentication, Token, Password, 
    Database, Validation, Product, Image
}
```

### Backend ServiceSuccess Structure
```csharp
public record ServiceSuccess<T> {
    public T? Data { get; }
    public string Message { get; }
    public int StatusCode { get; }
}
```

### Frontend Effect-TS Integration
```typescript
// API responses follow this pattern
Effect<ServiceSuccess<T>, ServiceError>

// Example usage
const login = (credentials: LoginRequest) =>
  Effect.gen(function* () {
    const response = yield* apiClient.post('/auth/login', credentials);
    yield* updateAuthStore(response.data);
    return response.data;
  });
```

### Error Code Examples
- `EMAIL_NOT_VERIFIED` - User needs to verify email
- `TOKEN_EXPIRED` - JWT token has expired
- `INSUFFICIENT_STOCK` - Product stock unavailable
- `UNAUTHORIZED_ACCESS` - Missing or invalid authentication
- `PERMISSION_DENIED` - User lacks required role

## 6. Setup Requirements

### Backend Environment
- ✅ appsettings.Development.json with real values
- ✅ Database migrations completed (zero data)
- ⏳ Swagger UI configuration needed
- ⏳ CORS configuration for frontend URL

### Frontend Environment
```env
NEXT_PUBLIC_API_URL=https://localhost:7063/api/v1
NEXT_PUBLIC_API_VERSION=1.0
NODE_ENV=development
```

### Required Installations
```bash
# Frontend dependencies
npm install @effect/core @effect/platform axios
npm install @tanstack/react-query jotai
npm install valibot react-hook-form
npm install react-hot-toast @t3-oss/env-nextjs
npm install openapi-typescript

# Dev dependencies
npm install @tanstack/react-query-devtools
```

## 7. Development Workflow

### Backend Development
- Run with: `dotnet run`
- Access at: https://localhost:7063
- Hot reload: Automatic on file changes
- Database: SQLite (user.db)

### Frontend Development
- Run with: `npm run dev`
- Access at: http://localhost:3000
- Hot reload: Automatic with Turbopack
- Type generation: Manual trigger or on backend changes

### Concurrent Development
- **Separate terminals** for backend/frontend
- **Proxy configuration** to avoid CORS issues
- **Auto-type generation** on backend API changes
- **Swagger UI** for interactive API testing

## 8. Key Architectural Patterns

### Functional Programming Alignment
```typescript
// Backend pattern (C# with LanguageExt)
Task<Fin<User>> GetUserAsync(Guid id)

// Frontend pattern (TypeScript with Effect-TS)
Effect<User, ServiceError> = getUser(id)
```

### Role-Based Access Control
```typescript
// Role-aware API calls
const sellerOnlyApi = requireRole('Seller')(apiCall);
const authenticatedApi = requireAuth(apiCall);

// Component access control
const SellerDashboard = requireRole('Seller')(DashboardComponent);
```

### State Management Structure
```typescript
// Jotai atoms for client state
const userProfileAtom = atom<UserProfile | null>(null);
const authTokenAtom = atom<string | null>(null);
const sellerProfileAtom = atom<SellerProfile | null>(null);

// TanStack Query for server state
const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: () => Effect.runPromise(getProducts())
});
```

## 9. Next Steps

### Immediate Priority
1. ⏳ Configure Swagger UI for backend API testing
2. ⏳ Set up OpenAPI type generation pipeline
3. ⏳ Install frontend dependencies
4. ⏳ Implement Phase 1 foundation

### Progressive Implementation
1. **Week 1**: Phase 1 - Core infrastructure and auth
2. **Week 2**: Phase 2A - Product and cart APIs
3. **Week 3**: Phase 2B - Order and seller APIs
4. **Week 4**: Phase 3 - User features and production setup

### Success Metrics
- **Type Safety**: 100% TypeScript coverage with backend DTO matching
- **Error Handling**: Graceful handling of all ServiceError categories
- **Performance**: Optimized with TanStack Query caching
- **User Experience**: Smooth authentication and role transitions
- **Production Ready**: CORS, environment configs, deployment ready

## 10. Notes and Decisions

### Why Effect-TS over fp-ts
- Official merger: Effect-TS is now fp-ts v3
- Better TypeScript integration
- Modern runtime with performance optimizations
- Perfect alignment with LanguageExt patterns

### Why Valibot over Zod
- 10x smaller bundle size
- Better TypeScript inference
- Modular design matching backend structure
- Easier to mirror FluentValidation rules

### Why Jotai + TanStack Query
- Jotai: Atomic state management, functional composition
- TanStack Query: Server state with caching, perfect for API responses
- Better separation of concerns than single state library

---

**Last Updated**: January 2025  
**Status**: Planning Complete, Ready for Implementation