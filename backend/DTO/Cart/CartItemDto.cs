using backend.Data.Products.Entities;

namespace backend.DTO.Cart;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }
    public int Quantity { get; set; }
    public int AvailableStock { get; set; }
    public bool IsInStock { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "THB";
    
    // Minimal product info needed for cart functionality
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string? ProductImageUrl { get; set; }
    
    // Minimal seller info needed for cart grouping
    public string SellerName { get; set; } = string.Empty;
}