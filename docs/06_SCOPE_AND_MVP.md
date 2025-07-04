# Scope and MVP Definition

## 1. Introduction

This document defines the Minimum Viable Product (MVP) scope for the Full-Stack E-Commerce Marketplace portfolio project. The MVP is designed to showcase comprehensive full-stack development skills while maintaining focus on quality implementation over feature quantity.

## 2. MVP Philosophy

The MVP emphasizes:
- **Complete Feature Cycles:** Each included feature demonstrates end-to-end full-stack implementation
- **Real-World Applicability:** Features reflect actual e-commerce business requirements
- **Technical Depth:** Showcases professional development practices and system design
- **Quality Over Quantity:** Excellent execution of core features rather than extensive feature lists

## 3. Core MVP Features

### 3.1 User Authentication & Management
**Scope:** Leverage existing sophisticated .NET backend authentication system

**Features:**
- User registration with email and password
- User login/logout with JWT authentication (HttpOnly cookies)
- Protected routes and role-based access control
- Auto-verify emails for MVP simplicity (bypass email verification)
- User profile basic information display
- Single address management per user (1-to-1 relationship)

**Technical Implementation:**
- JWT token management with refresh tokens
- Role-based authorization (Guest, Buyer, Seller)
- Secure cookie handling
- Form validation on both frontend and backend
- UserAddress entity with 1-to-1 user relationship

### 3.2 Product Catalog Management (Seller Features)
**Scope:** Full-stack product creation and management with business profiles

**Features:**
- Seller product creation form with:
  - Product name, description, price
  - Category selection from predefined categories (enum-based)
  - Multiple image URLs (image gallery support, max 5 images)
  - Stock quantity management
  - Product status (active/inactive)
- Seller product listing/management dashboard
- Edit existing products with full CRUD operations
- Basic inventory management (stock level tracking)
- Seller business profile management (business name, description)
- Public seller profile pages

**Technical Implementation:**
- Real database entities (Products table with enum categories)
- SellerProfile entity for business information
- CRUD operations with Entity Framework
- Form validation and error handling
- Responsive admin interface
- Multi-image gallery support

### 3.3 Product Browsing & Discovery (Buyer Features)
**Scope:** Complete product browsing experience with availability handling

**Features:**
- Public product catalog with pagination
- Category-based browsing (predefined categories)
- Basic search functionality across product names/descriptions
- Product detail pages with image galleries
- Product filtering (by category, price range)
- Responsive product grid layout
- Out-of-stock product display (visible but disabled purchase)
- Product availability status indicators
- Public seller profile pages with seller's products

**Technical Implementation:**
- API integration for product data
- Search and filter logic
- Optimized product queries with seller information
- Image gallery optimization and lazy loading
- Product availability status checking
- Seller profile integration

### 3.4 Shopping Cart & Checkout
**Scope:** Complete multi-seller shopping experience with validation

**Features:**
- Add/remove products from cart with stock validation
- Cart persistence across sessions (30-day retention for logged-in users)
- Quantity adjustment in cart with real-time validation
- Multi-seller cart support (single checkout, multiple sellers)
- Cart total calculations with seller breakdown
- Stock and availability validation at cart view and checkout
- Handling of unavailable items (out-of-stock, seller deactivated)
- Cart cleanup for discontinued products
- Single address per user checkout process
- Order confirmation with multi-seller item breakdown

**Technical Implementation:**
- Cart state management (localStorage + database persistence)
- CartItems entity with user relationship
- Multi-seller order entity creation
- Real-time stock validation functions
- Cart cleanup automation for unavailable products
- Single address (UserAddress 1-to-1 relationship)
- Checkout form validation with comprehensive business rules

### 3.5 Order Management
**Scope:** Multi-seller order processing with item-level tracking

**Buyer Features:**
- View order history with multi-seller order breakdown
- Order status tracking (item-level status per seller)
- Order details view showing items from different sellers
- Address information snapshot for each order
- Order tracking with seller-specific updates

**Seller Features:**
- View incoming orders containing their products only
- Update order item status for their products independently
- Order management dashboard with seller-specific filtering
- View customer shipping information for their orders only
- Process orders through status workflow (pending → processing → shipped → delivered)

**Technical Implementation:**
- Order and OrderItem entities with seller tracking
- Item-level status workflows (independent per seller)
- Order queries filtered by seller for privacy and security
- Address snapshot preservation for historical orders
- Multi-seller order visibility rules and permissions

### 3.6 Core Site Structure
**Scope:** Professional site layout and navigation

**Features:**
- Responsive landing page
- Header navigation with search functionality
- Footer with links and information
- About/Contact static pages
- User account navigation with role-based menus
- Mobile-responsive design throughout
- Loading states and error handling

**Technical Implementation:**
- Next.js App Router structure
- Responsive layout components
- SEO optimization
- Performance optimization
- Component-based architecture

## 4. User Roles & Capabilities

### 4.1 Guest Users
- Browse products and categories
- View product details with image galleries
- Access seller profile pages
- Use search and filtering
- Access static pages (About, Contact)
- Register/Login

### 4.2 Authenticated Buyers
- All Guest capabilities plus:
- Add products to cart with validation
- Complete multi-seller checkout process
- View order history and track status
- Manage single address information
- Manage basic profile information

### 4.3 Authenticated Sellers
- All Buyer capabilities plus:
- Create and manage products with image galleries
- Manage business profile information
- View and process orders for their products only
- Access seller dashboard with analytics
- Update order status for their items
- Manage product inventory and availability

## 5. Technical Scope

### 5.1 Frontend Technologies
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/UI
- **State Management:** React Context API / Zustand for cart
- **Data Fetching:** SWR or React Query
- **Forms:** React Hook Form with Zod validation

### 5.2 Backend Technologies
- **Framework:** .NET (ASP.NET Core Web API)
- **Database:** SQLite with Entity Framework Core
- **Authentication:** JWT with HttpOnly cookies
- **API Design:** RESTful endpoints with proper validation
- **Validation:** FluentValidation

### 5.3 Database Entities

**New Entities to Implement:**
- **Products** (id, name, description, price, stock, category_enum, seller_id, image_urls_array, status, created_at, updated_at)
- **UserAddress** (id, user_id, address_fields, created_at, updated_at) - 1-to-1 relationship
- **SellerProfile** (id, user_id, business_name, business_description, created_at, updated_at)
- **CartItems** (id, user_id, product_id, quantity, created_at, updated_at) - temporary storage
- **Orders** (id, order_number, buyer_id, total, shipping_address_snapshot, created_at, updated_at)
- **OrderItems** (id, order_id, product_id, seller_id, quantity, price_at_order, item_status, created_at, updated_at)

**Existing Entities to Leverage:**
- **Users** (sophisticated user management already implemented)
- **UserProfile** (profile information support)
- **RefreshTokens** (JWT refresh token management)

**Design Decisions:**
- Categories implemented as enum (predefined: Electronics, Clothing, Books, Home, Sports)
- Multi-seller orders supported through OrderItems.seller_id tracking
- Cart persistence with 30-day retention policy and cleanup automation
- Address snapshots preserved in orders for historical accuracy
- Item-level order status for independent seller fulfillment

## 6. Business Rules and Validation

### 6.1 Product Management
- Sellers can only manage their own products
- Products use predefined category enum values
- Stock levels affect purchase availability
- Out-of-stock products remain visible but cannot be purchased
- Inactive products are hidden from public browsing

### 6.2 Cart and Checkout Validation
- Cart requires user authentication
- Stock validation performed at cart view and checkout
- Cart items automatically removed if products become unavailable
- Multi-seller checkout creates single order with multiple items
- Address required for all order placements

### 6.3 Order Processing Rules
- Orders create permanent historical records
- Stock decremented upon order placement
- Item-level status tracking allows independent seller fulfillment
- Sellers see only orders containing their products
- Order status progression enforced (cannot skip steps)

### 6.4 User Access Control
- Role-based permissions throughout system
- Users can only access their own data
- Sellers limited to their products and related orders
- Public seller profiles contain only business-appropriate information

## 7. Implementation Phases

### Phase 0: Documentation Complete
- Finalize all documentation files
- Define API contracts and data schemas
- Create database migration plans

### Phase 1: Core Infrastructure
- Set up frontend project structure
- Implement authentication UI with existing backend
- Create protected route system with role-based access
- Basic responsive layout and navigation

### Phase 2: E-commerce Core
- Implement product entities and APIs
- Create product management UI (seller dashboard)
- Build product browsing UI with search/filter
- Shopping cart functionality with validation

### Phase 3: Multi-Seller Order Processing
- Order creation and management with seller tracking
- Seller order dashboard with filtering
- Buyer order history with multi-seller breakdown
- Status update workflows for independent fulfillment

### Phase 4: Polish & Optimization
- Performance optimization and caching
- UI/UX refinements and responsive design
- Comprehensive testing and bug fixes
- Documentation updates and deployment preparation

## 8. Deferred Features (Post-MVP)

**Authentication Enhancements:**
- Email verification workflows
- OAuth provider integration (Google, GitHub)
- Password reset functionality
- Two-factor authentication

**Advanced E-commerce:**
- File upload for product images
- Product reviews and ratings system
- Wishlist functionality
- Advanced search with more filters
- Multiple addresses per user

**Business Features:**
- Payment processing integration (Stripe, PayPal)
- Advanced inventory management
- Sales analytics and reporting dashboards
- Seller commission and payout systems
- Customer communication tools

**Technical Enhancements:**
- Real-time notifications (WebSocket/SSE)
- Advanced caching strategies
- Automated testing suites
- CI/CD deployment automation
- Performance monitoring

## 9. Success Criteria

The MVP will be considered successful when it demonstrates:

1. **Full-Stack Competency:** Seamless integration between frontend and backend with real data
2. **Real-World Functionality:** Complete user journeys from registration to multi-seller order completion
3. **Code Quality:** Clean, maintainable, and well-documented code architecture
4. **Professional Standards:** Proper authentication, validation, error handling, and security
5. **Portfolio Value:** Showcases skills relevant to professional development roles
6. **Business Logic:** Demonstrates understanding of e-commerce business requirements

## 10. Non-Functional Requirements

- **Performance:** Page load times under 2 seconds, optimized database queries
- **Responsiveness:** Mobile-first responsive design across all devices
- **Security:** Secure authentication, data validation, and privacy protection
- **Usability:** Intuitive user interfaces with proper error handling
- **Maintainability:** Clean code architecture with comprehensive documentation
- **Scalability:** Database design and API structure ready for future enhancements

---

**Note:** This scope is designed to demonstrate professional full-stack development capabilities while maintaining focus on quality implementation. The MVP provides a solid foundation for future enhancements and serves as an effective portfolio piece showcasing modern web development skills, including complex business logic and multi-user system design.
