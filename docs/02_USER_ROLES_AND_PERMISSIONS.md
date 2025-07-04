# User Roles and Permissions

## 1. Introduction

This document defines the user roles, permissions, and access control mechanisms for the Full-Stack E-Commerce Marketplace MVP. The system implements role-based access control (RBAC) to ensure appropriate functionality is available to each user type while maintaining security and data privacy.

## 2. User Role Hierarchy

### 2.1 Role Structure
The system implements three primary user roles with inherent capabilities:

```
Guest Users (Unauthenticated)
    ↓
Authenticated Buyers (Registered Users)
    ↓
Authenticated Sellers (Buyers + Business Features)
```

**Role Inheritance:** Higher-level roles inherit all permissions from lower-level roles.

### 2.2 Role Assignment
- **Default Role:** New users are assigned "Buyer" role upon registration
- **Role Upgrade:** Buyers can upgrade to "Seller" status through profile settings
- **Role Storage:** User roles are stored in the existing Users table role field
- **Role Validation:** All API endpoints validate user roles before granting access

## 3. Guest Users (Unauthenticated)

### 3.1 Permitted Actions
**Product Browsing:**
- View public product catalog with pagination
- Search products by name and description
- Filter products by category and price range
- Sort products by price and date
- View individual product details with image galleries
- Check product availability status (in stock, out of stock)

**Seller Information Access:**
- View public seller profiles
- Browse seller's product catalogs
- View seller business information (name, description, join date)
- Access seller statistics (product count, member since)

**General Site Access:**
- Access homepage and landing pages
- View static pages (About, Contact, Terms, Privacy)
- Use site navigation and search functionality
- Access registration and login forms

### 3.2 Restricted Actions
**Authentication Required:**
- Cannot add products to cart
- Cannot access checkout process
- Cannot view order history
- Cannot access user profile or settings
- Cannot create or manage any content

**Business Functions:**
- Cannot create or manage products
- Cannot access seller dashboard
- Cannot process orders
- Cannot manage business profiles

## 4. Authenticated Buyers

### 4.1 Inherited Permissions
- All Guest User permissions (product browsing, seller profiles, site access)

### 4.2 Buyer-Specific Permissions

**Account Management:**
- View and edit personal profile information (name, email, phone)
- Change password with current password verification
- Manage single shipping address (create, view, edit)
- Upgrade to seller status through profile settings
- Access order history and tracking

**Shopping Cart Management:**
- Add products to cart with stock validation
- Remove products from cart
- Update product quantities with availability checking
- View cart contents with multi-seller breakdown
- Validate cart items for availability
- Cart persistence across sessions (30-day retention)
- Handle unavailable items (out-of-stock, seller deactivated)

**Order Processing:**
- Proceed through checkout process
- Create orders from cart contents
- View order confirmation and details
- Track order status with item-level tracking
- View orders with multi-seller breakdown
- Monitor delivery status from multiple sellers
- Access historical order information with address snapshots

**Address Management:**
- Create shipping address (required for first order)
- Edit existing address information
- View address used in historical orders
- Address validation for deliverable locations

### 4.3 Buyer Restrictions
**Product Management:**
- Cannot create, edit, or delete products
- Cannot access seller dashboard or tools
- Cannot manage inventory or product status
- Cannot access business profile settings

**Order Fulfillment:**
- Cannot update order statuses
- Cannot access customer shipping information for other orders
- Cannot view other users' order information
- Cannot process or fulfill orders

## 5. Authenticated Sellers

### 5.1 Inherited Permissions
- All Guest User permissions (browsing, site access)
- All Authenticated Buyer permissions (cart, orders, profile)

### 5.2 Seller-Specific Permissions

**Business Profile Management:**
- Create and manage seller business profile
- Set business name and description
- Update business contact information
- Manage public seller profile appearance
- View public seller profile as customers see it

**Product Management:**
- Create new product listings with comprehensive information
- Edit existing products (name, description, price, images, stock)
- Upload multiple product images (max 5 per product)
- Select from predefined product categories (enum-based)
- Set and update stock quantities
- Activate/deactivate products
- Delete products (soft delete with order history preservation)
- Monitor product performance and availability status

**Inventory Management:**
- Track stock levels across all products
- Update inventory quantities with immediate effect
- Monitor product availability status
- Handle out-of-stock situations
- Manage product status (active/inactive)

**Order Management and Fulfillment:**
- View incoming orders containing their products only
- Access customer shipping information for their orders
- Update order item status for their products independently
- Process orders through status workflow (Pending → Processing → Shipped → Delivered)
- View order details filtered to their products
- Access order management dashboard with seller-specific data
- Track order completion metrics and analytics

**Seller Dashboard Access:**
- Access comprehensive seller dashboard
- View sales metrics and performance indicators
- Monitor business activity and statistics
- Access product management interface
- View order processing tools and status management

### 5.3 Seller Restrictions and Privacy Controls

**Data Access Limitations:**
- Can only view orders containing their own products
- Cannot access other sellers' product information
- Cannot view other sellers' business profiles or settings
- Cannot access customer information beyond order-related data
- Cannot view or modify other sellers' order items

**System Limitations:**
- Cannot modify products they don't own
- Cannot update order status for other sellers' items
- Cannot access buyer-only information (cart contents, personal data)
- Cannot view system-wide analytics or other sellers' performance
- Cannot manage other users' accounts or permissions

## 6. Permission Matrix

### 6.1 Feature Access Control

| Feature | Guest | Buyer | Seller |
|---------|-------|-------|--------|
| **Product Browsing** |
| View products | ✅ | ✅ | ✅ |
| Search/filter products | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ |
| View seller profiles | ✅ | ✅ | ✅ |
| **Account Management** |
| Registration/login | ✅ | ✅ | ✅ |
| Edit profile | ❌ | ✅ | ✅ |
| Manage address | ❌ | ✅ | ✅ |
| **Shopping Cart** |
| Add to cart | ❌ | ✅ | ✅ |
| Manage cart | ❌ | ✅ | ✅ |
| Cart validation | ❌ | ✅ | ✅ |
| **Orders** |
| Place orders | ❌ | ✅ | ✅ |
| View order history | ❌ | ✅ | ✅ |
| Track orders | ❌ | ✅ | ✅ |
| **Product Management** |
| Create products | ❌ | ❌ | ✅ |
| Edit own products | ❌ | ❌ | ✅ |
| Manage inventory | ❌ | ❌ | ✅ |
| **Order Fulfillment** |
| View customer orders | ❌ | ❌ | ✅* |
| Update order status | ❌ | ❌ | ✅* |
| Access shipping info | ❌ | ❌ | ✅* |
| **Business Management** |
| Seller dashboard | ❌ | ❌ | ✅ |
| Business profile | ❌ | ❌ | ✅ |
| Sales analytics | ❌ | ❌ | ✅ |

*\* Sellers can only access orders and information related to their own products*

### 6.2 Data Visibility Rules

**Product Data:**
- **Public:** Product details, availability, seller business info
- **Seller-Only:** Product performance metrics, edit capabilities
- **System-Only:** Internal product IDs, audit trails

**Order Data:**
- **Buyer-Only:** Complete order history, all items, personal shipping info
- **Seller-Only:** Orders containing their products, customer shipping for fulfillment
- **Shared:** Order status, item tracking, delivery updates

**User Data:**
- **Self-Only:** Personal profile, email, phone, address
- **Public:** Seller business name, description, join date
- **System-Only:** Password hashes, authentication tokens, internal IDs

## 7. Security Implementation

### 7.1 Authentication Requirements
**Session Management:**
- JWT tokens with role claims
- HttpOnly cookies for secure session storage
- Token expiration and refresh mechanism
- Role validation on every API request

**Route Protection:**
- Frontend route guards based on authentication status
- API endpoint protection with role verification
- Resource ownership validation for data access
- Permission checks before any data modification

### 7.2 Authorization Enforcement

**Resource Ownership Validation:**
- Products: Sellers can only manage their own products
- Orders: Buyers see their orders, sellers see only their items
- Profiles: Users can only edit their own information
- Cart: Users can only access their own cart

**Cross-User Data Protection:**
- Sellers cannot access other sellers' data
- Buyers cannot access other buyers' information
- Order information shared only between relevant parties
- Business information limited to public-appropriate content

**Role-Based Access Control:**
- Every API endpoint validates user role before execution
- Frontend components conditionally render based on permissions
- Database queries filter results based on user permissions
- Error messages don't reveal unauthorized data

## 8. Permission Validation Examples

### 8.1 API Endpoint Security

```typescript
// Product Creation - Seller Only
POST /api/products
- Verify user authentication
- Validate user has seller role
- Assign product to authenticated seller
- Validate all input according to business rules

// Order Status Update - Seller for Own Items Only
PUT /api/orders/:orderId/items/:itemId/status
- Verify user authentication
- Validate user has seller role
- Confirm seller owns the product for this order item
- Validate status progression rules
```

### 8.2 Data Access Patterns

```sql
-- Seller viewing their orders (filtered automatically)
SELECT o.*, oi.* 
FROM Orders o 
JOIN OrderItems oi ON o.Id = oi.OrderId 
WHERE oi.SellerId = @CurrentUserId

-- Buyer viewing their complete order history
SELECT o.*, oi.*, p.Name as ProductName, s.BusinessName as SellerName
FROM Orders o 
JOIN OrderItems oi ON o.Id = oi.OrderId 
JOIN Products p ON oi.ProductId = p.Id
JOIN SellerProfiles s ON oi.SellerId = s.UserId
WHERE o.BuyerId = @CurrentUserId
```

## 9. Business Rules for Multi-Seller Operations

### 9.1 Order Visibility Rules
**Single Order, Multiple Sellers:**
- Buyers see complete order with all items grouped by seller
- Each seller sees only their items from the order
- Order totals are calculated across all sellers for buyers
- Individual item totals are visible to respective sellers

**Status Management:**
- Each seller independently manages status for their items
- Order completion determined when all items are delivered
- Buyers see seller-specific status updates
- Sellers cannot view or update other sellers' item statuses

### 9.2 Cart and Checkout Permissions
**Multi-Seller Cart:**
- Buyers can add items from multiple sellers to single cart
- Cart validation checks availability across all sellers
- Checkout process creates single order with multiple seller items
- Stock validation performed for all sellers' products

**Availability Handling:**
- Products remain visible when out of stock (read-only)
- Cart items flagged when seller deactivates or product becomes unavailable
- Buyers notified of availability changes
- Unavailable items must be resolved before checkout

## 10. Implementation Notes

### 10.1 Technical Considerations
**Role Storage:** Utilize existing Users table role field for MVP simplicity
**Permission Checks:** Implement consistent permission validation across all endpoints
**Error Handling:** Provide clear feedback for permission violations without revealing sensitive data
**Performance:** Optimize queries to include permission filtering at database level

### 10.2 Future Enhancements
**Advanced Roles:** Admin roles for system management
**Granular Permissions:** More specific permission sets for complex business rules
**Role Delegation:** Ability for sellers to delegate certain permissions
**Audit Logging:** Track permission-based actions for security monitoring

---

**Note:** This permission system ensures appropriate access control while supporting the multi-seller marketplace functionality. All permissions are designed to maintain user privacy, data security, and business rule enforcement throughout the platform.
