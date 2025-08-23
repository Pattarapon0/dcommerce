using backend.Data.Products.Entities;

namespace backend.DTO.Products;

public record ProductDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string BaseCurrency { get; init; } = string.Empty;
    public ProductCategory Category { get; init; }
    public int Stock { get; init; }
    public List<string> Images { get; init; } = [];
    public string MainImage { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public Guid SellerId { get; init; }
    public string SellerName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public int SalesCount { get; init; }
}
