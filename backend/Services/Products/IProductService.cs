using backend.DTO.Products;
using LanguageExt;

namespace backend.Services.Products;

public interface IProductService
{
    // Basic CRUD Operations
    Task<Fin<ProductDto>> CreateProductAsync(CreateProductRequest request, Guid sellerId);
    Task<Fin<ProductDto>> GetProductByIdAsync(Guid id);
    Task<Fin<ProductDto>> UpdateProductAsync(Guid productId, UpdateProductRequest request, Guid sellerId);
    Task<Fin<Unit>> DeleteProductAsync(Guid productId, Guid sellerId);

    // Public browsing (essential MVP)
    Task<Fin<PagedResult<ProductDto>>> GetProductsAsync(ProductSearchRequest request);
    Task<Fin<List<ProductDto>>> SearchProductsAsync(string searchTerm, int limit = 50);
    Task<Fin<List<ProductDto>>> GetFeaturedProductsAsync(int limit = 10);
    Task<Fin<List<ProductDto>>> GetRelatedProductsAsync(Guid productId, int limit = 5);

    // Seller management (essential MVP)
    Task<Fin<List<ProductDto>>> GetAllSellerProductsAsync(Guid sellerId, bool includeInactive = true);
    Task<Fin<PagedResult<ProductDto>>> GetSellerProductsAsync(Guid sellerId, ProductFilterRequest request);
    Task<Fin<ProductDto>> GetSellerProductByIdAsync(Guid productId, Guid sellerId);

    // Stock management (essential MVP)
    Task<Fin<bool>> HasSufficientStockAsync(Guid productId, int quantity);
    Task<Fin<Unit>> UpdateStockAsync(Guid productId, int newStock, Guid sellerId);
    Task<Fin<Unit>> DecrementStockAsync(Guid productId, int quantity, Guid sellerId);
    Task<Fin<Unit>> DecrementStockWithConcurrencyAsync(Guid productId, int quantity, Guid sellerId);
    Task<Fin<Unit>> BulkRestoreStockAsync(List<(Guid ProductId, int Quantity)> stockUpdates, Guid sellerId);

    // Validation
    Task<Fin<ProductDto>> GetWithStockCheckAsync(Guid productId, int requiredQuantity);

    // Image Management (R2 + ImageKit.io)
    Task<Fin<BatchUploadUrlResponse>> GenerateBatchImageUploadUrlsAsync(List<string> fileNames, Guid sellerId);
    Task<Fin<Unit>> UploadProductImagesAsync(Guid productId, List<string> imageUrls, Guid sellerId);
    Task<Fin<Unit>> DeleteProductImageAsync(Guid productId, string imageUrl, Guid sellerId);
    Task<Fin<string>> ConfirmImagesUploadAsync(string r2url, Guid sellerId);

    // Analytics & Extras
    Task<Fin<ProductAnalyticsDto>> GetProductAnalyticsAsync(Guid sellerId);
    Task<Fin<List<ProductDto>>> GetTopSellingProductsAsync(int limit = 10);

    // Product Status Management
    Task<Fin<Unit>> ToggleProductStatusAsync(Guid productId, Guid sellerId);
}