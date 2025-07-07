using LanguageExt;
using backend.Data.Products.Entities;
using static LanguageExt.Prelude;

namespace backend.Data.Products;

public interface IProductRepository
{
    // Basic CRUD Operations
    Task<Fin<Product>> CreateAsync(Product product);
    Task<Fin<Product>> GetByIdAsync(Guid id);
    Task<Fin<Product>> GetByIdWithSellerAsync(Guid id);
    Task<Fin<Product>> UpdateAsync(Product product);
    Task<Fin<Unit>> DeleteAsync(Guid id);
    Task<Fin<Unit>> SoftDeleteAsync(Guid id); // Mark as IsActive = false

    // Seller-specific Operations
    Task<Fin<Product>> GetByIdAndSellerAsync(Guid id, Guid sellerId);
    Task<Fin<List<Product>>> GetBySellerIdAsync(Guid sellerId);
    Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedBySellerAsync(
        Guid sellerId, int page, int pageSize);

    // Public Product Browsing
    Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedAsync(
        int page, int pageSize, ProductCategory? category = null,
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null,
        string? sortBy = null, bool ascending = true);

    // Search and Filtering
    Task<Fin<List<Product>>> SearchByNameAsync(string searchTerm, int limit = 50);
    Task<Fin<List<Product>>> GetByCategoryAsync(ProductCategory category, int limit = 50);
    Task<Fin<List<Product>>> GetFeaturedProductsAsync(int limit = 10);
    Task<Fin<List<Product>>> GetRelatedProductsAsync(Guid productId, int limit = 5);

    // Stock Management
    Task<Fin<Product>> GetWithStockCheckAsync(Guid id, int requiredQuantity);
    Task<Fin<Unit>> UpdateStockAsync(Guid id, int newStock);
    Task<Fin<Unit>> DecrementStockAsync(Guid id, int quantity);
    Task<Fin<Unit>> IncrementStockAsync(Guid id, int quantity);
    Task<Fin<List<Product>>> GetLowStockProductsAsync(Guid sellerId, int threshold = 5);

    // Validation and Business Logic
    Task<Fin<bool>> ExistsAsync(Guid id);
    Task<Fin<bool>> IsOwnedBySellerAsync(Guid id, Guid sellerId);
    Task<Fin<bool>> IsActiveAsync(Guid id);
    Task<Fin<bool>> HasSufficientStockAsync(Guid id, int quantity);

    // Bulk Operations
    Task<Fin<Unit>> BulkUpdateStatusAsync(List<Guid> productIds, bool isActive);
    Task<Fin<Unit>> BulkUpdateCategoryAsync(List<Guid> productIds, ProductCategory category, Guid sellerId);

    // Analytics and Reporting
    Task<Fin<int>> GetTotalCountAsync();
    Task<Fin<int>> GetSellerProductCountAsync(Guid sellerId);
    Task<Fin<decimal>> GetAveragePriceAsync(ProductCategory? category = null);
    Task<Fin<List<Product>>> GetTopSellingProductsAsync(int limit = 10);

    // Image Management
    Task<Fin<Unit>> UpdateImagesAsync(Guid id, List<string> imageUrls);
    Task<Fin<Unit>> AddImageAsync(Guid id, string imageUrl);
    Task<Fin<Unit>> RemoveImageAsync(Guid id, string imageUrl);
}