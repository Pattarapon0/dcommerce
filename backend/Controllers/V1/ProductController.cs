using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.DTO.Products;
using backend.Services.Products;
using LanguageExt;
using static LanguageExt.Prelude;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using backend.Common.Results;

namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/products")]
public class ProductController(IProductService productService) : BaseController
{
    private readonly IProductService _productService = productService;

    #region Public Product Browsing (No Auth Required)

    /// <summary>
    /// Get paginated product listing with optional filters
    /// </summary>
    /// <param name="request">Search and filter parameters</param>
    /// <returns>Paginated product listing</returns>
    [HttpGet]
    [ProducesResponseType<ServiceSuccess<PagedResult<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductSearchRequest request)
    {
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _productService.GetProductsAsync(request);
            return result;
        });
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <returns>Product details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<ServiceSuccess<ProductDto>>(200)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        return HandleResult(result);
    }

    /// <summary>
    /// Search products by name/description
    /// </summary>
    /// <param name="request">Search parameters including term and limit</param>
    /// <returns>List of matching products</returns>
    [HttpGet("search")]
    [ProducesResponseType<ServiceSuccess<List<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> SearchProducts([FromQuery] ProductSearchQueryRequest request)
    {
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _productService.SearchProductsAsync(request.Term, request.Limit);
            return result;
        });
    }

    /// <summary>
    /// Get featured products
    /// </summary>
    /// <param name="limit">Maximum results to return</param>
    /// <returns>List of featured products</returns>
    [HttpGet("featured")]
    [ProducesResponseType<ServiceSuccess<List<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetFeaturedProducts([FromQuery] int limit = 10)
    {
        var result = await _productService.GetFeaturedProductsAsync(limit);
        return HandleResult(result);
    }

    /// <summary>
    /// Get related products for a specific product
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="limit">Maximum results to return</param>
    /// <returns>List of related products</returns>
    [HttpGet("{id:guid}/related")]
    [ProducesResponseType<ServiceSuccess<List<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetRelatedProducts(Guid id, [FromQuery] int limit = 5)
    {
        var result = await _productService.GetRelatedProductsAsync(id, limit);
        return HandleResult(result);
    }

    /// <summary>
    /// Get products by seller (public access)
    /// </summary>
    /// <param name="sellerId">Seller identifier</param>
    /// <returns>List of seller's active products</returns>
    [HttpGet("seller/{sellerId:guid}")]
    [ProducesResponseType<ServiceSuccess<PagedResult<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetSellerProducts(Guid sellerId)
    {
        var result = await _productService.GetSellerProductsAsync(sellerId, new ProductFilterRequest
        {
            Category = null,
            MinPrice = null,
            MaxPrice = null,
            SearchTerm = null,
            SortBy = "CreatedAt",
            Ascending = false,
            Page = 1,
            PageSize = 10 // Default pagination
        });
        return HandleResult(result);
    }

    #endregion

    #region Seller Product Management (Auth Required)

    /// <summary>
    /// Create a new product
    /// </summary>
    /// <param name="request">Product creation details</param>
    /// <returns>Created product details</returns>
    [HttpPost]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<ProductDto>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var sellerId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _productService.CreateProductAsync(request, sellerId));
    }

    /// <summary>
    /// Update existing product
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="request">Product update details</param>
    /// <returns>Updated product details</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<ProductDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var sellerId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _productService.UpdateProductAsync(id, request, sellerId));
    }

    /// <summary>
    /// Delete product
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <returns>Deletion result</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.DeleteProductAsync(id, sellerId);
        return HandleUnitResult(result);
    }

    #endregion

    #region Seller Product Listing (Auth Required)

    /// <summary>
    /// Get seller's own products with pagination and filters
    /// </summary>
    /// <param name="request">Filter and pagination parameters</param>
    /// <returns>Paginated seller product listing</returns>
    [HttpGet("my-products")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<PagedResult<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetMyProducts([FromQuery] ProductFilterRequest request)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.GetSellerProductsAsync(sellerId, request);
        return HandleResult(result);
    }

    /// <summary>
    /// Get seller's specific product by ID
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <returns>Seller's product details</returns>
    [HttpGet("my-products/{id:guid}")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<ProductDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetMyProduct(Guid id)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.GetSellerProductByIdAsync(id, sellerId);
        return HandleResult(result);
    }

    #endregion

    #region Stock Management (Auth Required)

    /// <summary>
    /// Update product stock quantity
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="request">New stock quantity</param>
    /// <returns>Update result</returns>
    [HttpPut("{id:guid}/stock")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<ObjectResult> UpdateStock(Guid id, [FromBody] UpdateStockRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _productService.UpdateStockAsync(id, request.Stock, sellerId);
            return result.Match(
                Succ: _ => FinSucc<object>(new { success = true }),
                Fail: error => FinFail<object>(error)
            );
        });
    }

    /// <summary>
    /// Atomically decrement product stock (for order processing)
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="request">Quantity to decrement</param>
    /// <returns>Update result</returns>
    [HttpPut("{id:guid}/stock/atomic")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<ObjectResult> DecrementStockAtomic(Guid id, [FromBody] UpdateStockRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _productService.DecrementStockWithConcurrencyAsync(id, request.Stock, sellerId);
            return result.Match(
                Succ: _ => FinSucc<object>(new { success = true }),
                Fail: error => FinFail<object>(error)
            );
        });
    }

    /// <summary>
    /// Bulk restore stock for multiple products (for order cancellations)
    /// </summary>
    /// <param name="request">List of product IDs and quantities to restore</param>
    /// <returns>Update result</returns>
    [HttpPost("stock/bulk-restore")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<ObjectResult> BulkRestoreStock([FromBody] BulkRestoreStockRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var stockUpdates = request.Items.Select(item => (item.ProductId, item.Quantity)).ToList();
            var result = await _productService.BulkRestoreStockAsync(stockUpdates, sellerId);
            return result.Match(
                Succ: _ => FinSucc<object>(new { success = true }),
                Fail: error => FinFail<object>(error)
            );
        });
    }

    #endregion

    #region Image Management (Auth Required)

    /// <summary>
    /// Generate pre-signed URL for image upload
    /// </summary>
    /// <param name="fileName">Name of the file to upload</param>
    /// <returns>Pre-signed upload URL</returns>
    [HttpPost("upload-url")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<string>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(429)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GenerateImageUploadUrl([FromQuery][BindRequired] string fileName)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.GenerateImageUploadUrlAsync(fileName, sellerId);
        return HandleResult(result);
    }

    /// <summary>
    /// Add image to product
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="request">Image URLs to add</param>
    /// <returns>Update result</returns>
    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> AddProductImages(Guid id, [FromBody] List<string> imageUrls)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.UploadProductImagesAsync(id, imageUrls, sellerId);
        return HandleUnitResult(result);
    }

    /// <summary>
    /// Remove image from product
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="imageUrl">Image URL to remove</param>
    /// <returns>Update result</returns>
    [HttpDelete("{id:guid}/images")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> RemoveProductImage(Guid id, [FromQuery][BindRequired] string imageUrl)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.DeleteProductImageAsync(id, imageUrl, sellerId);
        return HandleUnitResult(result);
    }

    /// <summary>
    /// Confirm image upload to R2 storage
    /// </summary>
    /// <param name="request">Request containing R2 URL</param>
    /// <returns>Confirmation result</returns>
    [HttpPost("confirm-upload")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<string>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> ConfirmImageUpload([FromBody][BindRequired] ConfirmUploadRequest request)
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.ConfirmImagesUploadAsync(request.R2Url, sellerId);
        return HandleResult(result);
    }
    #endregion

    #region Additional Endpoints

    /// <summary>
    /// Get product with stock validation (for cart operations)
    /// </summary>
    /// <param name="id">Product identifier</param>
    /// <param name="quantity">Required quantity</param>
    /// <returns>Product details if sufficient stock available</returns>
    [HttpGet("{id:guid}/stock-check")]
    [ProducesResponseType<ServiceSuccess<ProductDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetProductWithStockCheck(Guid id, [FromQuery] int quantity)
    {
        var result = await _productService.GetWithStockCheckAsync(id, quantity);
        return HandleResult(result);
    }

    /// <summary>
    /// Get top selling products (for buyer view of seller pages)
    /// </summary>
    /// <param name="limit">Maximum results to return</param>
    /// <returns>List of top selling products</returns>
    [HttpGet("top-selling")]
    [ProducesResponseType<ServiceSuccess<List<ProductDto>>>(200)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetTopSellingProducts([FromQuery] int limit = 10)
    {
        var result = await _productService.GetTopSellingProductsAsync(limit);
        return HandleResult(result);
    }

    /// <summary>
    /// Get seller analytics (for seller dashboard)
    /// </summary>
    /// <returns>Product analytics data</returns>
    [HttpGet("analytics")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<ProductAnalyticsDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetAnalytics()
    {
        var sellerId = GetCurrentUserId();
        var result = await _productService.GetProductAnalyticsAsync(sellerId);
        return HandleResult(result);
    }

    #endregion
}