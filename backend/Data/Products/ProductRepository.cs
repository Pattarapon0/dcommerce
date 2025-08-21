using Microsoft.EntityFrameworkCore;
using backend.Common.Results;
using backend.Data.Products.Entities;
using LanguageExt;
using backend.DTO.Products;
using static LanguageExt.Prelude;

namespace backend.Data.Products;

public class ProductRepository(ECommerceDbContext context) : IProductRepository
{
    private readonly ECommerceDbContext _context = context;

    // Basic CRUD Operations
    public async Task<Fin<Product>> CreateAsync(Product product)
    {
        try
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return FinSucc(product);
        }
        catch (Exception ex)
        {
            return FinFail<Product>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Product>> GetByIdAsync(Guid id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            return product != null ? FinSucc(product) : FinFail<Product>(ServiceError.NotFound("Product", "product id : " + id));
        }
        catch (Exception ex)
        {
            return FinFail<Product>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Product>> UpdateAsync(Product product)
    {
        try
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(product);
        }
        catch (Exception ex)
        {
            return FinFail<Product>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteAsync(Guid id, Guid sellerId)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    // Seller-specific Operations
    public async Task<Fin<Product>> GetByIdAndSellerAsync(Guid id, Guid sellerId)
    {
        try
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
            return product != null ? FinSucc(product) : FinFail<Product>(ServiceError.NotFound("Product", "product id : " + id + ", seller id : " + sellerId));
        }
        catch (Exception ex)
        {
            return FinFail<Product>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Product>>> GetBySellerIdAsync(Guid sellerId, bool includeInactive = true)
    {
        try
        {
            var query = _context.Products.AsQueryable();
            
            if (includeInactive)
            {
                // Sellers see all their products (active + inactive)
                query = query.IgnoreQueryFilters()
                             .Where(p => p.SellerId == sellerId);
            }
            else
            {
                // Public view only sees active products
                query = query.Where(p => p.SellerId == sellerId);
            }
            
            var products = await query.ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedBySellerAsync(Guid sellerId, ProductFilterRequest request)
    {
        try
        {
            // Use IgnoreQueryFilters to let sellers see all their products (active/inactive)
            var query = _context.Products
                .IgnoreQueryFilters()
                .Where(p => p.SellerId == sellerId);

            // Apply filtering
            if (request.Category.HasValue)
                query = query.Where(p => p.Category == request.Category.Value);

            if (request.MinPrice.HasValue)
                query = query.Where(p => p.Price >= request.MinPrice.Value);

            if (request.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= request.MaxPrice.Value);

            if (!string.IsNullOrEmpty(request.SearchTerm))
                query = query.Where(p => p.Name.Contains(request.SearchTerm) || p.Description.Contains(request.SearchTerm));

            // Apply IsActive filter if specified
            if (request.IsActive.HasValue)
                query = query.Where(p => p.IsActive == request.IsActive.Value);

            if (!string.IsNullOrEmpty(request.SortBy))
            {
                query = request.Ascending ? query.OrderBy(p => EF.Property<object>(p, request.SortBy))
                                          : query.OrderByDescending(p => EF.Property<object>(p, request.SortBy));
            }

            var totalCount = await query.CountAsync();
            var page = request.Page ?? 1;
            var pageSize = request.PageSize ?? 10;
            var products = await query.Skip((page - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToListAsync();

            return FinSucc((products, totalCount));
        }
        catch (Exception ex)
        {
            return FinFail<(List<Product> Products, int TotalCount)>(ServiceError.FromException(ex));
        }
    }

    // Public Product Browsing
    public async Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedAsync(
        int page, int pageSize, ProductCategory? category = null,
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null,
        string? sortBy = null, bool ascending = true)
    {
        try
        {
            var query = _context.Products.AsQueryable();

            if (category.HasValue)
                query = query.Where(p => p.Category == category.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Where(p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm));

            if (!string.IsNullOrEmpty(sortBy))
            {
                query = ascending ? query.OrderBy(p => EF.Property<object>(p, sortBy))
                                  : query.OrderByDescending(p => EF.Property<object>(p, sortBy));
            }

            var totalCount = await query.CountAsync();
            var products = await query.Skip((page - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToListAsync();

            return FinSucc((products, totalCount));
        }
        catch (Exception ex)
        {
            return FinFail<(List<Product> Products, int TotalCount)>(ServiceError.FromException(ex));
        }
    }

    // Search and Filtering
    public async Task<Fin<List<Product>>> SearchByNameAsync(string searchTerm, int limit = 50)
    {
        try
        {
            var products = await _context.Products
                .Where(p => p.Name.Contains(searchTerm))
                .Take(limit)
                .ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Product>>> GetFeaturedProductsAsync(int limit = 10)
    {
        try
        {
            var products = await _context.Products
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Product>>> GetRelatedProductsAsync(Guid productId, int limit = 5)
    {
        try
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return FinFail<List<Product>>(ServiceError.NotFound("Product", "product id : " + productId));

            var relatedProducts = await _context.Products
                .Where(p => p.Category == product.Category && p.Id != productId)
                .Take(limit)
                .ToListAsync();

            if (relatedProducts.Count < limit)
            {
                var additionalProducts = await _context.Products
                    .Where(p => p.Id != productId && p.SellerId == product.SellerId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(limit - relatedProducts.Count)
                    .ToListAsync();
                relatedProducts.AddRange(additionalProducts);
            }
            return FinSucc(relatedProducts);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    // Stock Management
    public async Task<Fin<Unit>> UpdateStockAsync(Guid id, int newStock, Guid sellerId)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.Stock = newStock;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DecrementStockAsync(Guid id, int quantity, Guid sellerId)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            if (product.Stock < quantity)
                return FinFail<Unit>(ServiceError.BadRequest("Insufficient stock"));

            product.Stock -= quantity;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DecrementStockWithConcurrencyAsync(Guid id, int quantity, Guid sellerId)
    {
        try
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
            if (product == null)
            {
                await transaction.RollbackAsync();
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));
            }

            if (product.Stock < quantity)
            {
                await transaction.RollbackAsync();
                return FinFail<Unit>(ServiceError.BadRequest("Insufficient stock"));
            }

            product.Stock -= quantity;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> BulkRestoreStockAsync(List<(Guid ProductId, int Quantity)> stockUpdates, Guid sellerId)
    {
        try
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            foreach (var (productId, quantity) in stockUpdates)
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && p.SellerId == sellerId);
                if (product != null)
                {
                    product.Stock += quantity;
                    _context.Products.Update(product);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    // Validation
    public async Task<Fin<bool>> IsOwnedBySellerAsync(Guid id, Guid sellerId)
    {
        try
        {
            var exists = await _context.Products.AnyAsync(p => p.Id == id && p.SellerId == sellerId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> HasSufficientStockAsync(Guid id, int quantity)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<bool>(ServiceError.NotFound("Product", "product id : " + id));

            return FinSucc(product.Stock >= quantity);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Product>> GetWithStockCheckAsync(Guid id, int requiredQuantity)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Product>(ServiceError.NotFound("Product", "product id : " + id));

            if (product.Stock < requiredQuantity)
                return FinFail<Product>(ServiceError.InsufficientStock());

            return FinSucc(product);
        }
        catch (Exception ex)
        {
            return FinFail<Product>(ServiceError.FromException(ex));
        }
    }

    // Image Management
    public async Task<Fin<Unit>> SaveProductImageAsync(Guid productId, string imageUrl, int order, Guid sellerId)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && p.SellerId == sellerId);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + productId));
            if (order < 0 || order >= product.Images.Count)
                return FinFail<Unit>(ServiceError.BadRequest("Invalid image order"));
            var images = product.Images;
            images.Insert(order, imageUrl);
            product.Images = images;
            _context.Products.Update(product);
            await _context.SaveChangesAsync(); 
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteProductImageAsync(Guid productId, string imageUrl, Guid sellerId)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && p.SellerId == sellerId);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + productId));
            if (!product.Images.Contains(imageUrl))
                return FinFail<Unit>(ServiceError.BadRequest("Image not found in product"));
            var images = product.Images;
            images.Remove(imageUrl);
            product.Images = images;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    // Analytics & Extras
    public async Task<Fin<ProductAnalyticsDto>> GetProductAnalyticsAsync(Guid sellerId)
    {
        try
        {
            var products = await _context.Products.Where(p => p.SellerId == sellerId).ToListAsync();
            var topSellingProduct = products.OrderByDescending(p => p.SalesCount).FirstOrDefault();
            var topSellingProductDto = topSellingProduct != null ? new ProductDto
            {
                Id = topSellingProduct.Id,
                Name = topSellingProduct.Name,
                Price = topSellingProduct.Price,
                Stock = topSellingProduct.Stock,
                SalesCount = topSellingProduct.SalesCount,
                Images = topSellingProduct.Images
            } : null;
            var analytics = new ProductAnalyticsDto
            {
                TotalProducts = products.Count,
                ActiveProducts = products.Count(p => p.IsActive),
                TotalRevenue = products.Sum(p => p.Price * p.Stock),
                TotalSales = products.Sum(p => p.SalesCount),
                AveragePrice = products.Any() ? products.Average(p => p.Price) : 0,
                TotalStock = products.Sum(p => p.Stock),
                AverageStock = products.Any() ? products.Average(p => p.Stock) : 0,
                TopSellingProduct = topSellingProductDto
            };
            return FinSucc(analytics);
        }
        catch (Exception ex)
        {
            return FinFail<ProductAnalyticsDto>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Product>>> GetTopSellingProductsAsync(int limit = 10)
    {
        try
        {
            var products = await _context.Products
                .OrderByDescending(p => p.SalesCount)
                .Take(limit)
                .ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    // Product Status Management
    public async Task<Fin<Unit>> ToggleActiveStatusAsync(Guid id, Guid sellerId)
    {
        try
        {
            var product = await _context.Products
                .IgnoreQueryFilters() // Bypass global filter to find inactive products
                .FirstOrDefaultAsync(p => p.Id == id && p.SellerId == sellerId);
                
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product not found", "Product not found or not owned by seller"));
            
            product.IsActive = !product.IsActive;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }
}