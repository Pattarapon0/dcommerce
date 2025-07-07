using Microsoft.EntityFrameworkCore;
using backend.Common.Results;
using backend.Data.Products.Entities; // Ensure this is the correct namespace for Product
using LanguageExt;
using static LanguageExt.Prelude;


namespace backend.Data.Products;

public class ProductRepository(ECommerceDbContext context) : IProductRepository
{
    private readonly ECommerceDbContext _context = context;

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

    public async Task<Fin<Product>> GetByIdWithSellerAsync(Guid id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Seller) // Assuming Seller is a navigation property in Product
                .FirstOrDefaultAsync(p => p.Id == id);
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

    public async Task<Fin<Unit>> DeleteAsync(Guid id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
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

    public async Task<Fin<Unit>> SoftDeleteAsync(Guid id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.IsActive = false;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

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

    public async Task<Fin<List<Product>>> GetBySellerIdAsync(Guid sellerId)
    {
        try
        {
            var products = await _context.Products
                .Where(p => p.SellerId == sellerId)
                .ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedBySellerAsync(Guid sellerId, int page, int pageSize)
    {
        try
        {
            var query = _context.Products
                .Where(p => p.SellerId == sellerId)
                .OrderBy(p => p.Name); // Adjust sorting as needed

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

    public async Task<Fin<List<Product>>> GetByCategoryAsync(ProductCategory category, int limit = 50)
    {
        try
        {
            var products = await _context.Products
                .Where(p => p.Category == category)
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
                .OrderByDescending(p => p.CreatedAt) // Assuming CreatedAt is a property to determine featured products
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
                // If not enough related products, consider other categories or popular products
                var additionalProducts = await _context.Products
                    .Where(p => p.Id != productId && p.SellerId == product.SellerId) // Optionally filter by the same seller
                    .OrderByDescending(p => p.CreatedAt) // Assuming CreatedAt is a property to determine popularity
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

    public async Task<Fin<Unit>> UpdateStockAsync(Guid id, int newStock)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
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

    public async Task<Fin<Unit>> DecrementStockAsync(Guid id, int quantity)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            if (product.Stock < quantity)
                return FinFail<Unit>(ServiceError.InsufficientStock());

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

    public async Task<Fin<Unit>> IncrementStockAsync(Guid id, int quantity)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.Stock += quantity;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Product>>> GetLowStockProductsAsync(Guid sellerId, int threshold = 5)
    {
        try
        {
            var products = await _context.Products
                .Where(p => p.SellerId == sellerId && p.Stock < threshold)
                .ToListAsync();
            return FinSucc(products);
        }
        catch (Exception ex)
        {
            return FinFail<List<Product>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> ExistsAsync(Guid id)
    {
        try
        {
            var exists = await _context.Products.AnyAsync(p => p.Id == id);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

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

    public async Task<Fin<bool>> IsActiveAsync(Guid id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<bool>(ServiceError.NotFound("Product", "product id : " + id));

            return FinSucc(product.IsActive);
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

    public async Task<Fin<Unit>> BulkUpdateStatusAsync(List<Guid> productIds, bool isActive)
    {
        try
        {
            await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ExecuteUpdateAsync(setters => setters.SetProperty(p => p.IsActive, isActive));
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> BulkUpdateCategoryAsync(List<Guid> productIds, ProductCategory category, Guid sellerId)
    {
        try
        {
            await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.SellerId == sellerId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(p => p.Category, category));
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<int>> GetTotalCountAsync()
    {
        try
        {
            var count = await _context.Products.CountAsync();
            return FinSucc(count);
        }
        catch (Exception ex)
        {
            return FinFail<int>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<int>> GetSellerProductCountAsync(Guid sellerId)
    {
        try
        {
            var count = await _context.Products.CountAsync(p => p.SellerId == sellerId);
            return FinSucc(count);
        }
        catch (Exception ex)
        {
            return FinFail<int>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<decimal>> GetAveragePriceAsync(ProductCategory? category = null)
    {
        try
        {
            var query = _context.Products.AsQueryable();

            if (category.HasValue)
                query = query.Where(p => p.Category == category.Value);

            var averagePrice = await query.AverageAsync(p => p.Price);
            return FinSucc(averagePrice);
        }
        catch (Exception ex)
        {
            return FinFail<decimal>(ServiceError.FromException(ex));
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

    public async Task<Fin<Unit>> UpdateImagesAsync(Guid id, List<string> imageUrls)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.Images = imageUrls;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> AddImageAsync(Guid id, string imageUrl)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.Images.Add(imageUrl);
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RemoveImageAsync(Guid id, string imageUrl)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return FinFail<Unit>(ServiceError.NotFound("Product", "product id : " + id));

            product.Images.Remove(imageUrl);
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return FinSucc(unit);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }
}