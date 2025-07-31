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
5. ✅ Create auth interceptors for JWT token handling
6. ✅ Set up error handling and response types (**ENHANCED with structured field validation**)
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

## 5. Error Handling Architecture ✅ **ENHANCED**

### Backend ServiceError Structure ✅ **UPDATED**
```csharp
public record ServiceError {
    public string ErrorCode { get; }      // e.g., "EMAIL_NOT_VERIFIED"
    public string Message { get; }        // Human-readable message
    public int StatusCode { get; }        // HTTP status code
    public ServiceCategory Category { get; } // Error categorization
    
    // NEW: Optional field errors for validation (null for non-validation errors)
    public Dictionary<string, string[]>? Errors { get; }
    
    // Helper properties
    public bool HasFieldErrors { get; }   // True if field validation errors present
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

### Enhanced Error Response Examples ✅ **NEW**

**Validation Errors (NEW - Structured Field Validation):**
```json
{
  "errorCode": "VALIDATION_FAILED",
  "message": "Email is required",
  "statusCode": 400,
  "category": "Validation",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters", "Password must contain uppercase, lowercase, digit, and special character"],
    "firstName": ["First name is required"]
  }
}
```

**Authentication Errors with Field Context (NEW):**
```json
{
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "message": "An account with this email already exists",
  "statusCode": 409,
  "category": "Authentication",
  "errors": {
    "email": ["This email is already registered"]
  }
}
```

**Business Logic Errors (Unchanged):**
```json
{
  "errorCode": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock available",
  "statusCode": 409,
  "category": "Product"
}
```

**System Errors (Unchanged):**
```json
{
  "errorCode": "TOKEN_EXPIRED",
  "message": "Token has expired",
  "statusCode": 401,
  "category": "Token"
}
```

### Frontend TypeScript Integration ✅ **UPDATED**
```typescript
// Enhanced ServiceError interface for frontend
interface ServiceError {
  errorCode: string;           // e.g., "EMAIL_NOT_VERIFIED"
  message: string;             // Human-readable message
  statusCode: number;          // HTTP status code
  category: string;            // Error categorization
  
  // NEW: Optional field errors for validation
  errors?: Record<string, string[]>;  // Field name -> Array of error messages
}

// API responses follow this pattern
Effect<ServiceSuccess<T>, ServiceError>

// Example usage with enhanced error handling
const login = (credentials: LoginRequest) =>
  Effect.gen(function* () {
    const response = yield* apiClient.post('/auth/login', credentials);
    yield* updateAuthStore(response.data);
    return response.data;
  });

// NEW: Enhanced error handling for forms
const handleApiError = (error: ServiceError) => {
  if (error.category === 'Validation' && error.errors) {
    // Set field-specific errors in form
    setFormErrors(error.errors);
  } else {
    // Show toast for non-validation errors
    toast.error(error.message);
  }
};

// NEW: React Hook Form integration
const { setError } = useForm();

const handleValidationError = (error: ServiceError) => {
  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      setError(field as keyof FormData, {
        type: 'server',
        message: messages[0] // Use first error message
      });
    });
  }
};
```

### Enhanced Error Code Examples ✅ **UPDATED**
- `VALIDATION_FAILED` - Form validation failed (with field details)
- `EMAIL_ALREADY_EXISTS` - Email registration conflict (with field context)
- `INVALID_CREDENTIALS` - Login failed (with field hints)
- `EMAIL_NOT_VERIFIED` - User needs to verify email
- `TOKEN_EXPIRED` - JWT token has expired
- `INSUFFICIENT_STOCK` - Product stock unavailable
- `UNAUTHORIZED_ACCESS` - Missing or invalid authentication
- `PERMISSION_DENIED` - User lacks required role

## 6. Setup Requirements

### Backend Environment ✅ **COMPLETED**
- ✅ appsettings.Development.json with real values
- ✅ Database migrations completed (zero data)
- ✅ Enhanced ServiceError with structured field validation
- ✅ FluentValidation integration for automatic error handling
- ✅ CORS configuration for frontend URL
- ⏳ Swagger UI configuration needed

### Frontend Environment ✅ **COMPLETED**
```env
NEXT_PUBLIC_API_URL=http://localhost:5295/api/v1  # ✅ Configured
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

### Enhanced Error Handling Patterns ✅ **NEW**
```typescript
// Backend pattern (C# with enhanced ServiceError)
Fin<User> RegisterUser(RegisterRequest request) 
// Returns structured field errors for validation failures

// Frontend pattern (TypeScript with enhanced error handling)
const handleRegister = async (data: RegisterFormData) => {
  const result = await Effect.runPromise(
    registerUser(data).pipe(
      Effect.tapError(error => {
        if (error.category === 'Validation' && error.errors) {
          // Set field-specific errors
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field, { message: messages[0] });
          });
        } else {
          // Show global error toast
          toast.error(error.message);
        }
      })
    )
  );
};

// Form integration with React Hook Form
const form = useForm<RegisterFormData>({
  resolver: valibotResolver(registerSchema)
});

// Error handling that matches backend validation
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await registerUser(data);
    toast.success('Registration successful!');
  } catch (error) {
    handleApiError(error); // Automatically handles field vs global errors
  }
});
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

## 9. Next Steps ✅ **UPDATED**

### Immediate Priority ✅ **PARTIALLY COMPLETED**
1. ⏳ Configure Swagger UI for backend API testing
2. ⏳ Set up OpenAPI type generation pipeline
3. ⏳ Install frontend dependencies
4. ✅ **COMPLETED**: Enhanced backend error handling with structured field validation

### Progressive Implementation
1. **Week 1**: Phase 1 - Core infrastructure and auth ✅ **ENHANCED ERROR HANDLING COMPLETED**
2. **Week 2**: Phase 2A - Product and cart APIs
3. **Week 3**: Phase 2B - Order and seller APIs  
4. **Week 4**: Phase 3 - User features and production setup

### Success Metrics ✅ **UPDATED**
- **Type Safety**: 100% TypeScript coverage with backend DTO matching
- **Error Handling**: ✅ **ENHANCED** - Graceful handling of all ServiceError categories with structured field validation
- **Performance**: Optimized with TanStack Query caching
- **User Experience**: ✅ **IMPROVED** - Smooth authentication, role transitions, and form validation
- **Production Ready**: CORS, environment configs, deployment ready

## 10. Notes and Decisions ✅ **UPDATED**

### ✅ Enhanced ServiceError Implementation (January 2025)
- **Structured Field Validation**: Added optional `errors` property for form field validation
- **Backward Compatible**: All existing error handling continues to work unchanged
- **Industry Standard**: Follows modern API error handling patterns (matches Laravel, ASP.NET Core)
- **Frontend Ready**: Perfect integration with React Hook Form and inline validation
- **FluentValidation Integration**: Automatic conversion from FluentValidation to structured errors
- **Smart Error Handling**: Validation errors get field structure, business logic errors remain simple

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

**Last Updated**: January 31, 2025  
**Status**: ✅ **Backend Error Handling Enhanced** - Ready for Frontend Implementation