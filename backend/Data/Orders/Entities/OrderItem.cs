using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using server.Data.Common;

namespace server.Data.Orders.Entities;


[Index(nameof(OrderId), IsUnique = false)]
[Index(nameof(ProductId), IsUnique = false)]
[Index(nameof(SellerId), IsUnique = false)]
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }

    [Required]
    public string ProductName { get; set; } = string.Empty;
    [Required]
    public string ProductImageUrl { get; set; } = string.Empty;
    [Required]
    [Precision(18, 2)]
    public decimal PriceAtOrderTime { get; set; }
    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a positive integer.")]
    public int Quantity { get; set; }
    [Required]
    [Precision(18, 2)]
    public decimal LineTotal { get; set; }
    
    public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;
    public virtual Order Order { get; set; } = null!;
    public virtual Products.Entities.Product Product { get; set; } = null!;
}

public enum OrderItemStatus
{
    Pending,      // Order placed, awaiting seller confirmation
    Processing,   // Seller confirmed, preparing item
    Shipped,      // Item shipped by seller
    Delivered,    // Item delivered to customer
    Cancelled     // Item cancelled (by seller or system)
}
