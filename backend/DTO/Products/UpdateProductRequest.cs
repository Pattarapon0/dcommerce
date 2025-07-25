using backend.Data.Products.Entities;

namespace backend.DTO.Products;

public record UpdateProductRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? Price { get; init; }
    public ProductCategory? Category { get; init; }
    public int? Stock { get; init; }
    public List<string>? Images { get; init; }
}