# Technical Architecture

## 1. Introduction

This document defines the technical architecture for the Full-Stack E-Commerce Marketplace MVP. The architecture is designed to support a multi-seller marketplace with comprehensive product management, shopping cart functionality, and order processing while maintaining simplicity, performance, and cost-effectiveness through free-tier hosting solutions.

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (SPA)"
        FE[Next.js SPA + TypeScript]
        UI[Tailwind CSS + Shadcn/UI]
        STATE[Jotai + TanStack Query]
    end
    
    subgraph "Backend API"
        API[.NET Core Web API]
        AUTH[JWT Authentication]
        BL[Business Logic Services]
    end
    
    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        STORAGE[Supabase Storage]
    end
    
    subgraph "Deployment"
        CDN[Static Hosting - Netlify/GitHub Pages]
        DOCKER[Railway - Docker Container]
        CLOUD[Supabase Cloud Services]
    end
    
    FE --> API
    API --> DB
    API --> STORAGE
    FE --> CDN
    API --> DOCKER
    DB --> CLOUD
    STORAGE --> CLOUD
```

### 2.2 Technology Stack Summary

**Frontend (SPA):**
- Next.js 15 + TypeScript (static export)
- Tailwind CSS + Shadcn/UI
- Jotai (state) + TanStack Query (server state)
- TanStack Form + Valibot (forms)

**Backend:**
- .NET Core Web API
- Entity Framework Core + PostgreSQL
- JWT Authentication (existing)
- Docker containerization

**Infrastructure:**
- Static hosting (free tier)
- Railway (.NET hosting)
- Supabase (database + storage)

## 3. Frontend Architecture

### 3.1 Project Structure

```
my-app/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── products/          # Product browsing pages
│   ├── cart/              # Shopping cart page
│   ├── orders/            # Order management pages
│   ├── seller/            # Seller dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/                # Shadcn/UI components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── features/          # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── api/               # API client functions
│   ├── atoms/             # Jotai state atoms
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── utils.ts           # Utility functions
└── middleware.ts          # Route protection middleware
```

### 3.2 Key Technologies and Rationale

**Next.js 15 (SPA Mode):**
- **Static Export:** Simple deployment to any static hosting
- **App Router:** Modern routing with layouts
- **TypeScript:** Type safety across the application
- **Image Optimization:** Automatic image optimization (disabled for static export)

```javascript
// next.config.ts
const nextConfig = {
  output: 'export',           // Generate static files
  trailingSlash: true,       // Better for static hosting
  images: {
    unoptimized: true        // Disable Next.js image optimization for SPA
  }
}
```

**State Management - Jotai:**
```tsx
// lib/atoms/auth.ts
export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom(get => get(userAtom) !== null)
export const userRoleAtom = atom(get => get(userAtom)?.role || 'Guest')

// lib/atoms/cart.ts
export const cartItemsAtom = atom<CartItem[]>([])
export const cartCountAtom = atom(get => get(cartItemsAtom).length)
export const cartTotalAtom = atom(get => 
  get(cartItemsAtom).reduce((sum, item) => sum + (item.price * item.quantity), 0)
)

// Multi-seller cart grouping
export const cartBySellerAtom = atom(get => {
  const items = get(cartItemsAtom)
  return groupBy(items, 'sellerId')
})
```

**Form Handling - TanStack Form + Valibot:**
```tsx
// Example: Product creation form
import { useForm } from '@tanstack/react-form'
import { object, string, number, array } from 'valibot'

const ProductSchema = object({
  name: string([minLength(5), maxLength(200)]),
  description: string([minLength(10), maxLength(2000)]),
  price: number([minValue(0.01)]),
  stock: number([minValue(0)]),
  category: string(),
  imageUrls: array(string(), [minLength(1), maxLength(5)])
})

const ProductForm = () => {
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'Electronics',
      imageUrls: []
    },
    onSubmit: async ({ value }) => {
      await createProduct(value)
    }
  })
}
```

**API Integration - TanStack Query:**
```tsx
// lib/api/products.ts
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000  // 5 minutes cache
  })
}

export const useAddToCart = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (item: AddToCartRequest) => cartApi.addItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      if (error.code === 'INSUFFICIENT_STOCK') {
        toast.error('Not enough stock available')
      }
    }
  })
}
```

### 3.3 Route Protection and Role-Based Access

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // Protect seller routes
  if (pathname.startsWith('/seller')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protect authenticated routes
  if (pathname.startsWith('/cart') || pathname.startsWith('/orders')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
}

export const config = {
  matcher: ['/seller/:path*', '/cart/:path*', '/orders/:path*']
}
```

## 4. Backend Architecture

### 4.1 Project Structure (Enhanced)

```
server/
├── Controllers/           # API endpoints
│   ├── V1/
│   │   ├── AuthController.cs        # Existing authentication
│   │   ├── ProductsController.cs    # Product management
│   │   ├── CartController.cs        # Shopping cart operations
│   │   ├── OrdersController.cs      # Order processing
│   │   ├── UsersController.cs       # User/address management
│   │   └── SellersController.cs     # Seller-specific operations
│   └── Common/
│       └── BaseController.cs        # Base controller functionality
├── Services/              # Business logic layer
│   ├── IProductService.cs
│   ├── ICartService.cs
│   ├── IOrderService.cs
│   ├── ISellerService.cs
│   └── IImageService.cs
├── Models/                # DTOs and request/response models
│   ├── Products/
│   ├── Cart/
│   ├── Orders/
│   └── Common/
├── Data/                  # Data access layer (existing + new)
│   ├── User/              # Existing user repository
│   ├── Products/          # Product repository
│   ├── Orders/            # Order repository
│   └── Common/            # Shared data access
├── Common/                # Existing shared utilities
│   ├── Services/          # Existing auth services
│   ├── Results/           # Result pattern implementation
│   └── Validators/        # FluentValidation validators
└── Migrations/            # Database migrations
```

### 4.2 Service Layer Implementation

**Product Service:**
```csharp
public interface IProductService
{
    Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, int sellerId);
    Task<Result<ProductDto>> GetByIdAsync(int id);
    Task<Result<PagedResult<ProductDto>>> GetProductsAsync(ProductSearchRequest request);
    Task<Result<PagedResult<ProductDto>>> GetSellerProductsAsync(int sellerId, int page);
    Task<Result<ProductDto>> UpdateAsync(int id, UpdateProductRequest request, int sellerId);
    Task<Result> DeleteAsync(int id, int sellerId);
}

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IImageService _imageService;

    public async Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, int sellerId)
    {
        // Validate seller permissions
        // Validate image URLs
        // Create product entity
        // Return mapped DTO
    }
}
```

**Multi-Seller Order Service:**
```csharp
public interface IOrderService
{
    Task<Result<OrderDto>> CreateFromCartAsync(int userId);
    Task<Result<OrderDto>> GetOrderAsync(int orderId, int userId, string userRole);
    Task<Result<PagedResult<OrderDto>>> GetUserOrdersAsync(int userId);
    Task<Result<PagedResult<OrderItemDto>>> GetSellerOrderItemsAsync(int sellerId);
    Task<Result> UpdateOrderItemStatusAsync(int orderItemId, int sellerId, OrderItemStatus status);
}

public class OrderService : IOrderService
{
    public async Task<Result<OrderDto>> CreateFromCartAsync(int userId)
    {
        // 1. Get user's cart items
        // 2. Validate stock availability for all items
        // 3. Validate seller status for all items
        // 4. Calculate totals with multi-seller breakdown
        // 5. Create order + order items with seller tracking
        // 6. Update product stock levels
        // 7. Clear user's cart
        // 8. Return order confirmation with seller groups
    }
}
```

### 4.3 Data Access Layer

**Enhanced Repository Pattern:**
```csharp
public interface IProductRepository : IBaseRepository<Product>
{
    Task<PagedResult<Product>> GetActiveProductsAsync(ProductSearchCriteria criteria);
    Task<List<Product>> GetBySellerAsync(int sellerId);
    Task<Product> GetWithSellerInfoAsync(int productId);
    Task<List<ProductAvailabilityDto>> CheckAvailabilityAsync(List<int> productIds);
}

public interface IOrderRepository : IBaseRepository<Order>
{
    Task<PagedResult<Order>> GetUserOrdersAsync(int userId, int page, int pageSize);
    Task<Order> GetWithItemsAsync(int orderId);
    Task<List<OrderItem>> GetSellerOrderItemsAsync(int sellerId);
    Task<OrderItem> GetOrderItemAsync(int orderItemId, int sellerId);
}
```

### 4.4 Authentication Integration

**Enhanced Authorization:**
```csharp
[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductSearchRequest request)
    {
        // Public endpoint - no authentication required for browsing
        var result = await _productService.GetProductsAsync(request);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductRequest request)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.CreateAsync(request, sellerId);
        return HandleResult(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, UpdateProductRequest request)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.UpdateAsync(id, request, sellerId);
        return HandleResult(result);
    }
}
```

## 5. Database Architecture

### 5.1 Database Configuration

**Environment-Based Connection:**
```csharp
public static class DatabaseConfig
{
    public static void ConfigureDatabase(this IServiceCollection services, IConfiguration config)
    {
        var environment = config["ASPNETCORE_ENVIRONMENT"];
        var connectionString = config.GetConnectionString("DefaultConnection");
        
        if (environment == "Development")
        {
            // Local development - SQLite
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(connectionString));
        }
        else
        {
            // Production - Supabase PostgreSQL
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));
        }
    }
}
```

**Configuration Files:**
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=user.db"
  }
}

// appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=xxx;SSL Mode=Require"
  }
}
```

### 5.2 Entity Framework Integration

**Database Context:**
```csharp
public class ApplicationDbContext : BaseDbContext
{
    // Existing entities
    public DbSet<User> Users { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    
    // New e-commerce entities
    public DbSet<Product> Products { get; set; }
    public DbSet<UserAddress> UserAddresses { get; set; }
    public DbSet<SellerProfile> SellerProfiles { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure entity relationships and constraints
        ConfigureProductEntities(modelBuilder);
        ConfigureOrderEntities(modelBuilder);
        ConfigureUserEntities(modelBuilder);
    }
}
```

### 5.3 Migration Strategy

**Development to Production Migration:**
```bash
# Development (SQLite)
dotnet ef migrations add InitialEcommerce
dotnet ef database update

# Production (PostgreSQL)
# 1. Generate PostgreSQL migration
dotnet ef migrations add InitialPostgreSQL --context ApplicationDbContext
# 2. Deploy with Docker environment variables
# 3. Run migrations on startup
```

## 6. File Storage Architecture (Supabase Storage)

### 6.1 Image Storage Implementation

**Supabase Storage Configuration:**
```typescript
// lib/storage/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const uploadProductImage = async (file: File, productId: string) => {
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `products/${productId}/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export const deleteProductImage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from('product-images')
    .remove([imagePath])
    
  if (error) throw error
}
```

**Backend Image Service:**
```csharp
public interface IImageService
{
    Task<Result<List<string>>> UploadProductImagesAsync(List<IFormFile> files, int productId);
    Task<Result> DeleteProductImagesAsync(List<string> imageUrls);
    Task<Result> ValidateImageUrlsAsync(List<string> imageUrls);
}

public class ImageService : IImageService
{
    public async Task<Result> ValidateImageUrlsAsync(List<string> imageUrls)
    {
        // Validate Supabase storage URLs
        // Check if images exist and are accessible
        // Validate file types and sizes
    }
}
```

### 6.2 Storage Structure

```
Supabase Storage Buckets:
├── product-images/
│   ├── {productId}/
│   │   ├── main-image.jpg
│   │   ├── gallery-1.jpg
│   │   └── gallery-2.jpg
│   └── thumbnails/ (auto-generated)
└── user-avatars/ (future enhancement)
```

## 7. API Design and Communication

### 7.1 API Structure

```
/api/v1/
├── auth/
│   ├── POST login
│   ├── POST register  
│   ├── POST logout
│   └── POST refresh
├── products/
│   ├── GET (public browsing)
│   ├── POST (create - sellers)
│   ├── /{id} (GET/PUT/DELETE)
│   └── /my (GET seller's products)
├── cart/ (authenticated)
│   ├── GET (get cart)
│   ├── POST /add
│   └── DELETE /items/{id}
├── orders/ (authenticated)
│   ├── GET (user orders)
│   ├── POST (create from cart)
│   ├── /{id} (order details)
│   └── /{id}/items/{itemId}/status (PUT seller)
├── users/ (authenticated)
│   ├── GET /profile
│   ├── PUT /profile
│   ├── GET /address
│   ├── POST /address
│   └── POST /become-seller
├── sellers/ (seller authenticated)
│   ├── GET /profile
│   ├── PUT /profile
│   ├── GET /{id}/public
│   └── GET /orders/pending
└── search/
    └── GET (public search)
```

### 7.2 Standardized Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Actual response data
  },
  "pagination": {
    // Pagination metadata for lists
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNext": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the following errors",
    "details": {
      "price": "Price must be greater than 0",
      "stock": "Stock cannot be negative"
    }
  }
}
```

### 7.3 Multi-Seller API Examples

**Cart Response with Seller Grouping:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productName": "Wireless Headphones",
        "sellerId": 5,
        "sellerName": "TechStore",
        "quantity": 2,
        "price": 99.99,
        "lineTotal": 199.98,
        "availability": "Available",
        "imageUrl": "https://supabase.co/storage/..."
      }
    ],
    "sellerGroups": [
      {
        "sellerId": 5,
        "sellerName": "TechStore",
        "items": [...],
        "subtotal": 199.98
      }
    ],
    "totals": {
      "subtotal": 199.98,
      "tax": 20.00,
      "total": 219.98
    }
  }
}
```

**Order Creation Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "O-20250704-001",
    "orderNumber": "O-20250704-001",
    "orderDate": "2025-07-04T10:30:00Z",
    "status": "pending",
    "sellerGroups": [
      {
        "sellerId": 5,
        "sellerName": "TechStore",
        "items": [
          {
            "productId": 10,
            "name": "Wireless Headphones",
            "quantity": 1,
            "price": 99.99,
            "status": "pending"
          }
        ],
        "subtotal": 99.99
      }
    ],
    "totals": {
      "subtotal": 99.99,
      "tax": 10.00,
      "total": 109.99
    }
  }
}
```

## 8. Authentication and Authorization

### 8.1 Authentication Flow

**Frontend Authentication:**
```typescript
// lib/auth/auth.ts
import { atom } from 'jotai'

export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom(get => get(userAtom) !== null)

export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    set(userAtom, response.user)
    // HttpOnly cookie set automatically by backend
  }
)

export const logoutAtom = atom(
  null,
  async (get, set) => {
    await authApi.logout()
    set(userAtom, null)
  }
)
```

**Axios Interceptor for Token Management:**
```typescript
// lib/api/client.ts
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await authApi.refreshToken()
        return axios.request(error.config)
      } catch {
        // Redirect to login
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)
```

### 8.2 Role-Based Authorization

**Multi-Seller Authorization Logic:**
```csharp
[HttpGet("orders/{orderId}")]
public async Task<ActionResult<OrderDto>> GetOrder(int orderId)
{
    var currentUserId = GetCurrentUserId();
    var userRole = GetCurrentUserRole();
    
    var result = await _orderService.GetOrderAsync(orderId, currentUserId, userRole);
    return HandleResult(result);
}

// Service implementation handles role-based filtering
public async Task<Result<OrderDto>> GetOrderAsync(int orderId, int userId, string userRole)
{
    var order = await _orderRepository.GetWithItemsAsync(orderId);
    
    if (userRole == "Buyer" && order.BuyerId != userId)
        return Result<OrderDto>.Failure("Access denied");
        
    if (userRole == "Seller")
    {
        // Filter to show only seller's items
        order.OrderItems = order.OrderItems.Where(oi => oi.SellerId == userId).ToList();
        if (!order.OrderItems.Any())
            return Result<OrderDto>.Failure("Access denied");
    }
    
    return Result<OrderDto>.Success(MapToDto(order));
}
```

## 9. Security Architecture

### 9.1 Security Configuration

**CORS Setup:**
```csharp
// Program.cs
services.AddCors(options => {
    options.AddPolicy("Frontend", policy => {
        policy.WithOrigins(
            "http://localhost:3000",           // Development
            "https://yourapp.netlify.app"      // Production
        )
        .AllowCredentials()                    // For HttpOnly cookies
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

**Security Headers:**
```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
    
    app.Use(async (context, next) => {
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        await next();
    });
}
```

### 9.2 Input Validation

**Frontend Validation (Valibot):**
```typescript
import { object, string, number, array, minLength, maxLength, minValue } from 'valibot'

export const CreateProductSchema = object({
  name: string([minLength(5, 'Name must be at least 5 characters'), maxLength(200)]),
  description: string([minLength(10), maxLength(2000)]),
  price: number([minValue(0.01, 'Price must be greater than 0')]),
  stock: number([minValue(0, 'Stock cannot be negative')]),
  category: string(),
  imageUrls: array(string(), [minLength(1, 'At least one image required'), maxLength(5)])
})
```

**Backend Validation (FluentValidation):**
```csharp
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .Length(5, 200);
            
        RuleFor(x => x.Description)
            .NotEmpty()
            .Length(10, 2000);
            
        RuleFor(x => x.Price)
            .GreaterThan(0);
            
        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0);
            
        RuleFor(x => x.ImageUrls)
            .NotEmpty()
            .Must(urls => urls.Count <= 5)
            .WithMessage("Maximum 5 images allowed");
    }
}
```

## 10. Performance and Optimization

### 10.1 Frontend Performance

**Code Splitting and Lazy Loading:**
```tsx
// Lazy load heavy components
const SellerDashboard = lazy(() => import('./SellerDashboard'))
const ProductManagement = lazy(() => import('./ProductManagement'))

// Route-based code splitting (automatic with Next.js App Router)
const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes />
    </Suspense>
  )
}
```

**TanStack Query Caching:**
```tsx
// lib/api/queries.ts
export const productQueries = {
  all: () => ['products'] as const,
  lists: () => [...productQueries.all(), 'list'] as const,
  list: (filters: ProductFilters) => [...productQueries.lists(), filters] as const,
  details: () => [...productQueries.all(), 'detail'] as const,
  detail: (id: number) => [...productQueries.details(), id] as const,
}

export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: productQueries.list(filters),
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000     // 10 minutes
  })
}
```

### 10.2 Backend Performance

**Response Caching:**
```csharp
[ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "category", "page" })]
public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductSearchRequest request)
{
    var result = await _productService.GetProductsAsync(request);
    return HandleResult(result);
}
```

**Database Query Optimization:**
```csharp
public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductSearchRequest request)
{
    var query = _context.Products
        .Include(p => p.Seller)
        .ThenInclude(s => s.SellerProfile)
        .Where(p => p.IsActive)
        .AsQueryable();

    // Apply filters
    if (!string.IsNullOrEmpty(request.Search))
    {
        query = query.Where(p => p.Name.Contains(request.Search) || 
                                p.Description.Contains(request.Search));
    }

    if (request.Category.HasValue)
    {
        query = query.Where(p => p.Category == request.Category);
    }

    // Pagination
    var totalCount = await query.CountAsync();
    var products = await query
        .Skip((request.Page - 1) * request.PageSize)
        .Take(request.PageSize)
        .Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            Stock = p.Stock,
            ImageUrls = p.ImageUrls,
            SellerName = p.Seller.SellerProfile.BusinessName
        })
        .ToListAsync();

    return new PagedResult<ProductDto>(products, totalCount, request.Page, request.PageSize);
}
```

### 10.3 Memory Caching

```csharp
// Program.cs
services.AddMemoryCache();

// Service implementation
public class ProductService : IProductService
{
    private readonly IMemoryCache _cache;
    
    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        const string cacheKey = "product_categories";
        
        if (_cache.TryGetValue(cacheKey, out List<CategoryDto> categories))
        {
            return categories;
        }

        categories = Enum.GetValues<ProductCategory>()
            .Select(c => new CategoryDto { Id = (int)c, Name = c.ToString() })
            .ToList();

        _cache.Set(cacheKey, categories, TimeSpan.FromHours(24));
        return categories;
    }
}
```

## 11. Development and Deployment

### 11.1 Development Environment

**Local Development Setup:**
```bash
# Frontend development
cd my-app
npm install
npm run dev              # localhost:3000

# Backend development  
cd server
dotnet restore
dotnet run               # localhost:5000

# Database setup
dotnet ef database update
```

**Environment Variables:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Backend (appsettings.Development.json)
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=user.db"
  },
  "JWT": {
    "Secret": "your-development-secret",
    "ExpiryInDays": 7
  }
}
```

### 11.2 Production Deployment

**Free-Tier Hosting Architecture:**
```
Frontend SPA: Netlify/GitHub Pages
    ↓ (API calls)
Backend API: Railway (Docker container)
    ↓ (database connection)
Database: Supabase PostgreSQL
Storage: Supabase Storage
```

**Docker Configuration:**
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["server.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "server.dll"]
```

**Production Environment Variables:**
```bash
# Railway deployment
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=production-secret-key
FRONTEND_URL=https://yourapp.netlify.app
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

### 11.3 Deployment Process

**Frontend Deployment (Netlify):**
```bash
# Build for production
npm run build

# Deploy /out folder to Netlify
# Automatic deployment via GitHub integration
```

**Backend Deployment (Railway):**
```bash
# Connect GitHub repository to Railway
# Automatic Docker build and deployment
# Set environment variables in Railway dashboard
```

**Database Setup (Supabase):**
```sql
-- Run production migrations
-- Set up storage buckets
-- Configure row-level security (if needed)
```

## 12. Monitoring and Error Tracking

### 12.1 Error Tracking (Optional - Sentry)

**Frontend Integration:**
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs"

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  })
}

// Usage in components
try {
  await addToCart(product)
} catch (error) {
  Sentry.captureException(error)
  toast.error('Failed to add item to cart')
}
```

**Backend Integration:**
```csharp
// Program.cs (if using Sentry)
services.AddSentry(options => {
    options.Dsn = configuration["Sentry:Dsn"];
    options.Environment = configuration["ASPNETCORE_ENVIRONMENT"];
});
```

### 12.2 Basic Logging

```csharp
public class ProductService : IProductService
{
    private readonly ILogger<ProductService> _logger;

    public async Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, int sellerId)
    {
        _logger.LogInformation("Creating product {ProductName} for seller {SellerId}", 
            request.Name, sellerId);
        
        try
        {
            // Product creation logic
            _logger.LogInformation("Product {ProductId} created successfully", product.Id);
            return Result<ProductDto>.Success(productDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create product for seller {SellerId}", sellerId);
            return Result<ProductDto>.Failure("Product creation failed");
        }
    }
}
```

## 13. Future Enhancements and Scalability

### 13.1 Immediate Post-MVP Enhancements

**Authentication:**
- Email verification workflow
- Password reset functionality
- OAuth integration (Google, GitHub)

**E-commerce Features:**
- Product reviews and ratings
- Wishlist functionality
- Multiple addresses per user
- Advanced search with faceted filters

**Business Features:**
- Payment processing integration
- Seller analytics dashboard
- Inventory management tools
- Customer communication system

### 13.2 Scalability Considerations

**Database Scaling:**
- Read replicas for product browsing
- Database connection pooling
- Query optimization and monitoring

**Infrastructure Scaling:**
- CDN for static assets
- Load balancer for API
- Redis for session storage
- Microservices architecture

**Performance Enhancements:**
- Real-time updates (WebSocket/SSE)
- Advanced caching strategies
- Image optimization and CDN
- Search engine integration (Elasticsearch)

## 14. Conclusion

This technical architecture provides a solid foundation for a multi-seller e-commerce marketplace MVP while maintaining cost-effectiveness through free-tier hosting solutions. The architecture emphasizes:

- **Simplicity:** Clear separation of concerns and straightforward implementation
- **Performance:** Optimized queries, caching strategies, and efficient state management
- **Scalability:** Design patterns that allow for future growth and enhancement
- **Cost-Effectiveness:** Leveraging free-tier services for hosting and infrastructure
- **Developer Experience:** Modern tooling and patterns for maintainable code

The architecture supports all core e-commerce functionality including multi-seller operations, shopping cart management, order processing, and secure authentication while providing a foundation for future enhancements and scaling.

---

**Technology Stack Summary:**
- **Frontend:** Next.js SPA + TypeScript + Jotai + TanStack
- **Backend:** .NET Core + PostgreSQL + Docker
- **Storage:** Supabase Storage for images
- **Hosting:** Free-tier solutions (Netlify + Railway + Supabase)
- **Authentication:** JWT with 7-day sessions
- **Multi-seller:** Independent seller operations with shared customer experience
