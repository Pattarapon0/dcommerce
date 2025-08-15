# Seller System Frontend Implementation Plan

## Project Status
- **Backend**: COMPLETE (All APIs implemented)
- **Frontend**: Phase 1 COMPLETE, Phase 2+ pending
- **Target**: Complete seller system frontend integration

---

## Development Approach

**Sequential Page Development:**
UI Components → API Integration → State Management → Page Assembly → Testing → Next Page

---

## Feature Implementation Roadmap

### Phase 1: Core Seller Registration
**Page: `/become-seller`**

#### Implementation Steps:
1. **UI Components**
   - [x] BecomeSellerForm Component
   - [x] BusinessName input field  
   - [x] BusinessDescription textarea
   - [x] Submit button with loading state
   - [x] Form validation error display
   - [x] Success state handling
   - [x] Avatar upload component with image validation

2. **API Integration**
   - [x] `POST /sellers/profile` integration
   - [x] Error handling for validation/conflicts
   - [x] Response data typing
   - [x] Avatar upload with presigned URLs

3. **State Management**
   - [x] Form state with React Hook Form
   - [x] Image validation and compression
   - [x] Error handling with toast notifications
   - [ ] `sellerProfileAtom` - Query for seller profile
   - [ ] `createSellerProfileMutationAtom` - Profile creation
   - [ ] `isSellerAtom` - Derived from profile existence

4. **Page Assembly**
   - [x] `/become-seller/page.tsx`
   - [x] Hero section layout
   - [x] BecomeSellerForm integration
   - [ ] Route protection (redirect if already seller)
   - [ ] Success redirect to `/seller/dashboard`
   - [x] Mobile-responsive design

**Completion Criteria:**
- [x] User can create seller profile
- [x] Form validation works
- [x] Success/error states display
- [x] Avatar upload with validation works
- [ ] Redirects work properly
- [x] Mobile responsive

---

### Phase 2: Seller Dashboard
**Page: `/seller/dashboard`**

#### Implementation Steps:
1. **UI Components**
   - [ ] AnalyticsCards Component (revenue, sales, products, stock)
   - [ ] QuickActions Component (navigation buttons)

2. **API Integration**
   - [ ] `GET /products/analytics` integration
   - [ ] Response mapping to UI data format

3. **State Management**
   - [ ] `sellerAnalyticsAtom` - Query for dashboard stats
   - [ ] Loading/error states handling

4. **Page Assembly**
   - [ ] `/seller/dashboard/page.tsx`
   - [ ] Dashboard layout with cards grid
   - [ ] AnalyticsCards + QuickActions integration
   - [ ] Seller route protection wrapper
   - [ ] Loading skeleton states

**Completion Criteria:**
- [ ] Analytics display real data
- [ ] Navigation buttons work
- [ ] Loading states smooth
- [ ] Only sellers can access

---

### Phase 3: Product Management Core
**Page: `/seller/products`**

#### Implementation Steps:
1. **UI Components**
   - [ ] ProductsTable Component (Name, Price, Stock, Status, Actions)
   - [ ] ProductRow Component
   - [ ] ProductStatusBadge Component
   - [ ] Pagination controls

2. **API Integration**
   - [ ] `GET /products/my-products` with pagination
   - [ ] `PUT /products/{id}/toggle-status` for status toggle
   - [ ] `DELETE /products/{id}` for deletion

3. **State Management**
   - [ ] `sellerProductsAtom` - Paginated products query
   - [ ] `toggleProductStatusMutationAtom` - Status toggle
   - [ ] `deleteProductMutationAtom` - Product deletion

4. **Page Assembly**
   - [ ] `/seller/products/page.tsx`
   - [ ] ProductsTable integration
   - [ ] "Add Product" button navigation
   - [ ] Search/filter functionality
   - [ ] Seller route protection

**Completion Criteria:**
- [ ] Products list displays with pagination
- [ ] Status toggle works instantly
- [ ] Edit/delete actions functional
- [ ] Search/filter responsive

---

### Phase 4: Product Creation
**Page: `/seller/products/new`**

#### Implementation Steps:
1. **UI Components**
   - [ ] ProductForm Component
   - [ ] Name, Description, Price, Stock inputs
   - [ ] Category selection dropdown
   - [ ] Form validation display
   - [ ] Submit/Cancel buttons

2. **API Integration**
   - [ ] `POST /products` integration
   - [ ] Form data validation
   - [ ] Success/error handling

3. **State Management**
   - [ ] `createProductMutationAtom` - Product creation
   - [ ] Form state management
   - [ ] Optimistic updates for products list

4. **Page Assembly**
   - [ ] `/seller/products/new/page.tsx`
   - [ ] ProductForm integration
   - [ ] Breadcrumb navigation
   - [ ] Success redirect to `/seller/products`
   - [ ] Cancel button back navigation

**Completion Criteria:**
- [ ] Product creation works end-to-end
- [ ] Form validation comprehensive
- [ ] Success redirect smooth
- [ ] Data appears in products list

---

### Phase 5: Product Editing
**Page: `/seller/products/[id]/edit`**

#### Implementation Steps:
1. **UI Components**
   - [ ] Enhanced ProductForm Component
   - [ ] Pre-fill with existing product data
   - [ ] Status toggle integration
   - [ ] Delete product option

2. **API Integration**
   - [ ] `PUT /products/{id}` integration
   - [ ] Pre-fetch product data for form

3. **State Management**
   - [ ] `updateProductMutationAtom` - Product updates
   - [ ] `productByIdAtom` - Individual product query

4. **Page Assembly**
   - [ ] `/seller/products/[id]/edit/page.tsx`
   - [ ] Pre-filled ProductForm
   - [ ] Update/Delete actions
   - [ ] Loading state while fetching product

**Completion Criteria:**
- [ ] Product editing works completely
- [ ] Form pre-fills with current data
- [ ] Updates reflect immediately
- [ ] Delete confirmation works

---

### Phase 6: Order Management
**Page: `/seller/orders`**

#### Implementation Steps:
1. **UI Components**
   - [ ] OrdersTable Component (Order#, Date, Customer, Total, Status)
   - [ ] OrderRow Component
   - [ ] OrderStatusBadge Component
   - [ ] Pagination controls
   - [ ] Status filter dropdown

2. **API Integration**
   - [ ] `GET /orders/my-orders` with pagination/filters
   - [ ] Order status updates (if available)

3. **State Management**
   - [ ] `sellerOrdersAtom` - Paginated orders query
   - [ ] Filter/search state management

4. **Page Assembly**
   - [ ] `/seller/orders/page.tsx`
   - [ ] OrdersTable integration
   - [ ] Filter controls
   - [ ] Export functionality (future)

**Completion Criteria:**
- [ ] Orders display with pagination
- [ ] Filtering works smoothly
- [ ] Status updates functional
- [ ] Order details accessible

---

## Technical Requirements

### API Endpoints Available
```
POST /sellers/profile                    - Create seller profile ✓ IMPLEMENTED
POST /sellers/profile/avatar/upload-url - Get presigned URL ✓ IMPLEMENTED
GET /sellers/profile                     - Get seller profile
PUT /sellers/profile                     - Update seller profile
GET /sellers/profile/exists              - Check seller status
GET /products/my-products                - Get seller products
POST /products                           - Create product
PUT /products/{id}                       - Update product
DELETE /products/{id}                    - Delete product
PUT /products/{id}/toggle-status         - Toggle product status
GET /products/analytics                  - Seller analytics
GET /orders/my-orders                    - Seller orders
```

### State Management Pattern
- Jotai atoms for data fetching and mutations
- Query atoms for data retrieval
- Mutation atoms for write operations
- Derived atoms for computed state

### Component Architecture
- Reusable UI components in `/components/seller/`
- Page components in `/app/seller/`
- Form validation using existing patterns
- Mobile-responsive design

### Route Protection
- Seller-only route guards
- Authentication requirement
- Redirect logic for non-sellers

### File Structure Pattern
```
frontend/src/
├── components/seller/[feature]/ComponentName.tsx ✓ IMPLEMENTED
├── app/seller/[page]/page.tsx                    ✓ PARTIAL (become-seller only)
├── lib/atoms/sellerAtoms.ts                      ❌ NOT IMPLEMENTED
├── lib/api/seller.ts                             ✓ IMPLEMENTED (partial)
└── lib/validation/sellerProfile.ts               ✓ IMPLEMENTED
```

### Implemented Components:
- ✅ BecomeSellerPageContent.tsx
- ✅ BusinessInfoForm.tsx 
- ✅ BusinessNameField.tsx
- ✅ BusinessDescriptionField.tsx
- ✅ SellerAvatarSection.tsx
- ✅ SellerFormActions.tsx
- ✅ SellerCard.tsx

### Implemented API Functions:
- ✅ createSellerProfile()
- ✅ getPresignedUrl()

### Implemented Validation:
- ✅ sellerProfileSchema (Valibot)
- ✅ ImageValidator with seller profile preset
- ✅ File type and size validation
- ✅ Image compression utilities

---

## Development Guidelines

- Follow existing UI patterns from profile pages
- Use existing components from `/components/ui`
- Test each step before moving to next
- Mobile-first responsive design
- Copy validation patterns from existing forms
- Consistent error handling and user feedback
- Performance optimization for data loading

---

## Progress Tracking

### Completed Phases:
- [x] Phase 1: Core Seller Registration (MOSTLY COMPLETE - needs redirects)
- [ ] Phase 2: Seller Dashboard
- [ ] Phase 3: Product Management Core
- [ ] Phase 4: Product Creation
- [ ] Phase 5: Product Editing
- [ ] Phase 6: Order Management

### Current Work:
- **Phase**: Phase 1 (Seller Registration) - Final touches
- **Step**: Route protection and success redirects
- **Component**: Redirect logic and seller state management

### Next Action:
Complete Phase 1: Add route protection and success redirect functionality, then start Phase 2: Seller Dashboard implementation

---

## Success Criteria

### Functional Requirements
- Users can become sellers through registration
- Sellers can manage products (CRUD operations)
- Analytics display real-time data
- Order management interface functional
- All forms include proper validation

### Technical Requirements
- Mobile-responsive design
- Loading states for all async operations
- Error handling and user feedback
- Consistent with existing UI patterns
- Performance optimized

### Quality Assurance
- Form validation comprehensive
- Navigation flows smooth
- Data consistency maintained
- User experience intuitive

Each phase should be completed and tested before proceeding to the next phase to ensure stable incremental progress.