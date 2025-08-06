# E-Commerce API Documentation

## Base URL
`/api/v1/`

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human readable error message",
  "success": false,
  "errors": {
    "fieldName": ["Field specific error message"]
  }
}
```

## Common Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable
- `507` - Insufficient Storage

### Authentication Error Codes
- `EMAIL_ALREADY_EXISTS` - Account with this email already exists
- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_NOT_VERIFIED` - Email address has not been verified
- `ACCOUNT_LOCKED` - Account locked due to multiple failed attempts
- `TOKEN_EXPIRED` - Authentication token has expired
- `INVALID_TOKEN_SIGNATURE` - Token signature is invalid
- `INVALID_TOKEN_FORMAT` - Token format is invalid
- `MISSING_TOKEN_CLAIMS` - Required claims missing from token
- `UNAUTHORIZED_ACCESS` - User not authorized to access resource

### Validation Error Codes
- `VALIDATION_FAILED` - Request validation failed (includes field errors)
- `FIELD_VALIDATION_ERROR` - Specific field validation error
- `REQUIRED_FIELDS_MISSING` - Required fields are missing
- `REQUIRED_FIELD_MISSING` - Specific required field is missing
- `INVALID_FORMAT` - Field format is invalid
- `VALUE_TOO_LONG` - Field value exceeds maximum length
- `VALUE_TOO_SHORT` - Field value below minimum length
- `EMAIL_FORMAT_INVALID` - Email format is invalid
- `PASSWORD_COMPLEXITY_FAILED` - Password doesn't meet requirements
- `INVALID_NAME_FORMAT` - Name contains invalid characters
- `DATE_OF_BIRTH_REQUIRED` - Date of birth is required
- `TERMS_NOT_ACCEPTED` - Terms and conditions must be accepted

### Business Logic Error Codes
- `RESOURCE_CONFLICT` - Resource conflict (e.g., duplicate data)
- `PERMISSION_DENIED` - User lacks required permissions
- `FORBIDDEN` - Action is forbidden
- `BAD_REQUEST` - Request contains invalid data
- `INVALID_OPERATION` - Invalid operation for current state

### Product/Cart Error Codes
- `PRODUCT_NOT_FOUND` - Product with specified ID not found
- `INSUFFICIENT_STOCK` - Not enough stock available
- `CARTITEM_NOT_FOUND` - Cart item not found
- `INVALID_REFERENCE` - Invalid reference to related entity

### Image Error Codes
- `INVALID_IMAGE_FORMAT` - Invalid image format (only jpg, png, webp, gif allowed)
- `IMAGE_TOO_LARGE` - Image exceeds 5MB size limit
- `IMAGE_UPLOAD_RATE_LIMIT` - Upload rate limit exceeded (max 10 per minute)
- `STORAGE_SERVICE_UNAVAILABLE` - Image storage service temporarily unavailable
- `INVALID_IMAGE_CONTENT` - File is not a valid image
- `STORAGE_QUOTA_EXCEEDED` - Storage quota exceeded
- `IMAGE_NOT_FOUND` - Image not found

### System Error Codes
- `INTERNAL_SERVER_ERROR` - Unexpected server error occurred
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `PASSWORD_HASH_FAILED` - Failed to hash password
- `TOKEN_GENERATION_FAILED` - Failed to generate authentication token

---

## Auth Endpoints

### Register User
`POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "acceptedTerms": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": false
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Request validation failed
  - `EMAIL_FORMAT_INVALID` - Invalid email format
  - `PASSWORD_COMPLEXITY_FAILED` - Password doesn't meet requirements
  - `TERMS_NOT_ACCEPTED` - Terms must be accepted
- `409` - Conflict errors:
  - `EMAIL_ALREADY_EXISTS` - Email already registered
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error
  - `PASSWORD_HASH_FAILED` - Failed to hash password

### Verify Email
`POST /auth/verify-email`

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "isEmailVerified": true
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid token format
- `404` - Not found errors:
  - `VERIFICATIONTOKEN_NOT_FOUND` - Invalid or expired token
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Login
`POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
- `401` - Authentication errors:
  - `INVALID_CREDENTIALS` - Invalid email or password
- `403` - Authorization errors:
  - `EMAIL_NOT_VERIFIED` - Email must be verified first
  - `ACCOUNT_LOCKED` - Account locked due to failed attempts
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error
  - `TOKEN_GENERATION_FAILED` - Failed to generate tokens

---

## Cart Endpoints

### Add Item to Cart
`POST /cart/items`
**Authorization Required**

**Request Body:**
```json
{
  "productId": "product-id",
  "quantity": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-id",
    "productId": "product-id",
    "quantity": 2,
    "unitPrice": 29.99,
    "totalPrice": 59.98,
    "product": {
      "name": "Product Name",
      "images": ["image-url"]
    }
  }
}
```

**Error Responses:**
- `400` - Validation/Business errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `BAD_REQUEST` - Insufficient stock, quantity limits, or cart limits exceeded
  - `PRODUCT_NOT_FOUND` - Product doesn't exist
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Get Cart
`GET /cart`
**Authorization Required**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [/* cart items */],
    "totalItems": 5,
    "totalValue": 149.95,
    "isValid": true,
    "validationIssues": []
  }
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Update Cart Item
`PUT /cart/items/{cartItemId}`
**Authorization Required**

**Request Body:**
```json
{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-id",
    "quantity": 3,
    "totalPrice": 89.97
  }
}
```

**Error Responses:**
- `400` - Validation/Business errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `BAD_REQUEST` - Insufficient stock or quantity limits
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `FORBIDDEN` - You do not own this cart item
- `404` - Not found errors:
  - `CARTITEM_NOT_FOUND` - Cart item doesn't exist
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Remove Cart Item
`DELETE /cart/items/{cartItemId}`
**Authorization Required**

**Success Response (204):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `FORBIDDEN` - You do not own this cart item
- `404` - Not found errors:
  - `CARTITEM_NOT_FOUND` - Cart item doesn't exist
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

---

## Product Endpoints

### Get Products (Public)
`GET /products?page=1&pageSize=10&category=electronics&minPrice=10&maxPrice=100&searchTerm=phone`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [/* products */],
    "totalCount": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid query parameters
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Get Product by ID (Public)
`GET /products/{id}`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stock": 100,
    "images": ["image-url"],
    "seller": {
      "id": "seller-id",
      "businessName": "Seller Name"
    }
  }
}
```

**Error Responses:**
- `404` - Not found errors:
  - `PRODUCT_NOT_FOUND` - Product doesn't exist
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Create Product (Seller Only)
`POST /products`
**Authorization Required: Seller Role**

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "category": "electronics",
  "images": ["image-url-1", "image-url-2"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Product Name",
    "price": 29.99,
    "stock": 100
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `BAD_REQUEST` - Business validation failed
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `PERMISSION_DENIED` - Seller role required
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Update Product (Seller Only)
`PUT /products/{id}`
**Authorization Required: Seller Role**

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 34.99,
  "stock": 85
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Updated Product Name",
    "price": 34.99
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `PERMISSION_DENIED` - Seller role required
- `404` - Not found errors:
  - `PRODUCT_NOT_FOUND` - Product doesn't exist or not owned by seller
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Delete Product (Seller Only)
`DELETE /products/{id}`
**Authorization Required: Seller Role**

**Success Response (204):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `PERMISSION_DENIED` - Seller role required
- `404` - Not found errors:
  - `PRODUCT_NOT_FOUND` - Product doesn't exist or not owned by seller
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

---

## Order Endpoints

### Create Order
`POST /orders`
**Authorization Required**

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "unitPrice": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "orderNumber": "ORD-001",
    "status": "pending",
    "totalAmount": 59.98,
    "items": [/* order items */]
  }
}
```

**Error Responses:**
- `400` - Validation/Business errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `BAD_REQUEST` - Insufficient stock or invalid product
  - `PRODUCT_NOT_FOUND` - One or more products not found
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Get Order
`GET /orders/{orderId}`
**Authorization Required**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "orderNumber": "ORD-001",
    "status": "pending",
    "totalAmount": 59.98,
    "items": [/* order items */],
    "shippingAddress": {/* address */}
  }
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `FORBIDDEN` - You don't have access to this order
- `404` - Not found errors:
  - `ORDER_NOT_FOUND` - Order doesn't exist
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Cancel Order
`POST /orders/{orderId}/cancel`
**Authorization Required**

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "status": "cancelled",
    "cancelReason": "Changed my mind"
  }
}
```

**Error Responses:**
- `400` - Business errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `BAD_REQUEST` - Order cannot be cancelled at this stage
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `403` - Authorization errors:
  - `FORBIDDEN` - You don't have access to this order
- `404` - Not found errors:
  - `ORDER_NOT_FOUND` - Order doesn't exist
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

---

## User Profile Endpoints

### Get User Profile
`GET /user/profile`
**Authorization Required**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "preferredCurrency": "USD",
    "avatarUrl": null,
    "isActive": true,
    "isVerified": true,
    "profileComplete": true,
    "isOAuthUser": false,
    "createdAt": "2023-01-01T00:00:00Z",
    "lastLogin": "2023-12-01T10:00:00Z"
  }
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `404` - Not found errors:
  - `USERPROFILE_NOT_FOUND` - User profile not found
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Update User Profile
`PUT /user/profile`
**Authorization Required**

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "bio": "Software developer",
  "website": "https://johndoe.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "preferredCurrency": "USD",
    "avatarUrl": null,
    "isActive": true,
    "isVerified": true,
    "profileComplete": true,
    "isOAuthUser": false,
    "createdAt": "2023-01-01T00:00:00Z",
    "lastLogin": "2023-12-01T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
  - `INVALID_NAME_FORMAT` - Name contains invalid characters
  - `DATE_OF_BIRTH_REQUIRED` - Date of birth is required
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Manage User Address
`GET /user/address` - Get user address
`POST /user/address` - Create user address
`PUT /user/address` - Update user address
`DELETE /user/address` - Delete user address
**Authorization Required**

**Address Request Body:**
```json
{
  "address": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Anytown",
  "state": "California",
  "postalCode": "12345",
  "country": "United States"
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid address format
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `404` - Not found errors:
  - `USERADDRESS_NOT_FOUND` - User address not found (GET, PUT, DELETE only)
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

---

## Seller Profile Endpoints

### Create Seller Profile
`POST /sellers/profile`
**Authorization Required**

**Request Body:**
```json
{
  "businessName": "My Store",
  "businessDescription": "Quality products for everyone",
  "businessEmail": "store@example.com",
  "businessPhone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "seller-id",
    "businessName": "My Store",
    "businessDescription": "Quality products for everyone",
    "businessEmail": "store@example.com",
    "isActive": true
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `409` - Conflict errors:
  - `RESOURCE_CONFLICT` - User already has a seller profile
  - `RESOURCE_CONFLICT` - Business name already exists
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Get Seller Profile
`GET /sellers/profile` - Get own seller profile
`GET /sellers/{sellerId}` - Get seller profile by ID (public)
**Authorization Required (for own profile only)**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "seller-id",
    "businessName": "My Store",
    "businessDescription": "Quality products for everyone",
    "businessEmail": "store@example.com",
    "rating": 4.5,
    "totalSales": 150
  }
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token (own profile only)
- `404` - Not found errors:
  - `SELLERPROFILE_NOT_FOUND` - Seller profile not found
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Update Seller Profile
`PUT /sellers/profile`
**Authorization Required**

**Request Body:**
```json
{
  "businessDescription": "Updated description",
  "businessEmail": "newemail@example.com",
  "businessPhone": "+0987654321"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "seller-id",
    "businessDescription": "Updated description",
    "businessEmail": "newemail@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation errors:
  - `VALIDATION_FAILED` - Invalid request format
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `404` - Not found errors:
  - `SELLERPROFILE_NOT_FOUND` - Seller profile not found
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

### Delete Seller Profile
`DELETE /sellers/profile`
**Authorization Required**

**Success Response (204):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Authentication errors:
  - `UNAUTHORIZED_ACCESS` - Invalid or missing token
- `404` - Not found errors:
  - `SELLERPROFILE_NOT_FOUND` - Seller profile not found
- `500` - Server errors:
  - `INTERNAL_SERVER_ERROR` - Unexpected error

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Image uploads**: 10 uploads per minute per user
- **General API**: Standard rate limits apply per endpoint

When rate limits are exceeded, you'll receive:
```json
{
  "errorCode": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded",
  "success": false
}
```

---

## Request/Response Headers

### Required Headers
- `Content-Type: application/json` (for requests with body)
- `Authorization: Bearer {access-token}` (for protected endpoints)

### Response Headers
- `Content-Type: application/json`
- `X-Rate-Limit-Remaining: {count}` (when applicable)

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)

Paginated responses include:
```json
{
  "success": true,
  "data": {
    "items": [/* array of items */],
    "totalCount": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```