using backend.Data.Products.Entities;
using backend.DTO.Products;

namespace backend.Common.Mappers;

public static class ProductMapper
{
    public static ProductDto MapToProductDto(Product product)
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

    public static List<ProductDto> MapToProductDtos(List<Product> products)
    {
        return products.Select(MapToProductDto).ToList();
    }
}