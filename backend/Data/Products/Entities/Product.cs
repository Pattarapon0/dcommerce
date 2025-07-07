using server.Data.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using server.Data.Cart.Entities;
using server.Data.Orders.Entities;
using Microsoft.EntityFrameworkCore;

namespace server.Data.Products.Entities;

public enum ProductCategory
{
    Electronics = 0,
    Clothing = 1,
    Books = 2,
    Home = 3,
    Sports = 4,
    Other = 5
}

public class Product : BaseEntity
{
    [Required]
    public Guid SellerId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Precision(18, 2)]
    [Range(0, double.MaxValue, ErrorMessage = "Value must be greater than or equal to 0")]
    public decimal Price { get; set; }

    [Required]
    public ProductCategory Category { get; set; } = ProductCategory.Other;

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stock must be greater than or equal to 0")]
    public int Stock { get; set; } = 0;
    public string ImageUrls { get; set; } = string.Empty; // JSON array of image URLs

    private static List<string> SafeDeserialize(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<string[]>(json ?? "[]")?.ToList() ?? [];
        }
        catch
        {
            return [];
        }
    }

    [NotMapped]
    public List<string> Images
    {
        get => SafeDeserialize(ImageUrls);
        set => ImageUrls = JsonSerializer.Serialize(value);
    }


    [NotMapped]
    public string MainImage => Images.FirstOrDefault() ?? "";

    [Required]
    public bool IsActive { get; set; } = true;
    public virtual User.Entities.User Seller { get; set; } = null!;
    public virtual ICollection<CartItem> CartItems { get; set; } = [];
    public virtual ICollection<OrderItem> OrderItems { get; set; } = [];

}