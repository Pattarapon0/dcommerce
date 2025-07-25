using backend.Data.Products.Entities;
using backend.DTO.Products;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Products;

public interface IProductRepository
{
    // Basic CRUD Operations
    Task<Fin<Product>> CreateAsync(Product product);
    Task<Fin<Product>> GetByIdAsync(Guid id);
    Task<Fin<Product>> UpdateAsync(Product product);
    Task<Fin<Unit>> DeleteAsync(Guid id, Guid sellerId);

    // Seller-specific Operations
    Task<Fin<Product>> GetByIdAndSellerAsync(Guid id, Guid sellerId);
    Task<Fin<List<Product>>> GetBySellerIdAsync(Guid sellerId);
    Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedBySellerAsync(Guid sellerId, ProductFilterRequest request);

    // Public Product Browsing
    Task<Fin<(List<Product> Products, int TotalCount)>> GetPagedAsync(
        int page, int pageSize, ProductCategory? category = null,
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null,
        string? sortBy = null, bool ascending = true);

    // Search and Filtering
    Task<Fin<List<Product>>> SearchByNameAsync(string searchTerm, int limit = 50);
    Task<Fin<List<Product>>> GetFeaturedProductsAsync(int limit = 10);
    Task<Fin<List<Product>>> GetRelatedProductsAsync(Guid productId, int limit = 5);

    // Stock Management
    Task<Fin<Unit>> UpdateStockAsync(Guid id, int newStock, Guid sellerId);
    Task<Fin<Unit>> DecrementStockAsync(Guid id, int quantity, Guid sellerId);
    Task<Fin<Unit>> DecrementStockWithConcurrencyAsync(Guid id, int quantity, Guid sellerId);
    Task<Fin<Unit>> BulkRestoreStockAsync(List<(Guid ProductId, int Quantity)> stockUpdates, Guid sellerId);

    // Validation
    Task<Fin<bool>> IsOwnedBySellerAsync(Guid id, Guid sellerId);
    Task<Fin<bool>> HasSufficientStockAsync(Guid id, int quantity);
    Task<Fin<Product>> GetWithStockCheckAsync(Guid id, int requiredQuantity);

    // Image Management
    Task<Fin<Unit>> SaveProductImageAsync(Guid productId, string imageUrl, int order, Guid sellerId);
    Task<Fin<Unit>> DeleteProductImageAsync(Guid productId, string imageUrl, Guid sellerId);

    // Analytics & Extras
    Task<Fin<ProductAnalyticsDto>> GetProductAnalyticsAsync(Guid sellerId);
    Task<Fin<List<Product>>> GetTopSellingProductsAsync(int limit = 10);
}