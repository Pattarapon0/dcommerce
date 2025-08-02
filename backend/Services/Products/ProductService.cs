using backend.Data.Products.Entities;
using backend.Data.Products;
using backend.DTO.Products;
using LanguageExt;
using System.Text.Json;
using LanguageExt.Common;
using static LanguageExt.Prelude;
using backend.Services.Images;
using backend.Common.Results;
using backend.Common.Mappers;
namespace backend.Services.Products;

public class ProductService(IProductRepository productRepository, IImageService imageService) : IProductService
{
    // Implement the methods defined in IProductService here
    // For example:
    private readonly IProductRepository _productRepository = productRepository;
    private readonly IImageService _imageService = imageService;


    public async Task<Fin<ProductDto>> CreateProductAsync(CreateProductRequest request, Guid sellerId)
    {
        var product = new Product
        {
            SellerId = sellerId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            BaseCurrency = request.Currency,
            Category = request.Category,
            Stock = request.Stock,
            Images = request.Images ?? []
        };
        var productIdFin = await _productRepository.CreateAsync(product);
        return productIdFin.BiMap(
            product => ProductMapper.MapToProductDto(product),
            err => err
        );
    }
    public async Task<Fin<ProductDto>> GetProductByIdAsync(Guid id)
    {
        var productFin = await _productRepository.GetByIdAsync(id);
        return productFin.BiMap(
            product => ProductMapper.MapToProductDto(product),
            err => err
        );
    }
    public async Task<Fin<PagedResult<ProductDto>>> GetProductsAsync(ProductSearchRequest request)
    {
        var productsFin = await _productRepository.GetPagedAsync(
            request.Page, request.PageSize, request.Category, request.MinPrice,
            request.MaxPrice, request.SearchTerm, request.SortBy, request.Ascending);

        return productsFin.BiMap(
            result => new PagedResult<ProductDto>
            {
                Items = ProductMapper.MapToProductDtos(result.Products),
                TotalCount = result.TotalCount
            },
            err => err
        );
    }
    public async Task<Fin<List<ProductDto>>> GetFeaturedProductsAsync(int limit = 10)
    {
        var productsFin = await _productRepository.GetFeaturedProductsAsync(limit);
        return productsFin.BiMap(
            products => ProductMapper.MapToProductDtos(products),
            err => err
        );
    }

    public async Task<Fin<List<ProductDto>>> SearchProductsAsync(string searchTerm, int limit = 50)
    {
        var productsFin = await _productRepository.SearchByNameAsync(searchTerm, limit);
        return productsFin.BiMap(
            products => ProductMapper.MapToProductDtos(products),
            err => err
        );
    }

    public async Task<Fin<List<ProductDto>>> GetAllSellerProductsAsync(Guid sellerId)
    {
        var productsFin = await _productRepository.GetBySellerIdAsync(sellerId);
        return productsFin.BiMap(
            products => ProductMapper.MapToProductDtos(products),
            err => err
        );
    }

    public async Task<Fin<PagedResult<ProductDto>>> GetSellerProductsAsync(Guid sellerId, ProductFilterRequest request)
    {
        var productsFin = await _productRepository.GetPagedBySellerAsync(sellerId, request);
        return productsFin.BiMap(
            result => new PagedResult<ProductDto>
            {
                Items = ProductMapper.MapToProductDtos(result.Products),
                TotalCount = result.TotalCount
            },
            err => err
        );
    }

    public async Task<Fin<ProductDto>> GetSellerProductByIdAsync(Guid productId, Guid sellerId)
    {
        var productFin = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        return productFin.BiMap(
            product => ProductMapper.MapToProductDto(product),
            err => err
        );
    }

    public async Task<Fin<List<ProductDto>>> GetRelatedProductsAsync(Guid productId, int limit = 5)
    {
        var productsFin = await _productRepository.GetRelatedProductsAsync(productId, limit);
        return productsFin.BiMap(
            products => products.Select(p => ProductMapper.MapToProductDto(p)).ToList(),
            err => err
        );
    }

    public async Task<Fin<ProductDto>> UpdateProductAsync(Guid productId, UpdateProductRequest request, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        var productDTO = product.BiMap(
            p => ProductMapper.MapToProductDto(p),
            err => err
        );
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
            return updatedProduct.BiMap(
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
                },
                err => err
            );
        }

    }

    public async Task<Fin<Unit>> DeleteProductAsync(Guid productId, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        var p = product.BiMap(
            p => Unit.Default,
            err => err
        );
        if (product.IsFail)
            return p;
        else
        {
            var deleteResult = await _productRepository.DeleteAsync(productId, sellerId);
            return deleteResult.BiMap(
                _ => Unit.Default,
                err => err
            );
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


    public async Task<Fin<string>> GenerateImageUploadUrlAsync(string fileName, Guid sellerId)
    {
        return await _imageService.GenerateUploadUrlAsync(fileName, sellerId);
    }

    public async Task<Fin<Unit>> UploadProductImagesAsync(Guid productId, List<string> imageUrls, Guid sellerId)
    {
        var product = await _productRepository.GetByIdAndSellerAsync(productId, sellerId);
        if (product.IsFail)
        {
            return product.BiMap(
                _ => Unit.Default,
                err => err
            );
        }
        var productValue = product.Match(
            p => p,
            err => throw new Exception(err.Message)
        );
        productValue.Images.AddRange(imageUrls);

        var result = await _productRepository.UpdateAsync(productValue);
        return result.BiMap(
            _ => Unit.Default,
            err => err
        );
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
            return product.BiMap(
                _ => Unit.Default,
                err => err
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
            return updateResult.BiMap(
                _ => Unit.Default,
                err => err
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
        return productsFin.BiMap(
            products => ProductMapper.MapToProductDtos(products),
            err => err
        );
    }

    public async Task<Fin<ProductDto>> GetWithStockCheckAsync(Guid productId, int requiredQuantity)
    {
        var productFin = await _productRepository.GetWithStockCheckAsync(productId, requiredQuantity);
        return productFin.BiMap(
            product => ProductMapper.MapToProductDto(product),
            err => err
        );
    }

    public async Task<Fin<Unit>> DecrementStockWithConcurrencyAsync(Guid productId, int quantity, Guid sellerId)
    {
        return await _productRepository.DecrementStockWithConcurrencyAsync(productId, quantity, sellerId);
    }
    
    public async Task<Fin<Unit>> BulkRestoreStockAsync(List<(Guid ProductId, int Quantity)> stockUpdates, Guid sellerId)
    {
        return await _productRepository.BulkRestoreStockAsync(stockUpdates, sellerId);
    }
}