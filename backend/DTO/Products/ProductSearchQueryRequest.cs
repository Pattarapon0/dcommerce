using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Products;

public class ProductSearchQueryRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(100)]
    public required string Term { get; set; }

    [Range(1, 100)]
    public int Limit { get; set; } = 50;
}