using backend.Data.Products.Entities;
namespace backend.DTO.Products;

public record CreateProductRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Currency { get; init; } = "THB"; // Default to Thai Baht
    public ProductCategory Category { get; init; }    public int Stock { get; init; }
    public List<string> Images { get; init; } = [];
}
