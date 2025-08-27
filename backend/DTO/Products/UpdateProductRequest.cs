using backend.Data.Products.Entities;

namespace backend.DTO.Products;

public record UpdateProductRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? Price { get; init; }
    public ProductCategory? Category { get; init; }
    public int? Stock { get; init; }
    public string[]? Images { get; init; }
    public bool? IsActive { get; init; }

    /// <summary>
    /// Determines if any field has been provided for update
    /// </summary>
    public bool HasChanges => 
        Name is not null || 
        Description is not null || 
        Price is not null || 
        Category is not null || 
        Stock is not null || 
        Images is not null || 
        IsActive is not null;
}