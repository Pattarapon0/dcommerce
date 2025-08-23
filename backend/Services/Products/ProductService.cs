using backend.Data.Products.Entities;
using backend.Data.Products;
using backend.DTO.Products;
using LanguageExt;
using static LanguageExt.Prelude;
using backend.Services.Images;
using backend.Common.Results;
using backend.Common.Config;
using Microsoft.Extensions.Options;
namespace backend.Services.Products;

public class ProductService(IProductRepository productRepository, IImageService imageService, IOptions<ImageUploadOptions> uploadOptions) : IProductService
{
    // Implement the methods defined in IProductService here
    // For example:
    private readonly IProductRepository _productRepository = productRepository;
    private readonly IImageService _imageService = imageService;
    private readonly ImageUploadOptions _uploadOptions = uploadOptions.Value;

    public Task<Fin<ProductDto>> CreateProductAsync(CreateProductRequest request, Guid sellerId)
    {
        return FinT<IO, string[]>.Lift(liftIO(() => _imageService.ConfirmBatchUploadAsync([..request.Images], sellerId))).Map(productimgs => 
        new Product
        {
            SellerId = sellerId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            BaseCurrency = request.Currency,
            Category = request.Category,
            Stock = request.Stock,
            Images = productimgs.ToList() ?? [],
            IsActive = request.IsActive
        }).Bind<Product>(product => liftIO(() => _productRepository.CreateAsync(product))).Map(MapToProductDto).Run().Run().AsTask();
    }
    public async Task<Fin<ProductDto>> GetProductByIdAsync(Guid id)
    {
        var productFin = await _productRepository.GetByIdAsync(id);
        return productFin.Map(MapToProductDto);
    }
    public async Task<Fin<PagedResult<ProductDto>>> GetProductsAsync(ProductSearchRequest request)
    {
        var productsFin = await _productRepository.GetPagedAsync(
            request.Page, request.PageSize, request.Category, request.MinPrice,
            request.MaxPrice, request.SearchTerm, request.SortBy, request.Ascending);

        return productsFin.Map(
            result => new PagedResult<ProductDto>
            {
                Items = MapToProductDtos(result.Products),
                TotalCount = result.TotalCount
            }
        );
    }
    public async Task<Fin<List<ProductDto>>> GetFeaturedProductsAsync(int limit = 10)
    {
        var productsFin = await _productRepository.GetFeaturedProductsAsync(limit);
        return productsFin.Map(MapToProductDtos);
    }

    public async Task<Fin<List<ProductDto>>> SearchProductsAsync(string searchTerm, int limit = 50)
    {
        var productsFin = await _productRepository.SearchByNameAsync(searchTerm, limit);
        return productsFin.Map(MapToProductDtos);
    }

    public async Task<Fin<List<ProductDto>>> GetAllSellerProductsAsync(Guid sellerId, bool includeInactive = true)
    {
        var productsFin = await _productRepository.GetBySellerIdAsync(sellerId, includeInactive);
        return productsFin.Map(MapToProductDtos);
    }
    public async Task<Fin<PagedResult<ProductDto>>> GetSellerProductsAsync(Guid sellerId, ProductFilterRequest request)
    {
        var productsFin = await _productRepository.GetPagedBySellerAsync(sellerId, request);
        return productsFin.BiMap(
            result => new PagedResult<ProductDto>
            {
                Items = MapToProductDtos(result.Products),
                TotalCount = result.TotalCount
            },
            err => err
        );
    }

    public async Task<Fin<ProductDto>> GetSellerProductByIdAsync(Guid productId, Guid sellerId)
    {
        var productFin = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        return productFin.Map(MapToProductDto);
    }

    public async Task<Fin<List<ProductDto>>> GetRelatedProductsAsync(Guid productId, int limit = 5)
    {
        var productsFin = await _productRepository.GetRelatedProductsAsync(productId, limit);
        return productsFin.Map(products => products.Select(p => MapToProductDto(p)).ToList());
    }

    public async Task<Fin<ProductDto>> UpdateProductAsync(Guid productId, UpdateProductRequest request, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        var productDTO = product.Map(MapToProductDto);
        if (product.IsFail)
            return productDTO;
        else
        {
            var productValue = product.Match(
                p => p,
                err => throw new Exception(err.Message)
            );
            productValue.Name = request.Name ?? productValue.Name;
            productValue.Description = request.Description ?? productValue.Description;
            productValue.Price = request.Price ?? productValue.Price;
            productValue.Category = request.Category ?? productValue.Category;
            productValue.Stock = request.Stock ?? productValue.Stock;
            if (request.Images != null)
                productValue.Images = request.Images;

            var updatedProduct = await _productRepository.UpdateAsync(productValue);
            return updatedProduct.Map(
                p =>
                {
                    var newProductDto = new ProductDto
                    {
                        Id = p.Id,
                        SellerId = p.SellerId,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        Category = p.Category,
                        Stock = p.Stock,
                        Images = p.Images
                    };
                    return newProductDto;
                }
            );
        }

    }

    public async Task<Fin<Unit>> DeleteProductAsync(Guid productId, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        var p = product.Map(_ => Unit.Default);
        if (product.IsFail)
            return p;
        else
        {
            var deleteResult = await _productRepository.DeleteAsync(productId, sellerId);
            return deleteResult.Map(_ => Unit.Default);
        }
    }

    public async Task<Fin<bool>> HasSufficientStockAsync(Guid productId, int quantity)
    {
        return await _productRepository.HasSufficientStockAsync(productId, quantity);
    }

    public async Task<Fin<Unit>> UpdateStockAsync(Guid productId, int newStock, Guid sellerId)
    {


        return await _productRepository.UpdateStockAsync(productId, newStock, sellerId);
    }

    public async Task<Fin<Unit>> DecrementStockAsync(Guid productId, int quantity, Guid sellerId)
    {
        return await _productRepository.DecrementStockAsync(productId, quantity, sellerId);
    }
    public async Task<Fin<BatchUploadUrlResponse>> GenerateBatchImageUploadUrlsAsync(List<string> fileNames, Guid sellerId)
    {
        return await _imageService.GenerateBatchUploadUrlsAsync(fileNames, sellerId, "product");
    }

    public async Task<Fin<Unit>> UploadProductImagesAsync(Guid productId, List<string> imageUrls, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        if (product.IsFail)
        {
            return product.Map(_ => Unit.Default);
        }
        var productValue = product.Match(
            p => p,
            err => throw new Exception(err.Message)
        );
        productValue.Images.AddRange(imageUrls);

        var result = await _productRepository.UpdateAsync(productValue);
        return result.Map(_ => Unit.Default);
    }

    public async Task<Fin<string>> ConfirmImagesUploadAsync(string r2url, Guid sellerId)
    {
        return await _imageService.ConfirmUploadAsync(r2url, sellerId);
    }
    public async Task<Fin<Unit>> DeleteProductImageAsync(Guid productId, string imageUrl, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        if (product.IsFail)
        {
            return product.Map(
                _ => Unit.Default
            );
        }
        var productValue = product.Match(
            p => p,
            err => throw new Exception(err.Message)
        );
        if (!productValue.Images.Contains(imageUrl))
        {
            return FinFail<Unit>(ServiceError.NotFound("image", imageUrl));
        }
        productValue.Images.Remove(imageUrl);
        var updateResult = await _productRepository.UpdateAsync(productValue);
        if (updateResult.IsFail)
        {
            return updateResult.Map(
                _ => Unit.Default
            );
        }
        return await _imageService.DeleteImageAsync(imageUrl);

    }

    public async Task<Fin<ProductAnalyticsDto>> GetProductAnalyticsAsync(Guid sellerId)
    {
        return await _productRepository.GetProductAnalyticsAsync(sellerId);
    }

    public async Task<Fin<List<ProductDto>>> GetTopSellingProductsAsync(int limit = 10)
    {
        var productsFin = await _productRepository.GetTopSellingProductsAsync(limit);
        return productsFin.Map(MapToProductDtos);
    }

    // Product Status Management
    public async Task<Fin<Unit>> ToggleProductStatusAsync(Guid productId, Guid sellerId)
    {
        return await _productRepository.ToggleActiveStatusAsync(productId, sellerId);
    }
    public async Task<Fin<ProductDto>> GetWithStockCheckAsync(Guid productId, int requiredQuantity)
    {
        var productFin = await _productRepository.GetWithStockCheckAsync(productId, requiredQuantity);
        return productFin.Map(MapToProductDto);
    }

    public async Task<Fin<Unit>> DecrementStockWithConcurrencyAsync(Guid productId, int quantity, Guid sellerId)
    {
        return await _productRepository.DecrementStockWithConcurrencyAsync(productId, quantity, sellerId);
    }

    public async Task<Fin<Unit>> BulkRestoreStockAsync(List<(Guid ProductId, int Quantity)> stockUpdates, Guid sellerId)
    {
        return await _productRepository.BulkRestoreStockAsync(stockUpdates, sellerId);
    }

    private static ProductDto MapToProductDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            BaseCurrency = product.BaseCurrency,
            Category = product.Category,
            Stock = product.Stock,
            Images = product.Images,
            SellerId = product.SellerId,
            MainImage = product.Images?.FirstOrDefault() ?? string.Empty,
            SellerName = product.Seller?.SellerProfile?.BusinessName ?? string.Empty,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt ?? product.CreatedAt,
            SalesCount = product.SalesCount,
            IsActive = product.IsActive
        };
    }

    private static List<ProductDto> MapToProductDtos(List<Product> products)
    {
        return products.Select(MapToProductDto).ToList();
    }
}