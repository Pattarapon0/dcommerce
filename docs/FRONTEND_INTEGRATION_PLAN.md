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

- **Type Generation**: OpenAPI TypeScript ✅ **IMPLEMENTED**
  - Generate types from backend OpenAPI spec
  - 100% type safety matching backend DTOs
  - Auto-updates when backend changes
  - **Scripts**: `npm run types:generate`, `npm run types:watch`

- **Error Handling**: Simple TypeScript + Axios
  - Direct TypeScript interfaces matching backend ServiceError
  - Axios interceptors for automatic error handling
  - Clean error classification for toast vs form validation
  - **Note**: Using pragmatic approach over Effect-TS for simplicity

- **Validation**: Valibot
  - 10x smaller bundle than Zod
  - Better TypeScript inference
  - Modular design matching structured backend
  - Easy to mirror FluentValidation rules

- **State Management**: Hybrid Approach
  - **Forms**: React useState (simple, perfect for form state)
  - **Global State**: Jotai (auth, user profile, global UI) - *Planned*
  - **Server State**: TanStack Query (API caching, data fetching) - *Planned*
  - **Toasts**: Sonner direct function calls (no state management needed)

- **Forms**: React Hook Form + Valibot *(Planned)*
  - Excellent performance (uncontrolled components)
  - Built-in validation integration
  - **Current**: Using simple useState + Valibot for registration form

- **Notifications**: Sonner
  - Beautiful toast notifications with animations and close buttons
  - API success/error feedback
  - Lightweight and customizable
  - ✅ **COMPLETED**: Direct function calls with toast.success(), toast.error()

- **Environment**: T3 Env *(Planned)*
  - Type-safe environment variable access
  - Runtime validation
  - Build-time validation
  - **Current**: Using direct process.env access

- **Date Handling**: date-fns
  - Tree-shakeable (smaller bundle)
  - TypeScript native
  - Perfect for order dates, timestamps

### Alternative Libraries Considered

- **Simple TypeScript vs Effect-TS**: Chose simple TypeScript for pragmatic approach and faster development
- **Valibot vs Zod**: Chose Valibot for size/performance (10x smaller)
- **Hybrid State vs Single Solution**: Chose right tool for right job (useState for forms, Jotai for global, TanStack Query for server)
- **Axios vs Ky vs Fetch**: Chose Axios for mature TypeScript support
- **Sonner vs React Hot Toast**: Chose Sonner for better animations and UX

## 3. Implementation Phases

### Phase 1: Foundation (High Priority)

1. ✅ Set up HTTP client configuration in frontend
2. ✅ Configure API base URL and environment variables
3. ✅ Create API service layer with TypeScript interfaces
4. ✅ Set up OpenAPI type generation with scripts
5. ✅ Create auth interceptors for JWT token handling
6. ✅ Set up error handling and response types with structured field validation
7. ✅ **COMPLETED**: Complete Sonner toast system with automatic error classification
8. ✅ **COMPLETED**: Implement Jotai auth state management with token persistence
9. ⏳ Set up TanStack Query for API calls

### Phase 2: API Integration (Medium Priority)

9. ✅ **COMPLETED**: Registration form with useState + Valibot validation
10. ✅ **COMPLETED**: Implement authentication API integration with Jotai atoms
11. ⏳ Create product browsing API integration with TanStack Query
12. ⏳ Create product management API integration (seller) with TanStack Query
13. ⏳ Create cart API integration with TanStack Query
14. ⏳ Create order API integration with TanStack Query
15. ⏳ Implement file upload API integration
16. ⏳ Create role-based API access patterns with Jotai
17. ✅ **COMPLETED**: Sonner toast UI system with automatic error handling

### Phase 3: User Features & Production (Low-Medium Priority)

18. ✅ **COMPLETED**: User profile management APIs with TanStack Query and Jotai state
19. ✅ **COMPLETED**: User address management APIs with TanStack Query and Jotai state  
20. ⏳ Create seller profile management APIs with TanStack Query
21. ⏳ Implement user preferences and settings with Jotai
22. ⏳ Create seller onboarding flow
23. ✅ **COMPLETED**: Type-safe form validation with useState + Valibot
24. ⏳ Add T3 Env for environment validation
25. ⏳ Update backend CORS for production URLs
26. ⏳ Create deployment configuration
27. ⏳ Test API connectivity end-to-end

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

## 5. Toast Error Handling Architecture ✅ **COMPLETED**

### Complete Sonner Toast System ✅ **PRODUCTION READY - FEBRUARY 2025**

**Implementation Status**: **PRODUCTION READY** - Simple, direct Sonner toast calls with beautiful animations and automatic error handling.

#### Current Implementation ✅ **SIMPLE & EFFECTIVE**
```typescript
import { toast } from 'sonner';

// Direct function calls - no complex state management needed
toast.success('Account created successfully!');
toast.error('Invalid email or password');
toast.warning('Session expired');
toast('Info message', { description: 'Additional details' });

// Automatic error handling via Axios interceptor
// No manual toast calls needed for API errors
```

#### Files Created
```
frontend/src/lib/
├── errors/
│   ├── errorMessages.ts      ✅ Maps 40+ backend error codes to user-friendly messages
│   ├── errorClassifier.ts    ✅ Smart classification (toast vs inline form errors)
│   └── errorHandler.ts       ✅ Central error handling with logging and side effects
├── success/
│   └── successToasts.ts      ✅ Pre-built success message utilities
├── test/
│   └── toastTester.ts        ✅ Comprehensive browser console testing suite
├── toast/
│   └── index.ts              ✅ Clean module exports
└── components/ui/
    └── sonner.tsx            ✅ Sonner wrapper component with theme support
```

#### Architecture Overview
```
API Error → Axios Interceptor → Error Classification → Sonner toast() → Beautiful UI ✅
```

#### Key Features ✅ **IMPLEMENTED**
- **Simple Function Calls**: Direct toast.success(), toast.error() calls - no complex state management
- **Automatic Error Processing**: All API errors automatically handled via Axios interceptor
- **Smart Error Classification**: Form validation errors skip toasts, business logic errors show toasts
- **Error Code Mapping**: 40+ backend error codes mapped to user-friendly messages
- **Success Toast Utilities**: Pre-built helpers like `successToasts.login()`, `successToasts.addedToCart()`
- **Beautiful UI**: Sonner provides animations, close buttons, and polish out of the box
- **Console Testing Suite**: Full browser testing available via `testToastSystem()`
- **Type-Safe Integration**: Complete TypeScript support matching backend ServiceError structure

#### Enhanced Axios Integration ✅ **IMPLEMENTED**
- Automatic error handling via interceptors
- Type-safe ServiceError interfaces from OpenAPI generation
- Smart error classification (form validation vs business logic)

#### Sonner Integration ✅ **IMPLEMENTED**
- Direct function calls: `toast.success()`, `toast.error()`, etc.
- Integrated in app layout with `<Toaster closeButton />`
- Success utility functions for common scenarios
- Theme support with next-themes
- No complex state management needed

#### Error Classification Logic ✅ **IMPLEMENTED**
- Form validation errors: Skip toasts, handle inline in forms
- Business logic errors: Show toasts with appropriate styling
- Authentication errors: Show error toasts + redirect logic
- Network errors: Show error toasts with retry suggestions

#### Testing Infrastructure ✅ **IMPLEMENTED**
- Browser console testing: `testToastSystem()` for full test suite
- Individual scenario testing: `testScenarios.authError()`
- Direct toast testing: `toast.success('test')`, `toast.error('test')`
- Success toast testing: `successToasts.login('John')`

### Backend ServiceError Structure ✅ **IMPLEMENTED**
- **ErrorCode**: Machine-readable error code (e.g., "EMAIL_NOT_VERIFIED")
- **Message**: Human-readable error message
- **StatusCode**: HTTP status code
- **Category**: Error categorization (Authentication, Validation, Product, etc.)
- **Errors**: Optional field-specific validation errors (Dictionary<string, string[]>)
- **HasFieldErrors**: Boolean flag indicating presence of field validation errors

### Backend ServiceSuccess Structure ✅ **IMPLEMENTED**
- **Data**: Generic typed response data
- **Message**: Success message
- **StatusCode**: HTTP status code (200, 201, etc.)

### Error Response Examples ✅ **DOCUMENTED**

**Validation Errors (Structured Field Validation):**
- ErrorCode: "VALIDATION_FAILED"
- Category: "Validation"
- Errors: Object with field names and error arrays

**Authentication Errors with Field Context:**
- ErrorCode: "EMAIL_ALREADY_EXISTS"
- Category: "Authentication"
- Errors: Specific field errors (e.g., email field)

**Business Logic Errors:**
- ErrorCode: "INSUFFICIENT_STOCK"
- Category: "Product"
- No field errors (general business rule violation)

**System Errors:**
- ErrorCode: "TOKEN_EXPIRED"
- Category: "Token"
- No field errors (authentication/system level)

### Frontend TypeScript Integration ✅ **IMPLEMENTED**
- **Type Generation**: Using OpenAPI TypeScript with `npm run types:generate`
- **ServiceError Type**: Generated from backend schema automatically
- **API Client**: Axios with TypeScript interfaces and automatic error handling
- **Form Integration**: useState + Valibot for form state and validation
- **Error Mapping**: Backend field errors mapped to frontend form state
- **Toast Integration**: Automatic error toasts via Axios interceptors

### Enhanced Error Code Examples ✅ **MAPPED TO USER-FRIENDLY MESSAGES**
- `VALIDATION_FAILED` - Form validation failed (with field details) → *"Please check the highlighted fields"*
- `EMAIL_ALREADY_EXISTS` - Email registration conflict → *"An account with this email already exists"*
- `INVALID_CREDENTIALS` - Login failed → *"Invalid email or password"*
- `EMAIL_NOT_VERIFIED` - User needs to verify email → *"Please verify your email before logging in"*
- `TOKEN_EXPIRED` - JWT token has expired → *"Your session has expired. Please log in again"*
- `INSUFFICIENT_STOCK` - Product stock unavailable → *"Sorry, this item is out of stock"*
- `UNAUTHORIZED_ACCESS` - Missing authentication → *"Please log in to continue"*
- `PERMISSION_DENIED` - User lacks required role → *"You don't have permission to access this feature"*

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

### ✅ Sonner Toast Dependencies (February 2025)
Complete toast UI system implemented with **Sonner** + **next-themes**:
- **Sonner**: Modern toast library with beautiful animations and close buttons
- **next-themes**: Theme support for light/dark mode integration
- **Enhanced Axios interceptors** for automatic error handling
- **Custom wrapper component** optimized for our ServiceError structure

**Required installations:**
```bash
npm install sonner next-themes
```

### Required Installations ✅ **UPDATED FOR ACTUAL STACK**
```bash
# Core dependencies (already installed)
npm install axios valibot sonner next-themes

# OpenAPI type generation (already installed)
npm install -D openapi-typescript

# Planned additions for full stack
npm install @tanstack/react-query jotai
npm install @t3-oss/env-nextjs

# Dev dependencies
npm install -D @tanstack/react-query-devtools

# Optional for React Hook Form approach
npm install react-hook-form @hookform/resolvers
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

## 8. Key Architectural Patterns

### State Management Strategy ✅ **HYBRID APPROACH**
- **Forms**: `useState` for local component state (simple, effective)
- **Global Auth**: Jotai atoms for authentication state (planned)
- **Server Data**: TanStack Query for API calls and caching (planned)  
- **Toasts**: Direct Sonner function calls (no state management needed)

### Role-Based Access Control 📋 **PLANNED**
- Jotai atoms for user role and authentication state
- HOCs for route protection (`withAuth`, `withSellerRole`)
- Dynamic navigation based on user role
- Component-level access control

### Error Handling Strategy ✅ **IMPLEMENTED**
- **API Errors**: Automatic toast display via Axios interceptors
- **Form Validation**: Inline error display, no toasts
- **Error Classification**: Smart routing of errors to appropriate UI
- **Type Safety**: OpenAPI-generated types for all error structures

### State Management Structure ✅ **IMPLEMENTED**
- **Authentication Atoms**: `accessTokenAtom`, `refreshTokenAtom`, `userBasicAtom`, `userProfileAtom`
- **Computed State**: `isAuthenticatedAtom` derived from token presence
- **Navigation State**: Dynamic auth section with reactive user display
- **Persistence**: Local storage integration with `atomWithStorage`
- **API Integration**: Direct atom mutations with proper state sync
- **Token Management**: Automatic cleanup on logout

## 9. Auth State Implementation with Jotai ✅ **PRODUCTION READY**

### Authentication State Implementation
- **Token Management**: Separate atoms for access and refresh tokens with localStorage persistence
- **User Profile**: Centralized user data with reactive profile fetching
- **Computed State**: Derived atoms for authentication checks
- **Persistence**: Automatic local storage sync with proper hydration handling
- **State Sync**: Component-level atom setters properly update global state

### Navigation Integration
- **Dynamic Auth Section**: Client-side rendered auth component preventing hydration issues
- **User Profile Display**: Reactive navbar updates when user logs in
- **Logout Handling**: Complete state cleanup and token removal

### Token Management
- **JWT Standard Claims**: Backend generates standard "sub", "role", "email" claims
- **Frontend Token Storage**: Proper atomWithStorage configuration
- **State Synchronization**: Login mutations update atoms correctly

## 10. Current Progress Status ✅ **FEBRUARY 2025 UPDATE**

### ✅ COMPLETED Features

#### 1. Complete Registration System ✅ **PRODUCTION READY**
- **Type-Safe Registration Form**: Complete form with all required fields
- **Valibot Validation**: Schema matching backend FluentValidation exactly  
- **Enhanced Country Selector**: Popover-based dropdown with flags and search
- **Cross-field Validation**: Password confirmation matching
- **Error State Management**: Type-safe error handling and display
- **Backend Integration Ready**: Form data structure matches RegisterRequest exactly

#### 2. Complete Toast System ✅ **PRODUCTION READY**  
- **Sonner Integration**: Beautiful toast UI with animations and close buttons
- **Automatic Error Processing**: Enhanced Axios interceptor handles all API errors
- **Smart Error Classification**: Validation errors skip toasts, business logic errors show toasts
- **40+ Error Code Mapping**: All backend error codes mapped to user-friendly messages
- **Success Toast Utilities**: Pre-built helpers for common success scenarios
- **Theme Support**: Light/dark mode integration with next-themes
- **Comprehensive Testing**: Full browser console test suite

#### 3. Complete API Infrastructure ✅ **PRODUCTION READY**
- **Axios Configuration**: Base URL, interceptors, error handling
- **Environment Variables**: Type-safe environment configuration
- **Error Response Types**: TypeScript interfaces matching backend ServiceError
- **Success Response Types**: TypeScript interfaces matching backend ServiceSuccess

#### 4. Backend Language Preference Removal ✅ **COMPLETED**
- **User Entity Updated**: Language preference field removed from user profile
- **DTOs Updated**: All user-related DTOs cleaned up
- **Validation Updated**: Validators no longer include language preference
- **Migration Created**: Database schema updated to remove language column
- **Frontend Simplified**: Registration form no longer includes language selector

#### 5. Complete JWT Authentication System ✅ **PRODUCTION READY**
- **Backend JWT Token Fix**: Standard JWT claims generation ("sub", "role", "email")
- **Frontend Auth State**: Complete Jotai-based authentication state management
- **Token Persistence**: Automatic localStorage sync with atomWithStorage
- **Profile Integration**: Reactive profile fetching on authentication state changes
- **Navbar Integration**: Dynamic auth section with user profile display
- **Login Flow**: Complete login → token storage → profile fetch → UI update
- **Logout Functionality**: Complete state cleanup and token removal

#### 6. Auth State Management ✅ **PRODUCTION READY**
- **Authentication Atoms**: `accessTokenAtom`, `refreshTokenAtom` with localStorage persistence
- **User Profile Atoms**: `userBasicAtom`, `userProfileAtom` with reactive fetching
- **Computed State**: `isAuthenticatedAtom` derived from token presence
- **Automatic Sync**: Token mutations properly update component-level atoms
- **Hydration Safe**: Proper atom storage configuration for SSR compatibility

#### 7. Profile Page System ✅ **PRODUCTION READY - AUGUST 2025**
- **Component Architecture**: Modular profile page with PersonalInfoSection and AddressSection
- **Independent State Management**: Separate draft atoms for profile and address data  
- **Draft State Handling**: Local draft storage with 5-minute expiration for UX
- **404 Address Handling**: Graceful handling for users without addresses
- **Auto-detect CREATE vs UPDATE**: Smart mutation logic for seamless address management
- **Currency Fix**: Resolved type casting issues for proper currency dropdown display

#### 8. Database Entity Consistency ✅ **PRODUCTION READY - AUGUST 2025**
- **UserAddress Entity Fix**: Added missing `builder.Ignore(a => a.Id)` for consistency
- **1:1 Relationship Pattern**: All User entities (Profile, SellerProfile, Address) use same pattern
- **Database Migration**: Applied `IgnoreUserAddressIdField` migration to drop unused Id column
- **Frontend Query Optimization**: Simplified userAddress query keys without userId dependency
- **Architecture Consistency**: UserId as primary key for all 1:1 User relationships

### ⏳ IN PROGRESS Features

#### 1. Advanced User Features ⏳ **CURRENT FOCUS**
- **Profile Management**: Complete user profile and address management system
- **Seller Features**: Seller profile creation and product management dashboard
- **User Dashboard**: Order history, preferences, and account settings
- **Role-based Navigation**: Dynamic UI based on user roles and permissions

### 📋 PLANNED Features

#### 1. Auth State Management (High Priority)
- **Jotai Atoms**: Token, user profile, role-based state atoms
- **Automatic Persistence**: Local storage integration with atomWithStorage
- **Token Refresh**: Automatic token refresh on expiration
- **Route Protection**: HOCs for protected routes and role-based access

#### 2. API Integration (Medium Priority)
- **Authentication APIs**: Login, logout, token refresh
- **Product APIs**: Browse, search, manage (seller)
- **Cart APIs**: Add, update, remove items
- **Order APIs**: Create, view, track orders
- **User Profile APIs**: View, update profile and addresses

#### 3. Product Features (Medium Priority)
- **Product Listing**: Paginated product browsing
- **Product Search**: Search and filtering
- **Product Details**: Detailed product view
- **Seller Management**: Product CRUD for sellers

#### 4. User Features (Lower Priority)
- **Profile Management**: User profile editing
- **Address Management**: Shipping addresses
- **Order History**: View past orders
- **Seller Dashboard**: Analytics and management

## 11. Next Steps ✅ **UPDATED ROADMAP**

### Immediate Priority (Next 1-2 Days)
1. ✅ **COMPLETED**: Registration form with type-safe validation
2. ✅ **COMPLETED**: Complete toast system with Sonner
3. ✅ **COMPLETED**: Complete JWT authentication system with Jotai
4. ✅ **COMPLETED**: Navbar integration with auth state and user profile
5. ✅ **COMPLETED**: Profile page with modular components and draft state management
6. ✅ **COMPLETED**: UserAddress entity consistency and database migration

### Short Term (Next 1-2 Weeks)
1. ✅ **COMPLETED**: Authentication Flow - Complete login/logout with token management
2. ✅ **COMPLETED**: Profile Management - Complete user profile and address management system
3. ✅ **COMPLETED**: Database Consistency - Fixed UserAddress entity and applied migration
4. ⏳ **NEXT**: Product Browsing - Basic product listing and details pages
5. ⏳ **NEXT**: Seller Features - Product management dashboard and seller profiles
6. ⏳ **NEXT**: Cart System - Shopping cart functionality with API integration

### Medium Term (Next 2-4 Weeks)  
1. **Cart System**: Shopping cart functionality
2. **Order System**: Order creation and management
3. **Seller Features**: Product management for sellers
4. **User Dashboard**: Profile and order history
5. **Production Setup**: CORS, deployment configuration

### Success Metrics ✅ **SONNER TOAST SYSTEM ACHIEVEMENTS**
- **Type Safety**: 100% TypeScript coverage with backend DTO matching
- **Error Handling**: ✅ **PRODUCTION READY** - Complete Sonner toast system with smart error classification
- **User Experience**: ✅ **SIGNIFICANTLY IMPROVED** - Beautiful animations, close buttons, automatic error/success feedback with 40+ mapped messages
- **UI Components**: ✅ **MODERN & POLISHED** - Sonner integration with theme support and accessibility
- **Testing Infrastructure**: ✅ **COMPREHENSIVE** - Full browser console testing suite with direct Sonner functions
- **Performance**: Optimized with TanStack Query caching
- **Production Ready**: CORS, environment configs, deployment ready

## 12. Notes and Decisions ✅ **ARCHITECTURE DECISIONS**

### Implementation Approach: Pragmatic Over Complex
- **Simple First**: Using useState for forms, direct toast calls
- **Add Complexity When Needed**: Jotai for global state, TanStack Query for server state
- **Type Safety**: OpenAPI generation for 100% backend type matching
- **Right Tool for Right Job**: Hybrid approach instead of forcing one solution

### Library Decisions Rationale
- **Sonner vs React Hot Toast**: Better animations, UX, and developer experience
- **Simple TypeScript vs Effect-TS**: Faster development, easier maintenance
- **useState vs React Hook Form**: Perfect for current simple forms
- **Valibot vs Zod**: 10x smaller bundle, better performance
- **Hybrid State vs Single Solution**: Optimal for different use cases

### Toast System Design
- **No State Management**: Direct function calls work perfectly
- **Smart Error Classification**: Automatic routing of errors to appropriate UI
- **Type-Safe Integration**: Complete backend ServiceError compatibility
- **Development Friendly**: Comprehensive console testing utilities

### Current Status
- ✅ **Production Ready**: Registration form, toast system, error handling
- 📋 **Next Phase**: Login page, auth state with Jotai, navbar integration
- 🔧 **Planned**: TanStack Query for API calls, role-based access control

## 13. Registration Form Implementation ✅ **COMPLETED - FEBRUARY 2025**

### Implementation Status: ✅ **PRODUCTION READY**
- **Form Fields**: All required fields with proper validation
- **State Management**: Simple useState approach with type safety
- **Validation**: Valibot schema matching backend FluentValidation
- **Error Handling**: Type-safe error display with backend integration
- **Country Selector**: Enhanced popover UI with search and flags
- **API Integration**: Ready for backend connection

### Key Implementation Features
- **Type-Safe Validation**: Generic field validation with compile-time checking
- **Cross-field Validation**: Password confirmation matching
- **Real-time Validation**: Individual field validation on blur
- **Backend Error Mapping**: ServiceError.Errors mapped to form fields
- **Enhanced UI Components**: Country selector with improved UX

---

**Last Updated**: August 6, 2025  
**Status**: ✅ **Profile Management System + Database Consistency COMPLETED** - Complete modular profile page with independent state management, UserAddress entity consistency fixes, and production-ready database migration