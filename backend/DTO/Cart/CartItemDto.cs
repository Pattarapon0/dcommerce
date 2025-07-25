using backend.Data.Products.Entities;

namespace backend.DTO.Cart;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public List<string> ProductImages { get; set; } = new();
    public ProductCategory ProductCategory { get; set; }
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int AvailableStock { get; set; }
    public bool IsInStock { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}