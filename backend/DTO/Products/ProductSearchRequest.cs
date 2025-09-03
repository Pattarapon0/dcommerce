using backend.Data.Products.Entities;

namespace backend.DTO.Products;

public record

ProductSearchRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public ProductCategory? Category { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; } = "CreatedAt";
    public bool Ascending { get; init; } = false;
    public bool? InStockOnly { get; init; }
}